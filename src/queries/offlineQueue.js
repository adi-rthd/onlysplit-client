import { Filesystem, Directory } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import toast from 'react-hot-toast';
import expenseService from '../services/expenseService';
import groupService from '../services/groupService';
import settlementService from '../services/settlementService';

const QUEUE_FILE = 'offline-mutation-queue.json';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRIES = 3;

/**
 * Detects whether Capacitor native APIs are available.
 * Returns true on native (iOS/Android), false in plain browser.
 */
function isCapacitorNative() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.Capacitor &&
      window.Capacitor.isNativePlatform &&
      window.Capacitor.isNativePlatform()
    );
  } catch {
    return false;
  }
}

/**
 * OfflineQueue — Persists pending mutations when the device is offline
 * and replays them in FIFO order upon reconnection.
 *
 * Persistence:
 *  - Native (Capacitor): Filesystem plugin → Data directory
 *  - Web fallback: localStorage
 *
 * Requirements: 8.1, 8.2, 8.3, 8.5, 8.7
 */
export class OfflineQueue {
  constructor(queryClient) {
    this.queryClient = queryClient;
    this.queue = [];
    this.isProcessing = false;
    this.listeners = new Set();
    this._networkListenerHandle = null;
  }

  /**
   * Initializes the queue: loads persisted mutations from disk
   * and registers a network status listener to auto-process on reconnect.
   */
  async init() {
    await this.loadFromDisk();

    try {
      this._networkListenerHandle = await Network.addListener(
        'networkStatusChange',
        (status) => {
          if (status.connected && this.queue.length > 0) {
            this.processQueue();
          }
        }
      );
    } catch {
      // Network plugin not available (e.g. unit tests or unsupported env)
      // Gracefully degrade — queue still works, just no auto-replay on reconnect
      if (import.meta.env.DEV) {
        console.warn('[OfflineQueue] Network listener unavailable — auto-replay disabled');
      }
    }
  }

  /**
   * Adds a mutation to the queue and persists to disk.
   * Throws if the queue is full (50 mutations max).
   *
   * @param {object} mutation - { type: string, payload: object, groupId?: string }
   *   type: one of 'createExpense', 'updateExpense', 'deleteExpense',
   *         'createGroup', 'updateGroup', 'recordSettlement', etc.
   *   payload: the data needed to execute the mutation
   *   groupId: optional context for invalidation after replay
   */
  async enqueue(mutation) {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      throw new Error('Offline queue is full (max 50 mutations). Please wait for connectivity to sync pending changes.');
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: mutation.type,
      payload: mutation.payload,
      groupId: mutation.groupId || null,
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    this.queue.push(entry);
    await this.persistToDisk();
    this.notifyListeners();
  }

  /**
   * Processes the queue in FIFO order. Each mutation is attempted one at a time.
   * On 409 conflict or after MAX_RETRIES failures, the mutation is skipped.
   * Processing stops on non-conflict errors (will retry on next network restore).
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const mutation = this.queue[0];

        try {
          await this.executeMutation(mutation);
          // Success — remove from queue
          this.queue.shift();
          await this.persistToDisk();
          this.notifyListeners();
        } catch (err) {
          const isConflict = err?.status === 409;
          const maxRetriesExceeded = mutation.retries >= MAX_RETRIES;

          if (isConflict || maxRetriesExceeded) {
            // Skip this mutation — notify user and continue
            this.queue.shift();
            await this.persistToDisk();
            this.notifyListeners();

            const reason = isConflict
              ? 'Server conflict (data was modified by another user)'
              : `Failed after ${MAX_RETRIES} retries`;

            toast.error(
              `Offline sync failed for ${mutation.type}: ${reason}`,
              { duration: 6000 }
            );

            if (import.meta.env.DEV) {
              console.warn(
                `[OfflineQueue] Skipped mutation ${mutation.id} (${mutation.type}): ${reason}`,
                mutation
              );
            }
          } else {
            // Transient error — increment retries and stop processing
            mutation.retries++;
            await this.persistToDisk();
            break;
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Number of mutations waiting to be synced.
   */
  get pendingCount() {
    return this.queue.length;
  }

  /**
   * Subscribe to queue changes. Listener receives the current pending count.
   * @param {function} listener - called with (pendingCount) on changes
   * @returns {function} unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of the current queue length.
   */
  notifyListeners() {
    const count = this.queue.length;
    this.listeners.forEach((fn) => {
      try {
        fn(count);
      } catch {
        // Don't let listener errors break the queue
      }
    });
  }

  /**
   * Persist the queue to device storage.
   * Uses Capacitor Filesystem on native, localStorage as web fallback.
   */
  async persistToDisk() {
    const json = JSON.stringify(this.queue);

    if (isCapacitorNative()) {
      try {
        await Filesystem.writeFile({
          path: QUEUE_FILE,
          data: json,
          directory: Directory.Data,
          encoding: 'utf8',
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[OfflineQueue] Failed to persist to Filesystem:', err);
        }
      }
    } else {
      // Web fallback
      try {
        localStorage.setItem(QUEUE_FILE, json);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[OfflineQueue] Failed to persist to localStorage:', err);
        }
      }
    }
  }

  /**
   * Load the queue from device storage.
   * Uses Capacitor Filesystem on native, localStorage as web fallback.
   */
  async loadFromDisk() {
    if (isCapacitorNative()) {
      try {
        const result = await Filesystem.readFile({
          path: QUEUE_FILE,
          directory: Directory.Data,
          encoding: 'utf8',
        });
        const parsed = JSON.parse(result.data);
        if (Array.isArray(parsed)) {
          this.queue = parsed;
        } else {
          this.queue = [];
        }
      } catch {
        // File doesn't exist yet or parse error — start with empty queue
        this.queue = [];
      }
    } else {
      // Web fallback
      try {
        const stored = localStorage.getItem(QUEUE_FILE);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.queue = Array.isArray(parsed) ? parsed : [];
        } else {
          this.queue = [];
        }
      } catch {
        this.queue = [];
      }
    }
  }

  /**
   * Execute a single mutation by dispatching to the appropriate service method.
   * @param {object} mutation - queue entry with type, payload, groupId
   */
  async executeMutation(mutation) {
    const { type, payload } = mutation;

    switch (type) {
      case 'createExpense':
        return expenseService.createExpense(payload);

      case 'updateExpense':
        return expenseService.updateExpense(payload.id, payload.data);

      case 'deleteExpense':
        return expenseService.deleteExpense(payload.id);

      case 'createGroup':
        return groupService.createGroup(payload);

      case 'updateGroup':
        return groupService.updateGroup(payload.id, payload.data);

      case 'deleteGroup':
        return groupService.deleteGroup(payload.id);

      case 'recordSettlement':
        return settlementService.recordSettlement
          ? settlementService.recordSettlement(payload)
          : Promise.resolve();

      default:
        if (import.meta.env.DEV) {
          console.warn(`[OfflineQueue] Unknown mutation type: ${type}`);
        }
        // Skip unknown mutation types gracefully
        return Promise.resolve();
    }
  }

  /**
   * Cleanup: remove the network listener. Call on app teardown if needed.
   */
  async destroy() {
    if (this._networkListenerHandle) {
      try {
        await this._networkListenerHandle.remove();
      } catch {
        // Ignore cleanup errors
      }
      this._networkListenerHandle = null;
    }
  }
}
