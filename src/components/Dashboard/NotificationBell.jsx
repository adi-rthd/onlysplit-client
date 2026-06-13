import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useInvitationStore } from '../../store/groupInvitationStore';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  const notificationRef = useRef(null);
  const { notifications, fetchNotifications, markAllNotificationsAsRead } = useInvitationStore();
  const handleReadNotification = async () => {
    setOpen(!open)
    await markAllNotificationsAsRead();
  }
  const timeAgo = (dateString, now) => {
    const date = new Date(dateString);

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} year${years > 1 ? 's' : ''} ago`;
  };
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const count =
    notifications?.filter(
      notification => !notification.isRead
    ).length || 0;
  return (
    <div className="relative" ref={notificationRef}>
      {/* Bell */}
      <button
        onClick={() => handleReadNotification()}
        className=" relative flex items-center justify-center w-11 h-11 rounded-2xl bg-surface-container-low border border-glass-stroke hover:bg-white/5 transition-all "
      >
        <motion.div
          animate={
            count > 0
              ? {
                rotate: [0, 15, -15, 10, -10, 0],
              }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="origin-top"
        >
          <Bell
            size={20}
            className={
              count > 0
                ? 'text-primary'
                : 'text-white/80'
            }
          />
        </motion.div>

        {/* Count */}
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              absolute -top-1 -right-1
              min-w-[18px] h-[18px]
              px-1 rounded-full
              bg-primary text-white
              text-[10px] font-semibold
              flex items-center justify-center
              shadow-lg
            "
          >
            {count}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.96,
            }}
            transition={{
              duration: 0.18,
            }}
            className="
              absolute right-0 mt-3
              w-[340px] max-w-[calc(100vw-2rem)]
              rounded-2xl
              border border-glass-stroke
              bg-[#111]
              shadow-2xl
              overflow-hidden
              z-50
              backdrop-blur-xl
            "
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="font-semibold text-white">
                Notifications
              </h3>
            </div>

            {/* Notifications */}
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden hide-scrollbar">
              {notifications?.length > 0 ? (
                notifications.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="
                      px-4 py-3
                      border-b border-white/5
                      hover:bg-white/5
                      transition-colors
                      cursor-pointer
                    "
                  >
                    <p className="text-sm text-white">
                      {item.message}
                    </p>

                    <span className="text-xs text-white/40">
                      {timeAgo(item.createdAt, now)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-white/50 text-sm">
                  No notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}