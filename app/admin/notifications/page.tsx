'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Megaphone, 
  PaperPlaneRight, 
  Users, 
  User, 
  UsersThree,
  Bell, 
  CheckCircle, 
  Info, 
  Warning, 
  Coins,
  Clock,
  Trash
} from '@phosphor-icons/react';

export interface DbNotification {
  id: string;
  partner_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reward';
  points_badge?: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const { partners } = useAdminStore();
  const [targetType, setTargetType] = useState<'all' | 'specific' | 'team'>('all');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'reward'>('info');
  const [pointsBadge, setPointsBadge] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [sentHistory, setSentHistory] = useState<DbNotification[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Filter team leaders for dropdown
  const teamLeaders = partners.filter((p) => p.role === 'team_leader' || p.teamCode);

  // Fetch real notification history from Supabase
  const fetchHistory = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSentHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch notification history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Title and message content are required.' });
      return;
    }

    if (targetType === 'specific' && !selectedPartnerId) {
      setFeedbackMsg({ type: 'error', text: 'Please select a target partner.' });
      return;
    }

    if (targetType === 'team' && !selectedTeamLeaderId) {
      setFeedbackMsg({ type: 'error', text: 'Please select a team leader / network.' });
      return;
    }

    setIsSending(true);
    setFeedbackMsg(null);

    try {
      const { supabase } = await import('@/lib/supabase');

      if (targetType === 'team') {
        // Fetch all sub-members under this team leader + team leader's own profile
        const { data: teamProfData } = await supabase
          .from('profiles')
          .select('id')
          .or(`id.eq.${selectedTeamLeaderId},referred_by_leader_id.eq.${selectedTeamLeaderId}`);

        const recipientIds = (teamProfData || []).map((p) => p.id);
        if (recipientIds.length === 0) recipientIds.push(selectedTeamLeaderId);

        const rowsToInsert = recipientIds.map((pid) => ({
          partner_id: pid,
          title: title.trim(),
          message: message.trim(),
          type: notifType,
          points_badge: pointsBadge.trim() || null,
          is_read: false,
        }));

        const { error } = await supabase.from('notifications').insert(rowsToInsert);
        if (error) {
          setFeedbackMsg({ type: 'error', text: 'Failed to send team notification: ' + error.message });
        } else {
          setFeedbackMsg({ type: 'success', text: `Notification dispatched live to all ${recipientIds.length} members of the team network!` });
          setTitle('');
          setMessage('');
          setPointsBadge('');
          fetchHistory();
        }
      } else {
        const { error } = await supabase.from('notifications').insert([
          {
            partner_id: targetType === 'all' ? null : selectedPartnerId,
            title: title.trim(),
            message: message.trim(),
            type: notifType,
            points_badge: pointsBadge.trim() || null,
            is_read: false,
          },
        ]);

        if (error) {
          setFeedbackMsg({ type: 'error', text: 'Failed to send notification: ' + error.message });
        } else {
          setFeedbackMsg({ type: 'success', text: 'Notification sent successfully to partner network!' });
          setTitle('');
          setMessage('');
          setPointsBadge('');
          fetchHistory();
        }
      }
    } catch (err) {
      console.error('Notification send error:', err);
      setFeedbackMsg({ type: 'error', text: 'An unexpected error occurred while sending.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-[var(--navy)]" weight="fill" />
          Broadcast & Realtime Notification Dispatcher
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Send real-time portal announcements, reward point alerts, and direct messages to partners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Dispatch Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-6">
            <h2 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-gray-100 pb-3 flex items-center gap-2">
              <PaperPlaneRight size={20} className="text-[var(--navy)]" /> Dispatch New Notification
            </h2>

            {feedbackMsg && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* Target Audience Selector (3 Options) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      targetType === 'all'
                        ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users size={16} />
                    <span>All Partners</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('specific')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      targetType === 'specific'
                        ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <User size={16} />
                    <span>Specific Partner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('team')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      targetType === 'team'
                        ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UsersThree size={16} />
                    <span>Entire Team</span>
                  </button>
                </div>
              </div>

              {/* Select Partner Dropdown (if specific) */}
              {targetType === 'specific' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Select Recipient Partner *
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                  >
                    <option value="">-- Choose Partner from Directory --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email} • {p.profession})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Select Team Leader Dropdown (if team) */}
              {targetType === 'team' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Select Target Team Network *
                  </label>
                  <select
                    value={selectedTeamLeaderId}
                    onChange={(e) => setSelectedTeamLeaderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                  >
                    <option value="">-- Choose Team Leader Network --</option>
                    {teamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name}'s Network ({tl.teamCode || 'TL'} • {tl.city || 'HQ'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notification Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Notification Type & Styling
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotifType('info')}
                    className={`p-2.5 text-xs rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      notifType === 'info' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Info size={16} /> Info
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotifType('success')}
                    className={`p-2.5 text-xs rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      notifType === 'success' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <CheckCircle size={16} /> Success
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotifType('reward')}
                    className={`p-2.5 text-xs rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      notifType === 'reward' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Coins size={16} /> Reward
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotifType('warning')}
                    className={`p-2.5 text-xs rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      notifType === 'warning' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Warning size={16} /> Warning
                  </button>
                </div>
              </div>

              {/* Title & Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Referral Case Update / Monthly Bonus Active"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Message Content *
                </label>
                <textarea
                  placeholder="Type full notification details here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                />
              </div>

              {/* Optional Points Badge */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Optional Reward Badge (e.g. +500 Pts / Commission Paid)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +500 Pts"
                  value={pointsBadge}
                  onChange={(e) => setPointsBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" isLoading={isSending} fullWidth>
                  <PaperPlaneRight size={18} className="mr-1" /> Dispatch Notification Live
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Sent History Log */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="font-display font-bold text-base text-[var(--navy-deep)] border-b border-gray-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell size={20} className="text-[var(--navy)]" /> Sent Notification Log
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {sentHistory.length} Record(s)
              </span>
            </h2>

            {isLoadingHistory ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-[#1B2A72] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading notification log...</p>
              </div>
            ) : sentHistory.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No notifications sent yet. Use the form to send broadcasts or partner messages.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {sentHistory.map((n) => {
                  const targetProf = partners.find((p) => p.id === n.partner_id);
                  return (
                    <div key={n.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 font-display">{n.title}</span>
                        <Badge variant={!n.partner_id ? 'amber' : 'blue'}>
                          {!n.partner_id ? 'Broadcast' : 'Direct Target'}
                        </Badge>
                      </div>

                      {/* Recipient Target Details (ID, Name, Team) */}
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs">
                        <User size={14} className="text-[#1B2A72] shrink-0" />
                        {!n.partner_id ? (
                          <span className="text-amber-800 font-bold">📢 Sent to: All Partners (Global Network)</span>
                        ) : targetProf ? (
                          <span className="truncate">
                            Sent to: <strong className="text-slate-900">{targetProf.name}</strong>{' '}
                            <span className="font-mono text-[10px] text-slate-500">(ID: {targetProf.id})</span>
                            {targetProf.referredByLeaderId && (
                              <span className="text-slate-500"> • Team: {targetProf.referredByLeaderName || 'Team Network'}</span>
                            )}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 text-[10px]">
                            Sent to Partner ID: {n.partner_id}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                      
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono border-t border-slate-100">
                        <span>{n.points_badge ? `Badge: ${n.points_badge}` : `Type: ${n.type}`}</span>
                        <span suppressHydrationWarning>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
