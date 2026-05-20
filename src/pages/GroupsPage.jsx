import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel } from '../components/ui/GlassCard';
import { Bell, Plus, Users, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGroupStore } from '../store/groupStore';
import GroupCard from '../components/ui/GroupCard';
import { ROUTES } from '../constants/routes';
import { formatCurrency } from '../services/currencyService';
import InviteGroupStore from '../services/groupInviteService';
import GlowButton from '../components/ui/GlowButton';

const GroupsPage = () => {
  const navigate = useNavigate();
  const [groupInvites, setGroupInvites] = useState([]);

  const { groups, isLoading, fetchGroups } = useGroupStore();

  const loadData = async () => {
    setLoading(true);

    try {
      const invitesData = await InviteGroupStore.getGroupInvites(groupId)
      setGroupInvites(
        invitesData || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const totalGroups = groups?.length || 0;

  const totalSpending = useMemo(() => {
    if (!groups || groups.length === 0) return 0;

    return groups.reduce((acc, group) => {
      return acc + Number(group.totalExpenses || group.totalSpending || 0);
    }, 0);
  }, [groups]);

  // const renderSpendingTotals = () => {
  //   const entries = Object.entries(currencyTotals);
  //   if (isLoading || entries.length === 0) return <div className="text-[32px] font-bold text-on-surface mb-1">--</div>;
  //   return (
  //     <div className="space-y-1 mb-2">
  //       {entries.map(([currency, total]) => (
  //         <div key={currency} className="text-[28px] md:text-[32px] font-bold text-on-surface leading-none">
  //           {formatCurrency(total, currency)}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Your Groups</h1>
          <p className="text-on-surface-variant">Manage your shared expenses and groups.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <GlowButton
            className='min-w-[140px] h-[82px] border border-[#4F46FF]'
            icon={Plus}
            onClick={() =>
              navigate(ROUTES.CREATE_GROUP)
            }
          >
            Create Group
          </GlowButton>
          <GlowButton
            className='min-w-[140px] h-[82px] border border-[#4F46FF]'
            icon={Plus}
            onClick={() =>
              navigate(ROUTES.FRIEND_MODAL)
            }
          >
            Add Friends
          </GlowButton>
          <button

            onClick={() =>
              navigate(ROUTES.INVITE_MODAL.replace(':id', 'bell'))
            }
            className="relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container-low border border-glass-stroke text-on-surface hover:bg-white/5 transition-all font-medium"
          >
            <Bell size={18} />

            <span className="hidden sm:block">
              Invites
            </span>

            {groupInvites.length > 0 && (
              <>
                {/* Pulse */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />

                {/* Dot */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-yellow-400" />

                {/* Count */}
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-semibold">
                  {groupInvites.length}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassPanel className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">ACTIVE GROUPS</span>
            <Users className="text-primary" size={24} />
          </div>
          <div className="text-[32px] font-bold text-on-surface mb-1">
            {isLoading ? '--' : totalGroups}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">TOTAL GROUP SPENDING</span>
            <Utensils className="text-error" size={24} />
          </div>
          <div className="text-[32px] font-bold text-on-surface mb-1">
            {isLoading ? '--' : formatCurrency(totalSpending, 'INR')}
          </div>
        </GlassPanel>
      </div>

      {/* GROUPS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-full py-10 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : !groups || groups.length === 0 ? (
          <GlassPanel className="col-span-full p-12 text-center flex flex-col items-center justify-center border border-dashed border-glass-stroke">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
              <Users className="text-on-surface-variant" size={24} />
            </div>
            <h4 className="text-lg font-medium mb-2">No groups yet</h4>
            <p className="text-on-surface-variant text-sm mb-6 max-w-sm mx-auto">
              Create your first expense group to start tracking shared expenses with friends, family, or roommates.
            </p>
            <button
              onClick={() => navigate(ROUTES.CREATE_GROUP)}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium"
            >
              Create Group
            </button>
          </GlassPanel>
        ) : (
          groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))
        )}
      </div>

      {/* MOBILE FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(ROUTES.CREATE_GROUP)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary-container to-inverse-primary rounded-full flex items-center justify-center shadow-lg neon-glow z-50"
      >
        <Plus className="text-white" size={28} />
      </motion.button>
    </>
  );
};

export default GroupsPage;