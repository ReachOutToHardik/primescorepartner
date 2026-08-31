'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAdminStore, AdminPartner } from '@/lib/admin-store';
import { STATE_NAME_TO_ID, STATE_ID_TO_NAME, INDIAN_STATES } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PartnerViewModal } from './PartnerViewModal';
import {
  MapPin,
  UsersThree,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkle,
  X,
  Buildings,
  MagnifyingGlass
} from '@phosphor-icons/react';

// Dynamically import IndiaMap with SSR disabled to ensure perfect client hydration
const DynamicIndiaMap = dynamic(
  () => import('@vishalvoid/react-india-map').then((mod) => mod.IndiaMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] flex flex-col items-center justify-center bg-slate-50/60 rounded-2xl border border-slate-200/80 animate-pulse">
        <MapPin size={32} className="text-[#1B2A72] animate-bounce mb-2" />
        <p className="text-xs font-bold text-slate-600">Rendering National Geospatial Map...</p>
      </div>
    ),
  }
);

export function AdminIndiaMap() {
  const { partners } = useAdminStore();
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [activePartnerModal, setActivePartnerModal] = useState<AdminPartner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Group partners by State ID
  const {
    partnerCountByState,
    approvedCountByState,
    pendingCountByState,
    leadersCountByState,
    partnersByState,
    coveredStatesCount,
    topStatesList,
  } = useMemo(() => {
    const pCount: Record<string, number> = {};
    const appCount: Record<string, number> = {};
    const pendCount: Record<string, number> = {};
    const leadCount: Record<string, number> = {};
    const pByState: Record<string, AdminPartner[]> = {};

    partners.forEach((p) => {
      if (!p.state) return;
      // Try direct match or clean lookup
      const cleanStateName = p.state.trim();
      const stateId = STATE_NAME_TO_ID[cleanStateName];
      if (!stateId) return;

      pCount[stateId] = (pCount[stateId] || 0) + 1;
      if (p.status === 'kyc_approved') {
        appCount[stateId] = (appCount[stateId] || 0) + 1;
      } else if (p.status === 'kyc_submitted' || p.status === 'pending_kyc') {
        pendCount[stateId] = (pendCount[stateId] || 0) + 1;
      }

      if (p.role === 'team_leader') {
        leadCount[stateId] = (leadCount[stateId] || 0) + 1;
      }

      if (!pByState[stateId]) pByState[stateId] = [];
      pByState[stateId].push(p);
    });

    const covered = Object.keys(pCount).length;
    const topStates = Object.entries(pCount)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        id,
        name: STATE_ID_TO_NAME[id] || id,
        count,
      }));

    return {
      partnerCountByState: pCount,
      approvedCountByState: appCount,
      pendingCountByState: pendCount,
      leadersCountByState: leadCount,
      partnersByState: pByState,
      coveredStatesCount: covered,
      topStatesList: topStates,
    };
  }, [partners]);

  // 2. Format state data for @vishalvoid/react-india-map
  const mapStateData = useMemo(() => {
    return Object.entries(STATE_ID_TO_NAME).map(([id, name]) => {
      const count = partnerCountByState[id] || 0;
      const approved = approvedCountByState[id] || 0;
      const pending = pendingCountByState[id] || 0;
      const leaders = leadersCountByState[id] || 0;

      return {
        id,
        customData: {
          name,
          'Total Partners': count,
          'KYC Approved': approved,
          'Pending KYC': pending,
          'Team Leaders': leaders,
        },
      };
    });
  }, [partnerCountByState, approvedCountByState, pendingCountByState, leadersCountByState]);

  // 3. Dynamic Heatmap CSS styling to tint states according to partner density
  const heatmapStyles = useMemo(() => {
    const rules: string[] = [];

    Object.entries(STATE_ID_TO_NAME).forEach(([id]) => {
      const count = partnerCountByState[id] || 0;
      const isSelected = selectedStateId === id;

      let fill = '#F1F5F9'; // 0 partners: clean subtle slate
      let stroke = '#CBD5E1';
      let strokeWidth = '0.8px';

      if (isSelected) {
        fill = '#FEF08A'; // Selected: gentle soft light yellow
        stroke = '#1B2A72';
        strokeWidth = '1.4px';
      } else if (count >= 10) {
        fill = '#1B2A72'; // 10+ partners: Dark Navy
        stroke = '#0F1A4E';
      } else if (count >= 5) {
        fill = '#3B82F6'; // 5-9 partners: Prime Blue
        stroke = '#1D4ED8';
      } else if (count >= 1) {
        fill = '#93C5FD'; // 1-4 partners: Soft Blue
        stroke = '#60A5FA';
      }

      rules.push(`
        .india-map-container path#${id} {
          fill: ${fill} !important;
          stroke: ${stroke} !important;
          stroke-width: ${strokeWidth} !important;
          transition: all 0.25s ease;
        }
        .india-map-container path#${id}:hover {
          fill: #0F1A4E !important;
          stroke: #FEF08A !important;
          stroke-width: 1.5px !important;
          cursor: pointer;
        }
      `);
    });

    return rules.join('\n');
  }, [partnerCountByState, selectedStateId]);

  // 4. Map configuration for react-india-map
  const mapStyle = {
    backgroundColor: '#F8FAFC',
    hoverColor: '#0F1A4E',
    stroke: '#CBD5E1',
    strokeWidth: 0.8,
    tooltipConfig: {
      backgroundColor: '#0F1A4E',
      textColor: '#FFFFFF',
    },
  };

  // Selected State Details
  const selectedStateName = selectedStateId ? STATE_ID_TO_NAME[selectedStateId] || selectedStateId : null;
  const statePartners = (selectedStateId && partnersByState[selectedStateId]) || [];

  const filteredStatePartners = useMemo(() => {
    if (!searchQuery.trim()) return statePartners;
    const q = searchQuery.toLowerCase().trim();
    return statePartners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
    );
  }, [statePartners, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Dynamic CSS Injection for State Heatmap Colors */}
      <style dangerouslySetInnerHTML={{ __html: heatmapStyles }} />

      <Card className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-5">
        {/* Header with Metrics & Quick State Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center shrink-0">
                <MapPin size={18} weight="fill" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0F1A4E] leading-tight">
                  Partner Presence Across India
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  See where our DSA partners and team leaders are based across different states.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="blue" className="px-2.5 py-1 text-xs font-mono font-bold">
              Present in {coveredStatesCount} out of 36 States & UTs
            </Badge>
            <Badge variant="primary" className="px-2.5 py-1 text-xs font-mono font-bold">
              {partners.length} Total Partners
            </Badge>
          </div>
        </div>

        {/* Filter Bar: Top State Chips + Compact State Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {topStatesList.length > 0 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 min-w-0">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0 mr-0.5">
                Top States:
              </span>
              {topStatesList.slice(0, 5).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStateId(selectedStateId === st.id ? null : st.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    selectedStateId === st.id
                      ? 'bg-[#1B2A72] text-white shadow-xs font-bold'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70'
                  }`}
                >
                  <span>{st.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      selectedStateId === st.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Compact State Selector Dropdown */}
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <select
              value={selectedStateId || ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStateId(val || null);
                setSearchQuery('');
              }}
              className="text-xs font-semibold bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:border-[#1B2A72] text-slate-700 cursor-pointer transition-all"
            >
              <option value="">All States (Select State)...</option>
              {INDIAN_STATES.map((stateName) => {
                const id = STATE_NAME_TO_ID[stateName];
                const count = partnerCountByState[id] || 0;
                return (
                  <option key={id} value={id}>
                    {stateName} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>

            {selectedStateId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStateId(null);
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold rounded-lg border border-amber-200 transition-all cursor-pointer shrink-0"
                title="Clear filter"
              >
                <X size={12} weight="bold" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Map and State Roster Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
          {/* India SVG Map Container (7 Columns on large screens) */}
          <div className="lg:col-span-7 bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3 sm:p-5 flex flex-col items-center relative overflow-hidden">
            {/* Heatmap Legend */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-slate-500 mb-2 px-1">
              <span className="font-semibold text-slate-700">Partners in state:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#1B2A72] inline-block" /> 10+
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#3B82F6] inline-block" /> 5–9
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#93C5FD] inline-block" /> 1–4
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#F1F5F9] border border-slate-300 inline-block" /> 0
                </span>
              </div>
            </div>

            {/* India Map Component */}
            <div className="w-full max-w-[540px] mx-auto py-2">
              <DynamicIndiaMap
                mapStyle={mapStyle}
                stateData={mapStateData}
                onStateClick={(stateId) => {
                  setSelectedStateId((prev) => (prev === stateId ? null : stateId));
                  setSearchQuery('');
                }}
              />
            </div>
          </div>

          {/* Right Column: Selected State Roster or National Breakdown (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedStateId ? (
              /* State Drilldown Card */
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-extrabold text-lg text-slate-900">
                        {selectedStateName}
                      </h4>
                      <Badge variant="primary" className="font-mono text-[10px]">
                        {selectedStateId}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Partners based in this state
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStateId(null);
                      setSearchQuery('');
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1 font-bold text-sm cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* State Mini KPI Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="font-mono-num font-extrabold text-lg text-[#1B2A72]">
                      {partnerCountByState[selectedStateId] || 0}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/70 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Approved</p>
                    <p className="font-mono-num font-extrabold text-lg text-emerald-700">
                      {approvedCountByState[selectedStateId] || 0}
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Pending</p>
                    <p className="font-mono-num font-extrabold text-lg text-amber-800">
                      {pendingCountByState[selectedStateId] || 0}
                    </p>
                  </div>
                </div>

                {/* Search Partner within State */}
                {statePartners.length > 3 && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Search partners in ${selectedStateName}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1B2A72] focus:bg-white"
                    />
                    <MagnifyingGlass size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                )}

                {/* Partner Roster List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {statePartners.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1.5">
                      <Buildings size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">No Partners in {selectedStateName}</p>
                      <p className="text-[11px] text-slate-400">
                        New partners from {selectedStateName} will appear here when registered.
                      </p>
                    </div>
                  ) : filteredStatePartners.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 py-4">No matching partners found.</p>
                  ) : (
                    filteredStatePartners.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setActivePartnerModal(p)}
                        className="p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#1B2A72] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {p.profilePhoto ? (
                              <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              p.name.substring(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1B2A72] transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 font-medium">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span>{p.city || selectedStateName}</span>
                              <span>•</span>
                              <span className="capitalize">{p.role ? p.role.replace('_', ' ') : 'DSA'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'kyc_approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'kyc_rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status === 'kyc_approved' ? 'Approved' : 'Pending'}
                          </span>
                          <ArrowRight size={13} className="text-slate-400 group-hover:text-[#1B2A72] transition-colors" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* National Overview Default Card */
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div>
                  <h4 className="font-display font-extrabold text-base text-slate-900">
                    State Breakdown
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Where our partners are currently active
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-[#1B2A72] uppercase tracking-wider block">
                    How to use this map
                  </span>
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    Hover over any state to see partner counts, or click a state to view the partners working there.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Top States
                  </span>
                  {topStatesList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No partner location data registered yet.</p>
                  ) : (
                    topStatesList.slice(0, 5).map((st, idx) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStateId(st.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#1B2A72] transition-colors">
                            {st.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-[#1B2A72]">
                            {st.count} {st.count === 1 ? 'Partner' : 'Partners'}
                          </span>
                          <ArrowRight size={13} className="text-slate-400 group-hover:text-[#1B2A72] transition-colors" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Partner View Modal for inspecting clicked partner */}
      {activePartnerModal && (
        <PartnerViewModal
          partner={activePartnerModal}
          isOpen={Boolean(activePartnerModal)}
          onClose={() => setActivePartnerModal(null)}
        />
      )}
    </div>
  );
}
