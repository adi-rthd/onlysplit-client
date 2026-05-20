import React, {
  useEffect,
} from 'react';

import {
  Filter,
  Receipt,
  Banknote,
  Users,
  Wallet,
} from 'lucide-react';

import {
  GlassPanel,
} from '../components/ui/GlassCard';

import {
  useActivityStore,
} from '../store/activityStore';

import {
  formatCurrency,
} from '../services/currencyService';

const ActivityFeed = () => {
  const {
    activities,
    isLoading,
    fetchActivities,
  } = useActivityStore();

  useEffect(() => {
    fetchActivities();
  }, []);

  const getIcon = type => {
    switch (
      type?.toLowerCase()
    ) {
      case 'expensecreated':
        return Receipt;

      case 'paymentcompleted':
        return Wallet;

      case 'settlementcreated':
        return Banknote;

      default:
        return Users;
    }
  };

  const getIconStyles = type => {
    switch (
      type?.toLowerCase()
    ) {
      case 'expensecreated':
        return 'bg-primary/10 border-primary/30 text-primary';

      case 'paymentcompleted':
        return 'bg-neon-lime/10 border-neon-lime/30 text-neon-lime';

      case 'settlementcreated':
        return 'bg-warning/10 border-warning/30 text-warning';

      default:
        return 'bg-white/5 border-white/10 text-on-surface';
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-on-surface">
            Recent Activity
          </h1>

          <p className="mt-2 text-on-surface-variant">
            All your global interactions across groups.
          </p>
        </div>

        <button className="glass-card flex items-center gap-2 rounded-2xl px-5 py-3 text-sm">
          <Filter size={18} />

          Date
        </button>
      </div>

      <div className="relative space-y-8 before:absolute before:bottom-0 before:left-[27px] before:top-0 before:w-px before:bg-white/10">
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-full border border-white/10 bg-surface-container-high px-4 py-1 text-[10px] font-bold tracking-[0.2em] text-on-surface">
            TODAY
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : activities.length >
          0 ? (
          activities.map(
            activity => {
              const Icon =
                getIcon(
                  activity.type
                );

              return (
                <div
                  key={
                    activity.id
                  }
                  className="relative flex gap-6"
                >
                  <div
                    className={`z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${getIconStyles(
                      activity.type
                    )}`}
                  >
                    <Icon
                      size={24}
                    />
                  </div>

                  <GlassPanel className="flex-1 rounded-3xl p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.03]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-on-surface">
                          {activity.title ||
                            activity.description ||
                            'Activity'}
                        </h3>

                        <p className="mt-2 text-sm text-on-surface-variant">
                          {
                            activity.groupName
                          }
                        </p>

                        <p className="mt-3 text-xs text-on-surface-variant">
                          {new Date(
                            activity.createdAt
                          ).toLocaleString(
                            'en-IN',
                            {
                              dateStyle:
                                'medium',
                              timeStyle:
                                'short',
                            }
                          )}
                        </p>
                      </div>

                      {activity.amount && (
                        <div className="text-right">
                          <p className="font-data-mono text-3xl font-black text-on-surface">
                            {formatCurrency(
                              Number(
                                activity.amount
                              ),
                              activity.currency ||
                                'INR'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </GlassPanel>
                </div>
              );
            }
          )
        ) : (
          <GlassPanel className="rounded-3xl py-20 text-center">
            <Users
              size={42}
              className="mx-auto mb-4 text-on-surface-variant"
            />

            <h3 className="text-xl font-bold">
              No activity yet
            </h3>

            <p className="mt-2 text-sm text-on-surface-variant">
              Your recent actions will appear here.
            </p>
          </GlassPanel>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;