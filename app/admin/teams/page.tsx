'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TablePagination } from '@/components/ui/TablePagination';
import { 
  UsersThree, 
  Crown, 
  User, 
  MagnifyingGlass, 
  ArrowRight, 
  Coins, 
  CaretDown, 
  CaretUp,
  FileText
} from '@phosphor-icons/react';

export default function AdminTeamsPage() {
  const { partners } = useAdminStore();
  const { teamMembers, partner } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<'leaders' | 'individuals'>('leaders');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLeaderId, setExpandedLeaderId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filter Team Leaders
  const teamLeadersList = partners
    .filter((p) => p.role === 'team_leader')
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Filter Individual DSA Partners
  const individualPartnersList = partners
    .filter((p) => p.role === 'individual')
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.referredByLeaderName && p.referredByLeaderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const activeList = activeTab === 'leaders' ? teamLeadersList : individualPartnersList;
  const totalRecords = activeList.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedList = activeList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalOverrideDistributed = teamMembers.reduce((sum, tm) => sum + tm.overridePointsEarned, 0);

  const toggleExpand = (leaderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLeaderId(expandedLeaderId === leaderId ? null : leaderId);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <UsersThree className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            Teams & Network Members
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Check Team Leaders and sub-agents versus Individual DSA partners.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[var(--surface-2)] p-1 rounded-xl font-medium text-xs border border-[var(--border)]">
          <button
            onClick={() => { setActiveTab('leaders'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'leaders'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" weight="fill" />
            Team Leaders Directory ({teamLeadersList.length})
          </button>
          <button
            onClick={() => { setActiveTab('individuals'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'individuals'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <User className="w-4 h-4 text-blue-500" weight="fill" />
            Individual DSAs ({individualPartnersList.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Crown size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Registered Team Leaders</p>
              <h3 className="text-2xl font-bold font-mono-num text-[var(--ink)]">{teamLeadersList.length}</h3>
              <p className="text-xs text-amber-700 font-medium mt-0.5">Earning 10% Override Cuts</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <User size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Individual DSA Agents</p>
              <h3 className="text-2xl font-bold font-mono-num text-[var(--ink)]">{individualPartnersList.length}</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">Active Direct Lead Generators</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Coins size={24} weight="fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wide">Total Leader Overrides Issued</p>
              <h3 className="text-2xl font-bold font-mono-num text-emerald-600">{totalOverrideDistributed} Pts</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">10% Cut Credited to Leaders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[var(--border)] shadow-2xs">
        <MagnifyingGlass className="w-5 h-5 text-[var(--ink-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder={
            activeTab === 'leaders'
              ? 'Search Team Leaders by Name, Email, City, or Leader Code...'
              : 'Search Individual DSAs by Name, Email, City, or Referring Leader...'
          }
          className="w-full text-sm outline-none bg-transparent font-body"
        />
      </div>

      {/* PAGE 1: Team Leaders Directory with Pagination */}
      {activeTab === 'leaders' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-[var(--ink)] flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" weight="fill" /> Expandable Team Leader Hierarchy Roster
            </h3>
            <Badge variant="amber">Click Row to Expand Network</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                <tr>
                  <th className="w-10 px-4 py-3.5"></th>
                  <th className="px-6 py-3.5">Leader Profile</th>
                  <th className="px-6 py-3.5">Leader Code</th>
                  <th className="px-6 py-3.5">Profession & City</th>
                  <th className="px-6 py-3.5">Network Sub-Agents</th>
                  <th className="px-6 py-3.5">KYC Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono-num">
                {paginatedList.map((leader) => {
                  const isExpanded = expandedLeaderId === leader.id;
                  return (
                    <React.Fragment key={leader.id}>
                      <tr
                        onClick={() => window.location.href = `/admin/kyc/${leader.id}`}
                        className={`hover:bg-[var(--surface-2)] transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-4 text-center" onClick={(e) => toggleExpand(leader.id, e)}>
                          <button className="p-1 hover:bg-black/5 rounded-md text-[var(--ink-muted)]">
                            {isExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                          </button>
                        </td>

                        <td className="px-6 py-4 font-sans font-bold text-[var(--ink)] flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs font-display shrink-0 shadow-2xs">
                            {leader.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="group-hover:text-[var(--navy)] transition-colors font-display text-sm">{leader.name}</div>
                            <div className="text-xs font-normal text-[var(--ink-muted)]">{leader.email} • {leader.phone}</div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-[var(--navy)] text-xs">
                          {leader.teamCode}
                        </td>

                        <td className="px-6 py-4 font-sans text-xs text-[var(--ink-2)]">
                          <div>{leader.profession}</div>
                          <div className="text-[var(--ink-muted)]">{leader.city}, {leader.state}</div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-blue-600">
                          <button
                            onClick={(e) => toggleExpand(leader.id, e)}
                            className="flex items-center gap-1 hover:underline text-left cursor-pointer"
                          >
                            <span>{teamMembers.length} Active Sub-Agents</span>
                            {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={leader.status === 'kyc_approved' ? 'green' : 'amber'}>
                            {leader.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button variant="primary" size="sm">
                            Inspect Leader Page <ArrowRight className="w-3.5 h-3.5 ml-1 text-white" />
                          </Button>
                        </td>
                      </tr>

                      {/* Expandable Sub-Agent Nested Dropdown Row */}
                      {isExpanded && (
                        <tr className="bg-amber-50/40 border-b border-amber-200">
                          <td colSpan={7} className="p-4 pl-14">
                            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-3 font-sans">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h4 className="font-display font-bold text-xs text-[var(--navy-deep)] flex items-center gap-1.5 uppercase tracking-wide">
                                  Sub-Agent Hierarchy Under {leader.name} ({teamMembers.length} Agents)
                                </h4>
                                <span className="text-[11px] font-mono text-amber-700 font-semibold">
                                  10% Cut Credited on Sub-Agent Case Completions
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {teamMembers.map((sub) => (
                                  <div
                                    key={sub.id}
                                    onClick={() => window.location.href = `/admin/kyc/${sub.id}`}
                                    className="p-3 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                                  >
                                    <div className="space-y-0.5">
                                      <div className="font-bold text-xs text-[var(--ink)] flex items-center gap-1.5">
                                        <User size={14} className="text-[var(--navy)]" />
                                        <span>{sub.name}</span>
                                      </div>
                                      <div className="text-[11px] text-[var(--ink-muted)] font-mono">
                                        {sub.profession} • {sub.city}
                                      </div>
                                    </div>

                                    <div className="text-right font-mono-num">
                                      <span className="text-xs font-bold text-blue-600 block">{sub.casesCount} Cases Solved</span>
                                      <span className="text-[10px] font-bold text-amber-600">+{sub.overridePointsEarned} Override Pts</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </Card>
      )}

      {/* PAGE 2: Individual DSA Partners Directory with Pagination */}
      {activeTab === 'individuals' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-[var(--ink)] flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" weight="fill" /> Individual Direct DSA Agents
            </h3>
            <Badge variant="blue">Direct Lead Generators</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
                <tr>
                  <th className="px-6 py-3.5">Agent Profile</th>
                  <th className="px-6 py-3.5">Agent Code</th>
                  <th className="px-6 py-3.5">Referred By (Leader)</th>
                  <th className="px-6 py-3.5">Profession & Location</th>
                  <th className="px-6 py-3.5">KYC Status</th>
                  <th className="px-6 py-3.5 text-right">Inspect Individual Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono-num">
                {paginatedList.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => window.location.href = `/admin/kyc/${agent.id}`}
                    className="hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-sans font-bold text-[var(--ink)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-bold text-xs font-display shrink-0 shadow-2xs">
                        {agent.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="group-hover:text-[var(--navy)] transition-colors font-display text-sm">{agent.name}</div>
                        <div className="text-xs font-normal text-[var(--ink-muted)]">{agent.email} • {agent.phone}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-[var(--navy)] text-xs">
                      {agent.teamCode}
                    </td>

                    <td className="px-6 py-4 font-sans text-xs" onClick={(e) => e.stopPropagation()}>
                      {agent.referredByLeaderName ? (
                        <Link href={`/admin/kyc/${agent.referredByLeaderId || 'demo'}`}>
                          <span className="text-[var(--navy)] font-semibold hover:underline flex items-center gap-1">
                            <Crown size={14} className="text-amber-500" weight="fill" /> {agent.referredByLeaderName}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-[var(--ink-subtle)] italic">Direct Platform Signup</span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-sans text-xs text-[var(--ink-2)]">
                      <div>{agent.profession}</div>
                      <div className="text-[var(--ink-muted)]">{agent.city}, {agent.state}</div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={agent.status === 'kyc_approved' ? 'green' : agent.status === 'kyc_rejected' ? 'red' : 'amber'}>
                        {agent.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button variant="primary" size="sm">
                        View Individual Page <ArrowRight className="w-3.5 h-3.5 ml-1 text-white" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </Card>
      )}
    </div>
  );
}
