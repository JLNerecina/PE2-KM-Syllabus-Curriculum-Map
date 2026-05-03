import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { AuditLogEntry, UserRole } from '../../types';

const PAGE_SIZE = 10;

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
  'user.update':                { label: 'Profile Edit',       color: 'bg-indigo-500/20 text-indigo-300',  icon: 'edit' },
  'user.block':                 { label: 'User Blocked',       color: 'bg-red-500/20 text-red-300',        icon: 'block' },
  'user.unblock':               { label: 'User Unblocked',     color: 'bg-emerald-500/20 text-emerald-300',icon: 'check_circle' },
  'user.toggle_edit_curriculum':{ label: 'Edit Curriculum',    color: 'bg-amber-500/20 text-amber-300',    icon: 'toggle_on' },
  'bulk_enrollment.create':     { label: 'Bulk Enrollment',    color: 'bg-cyan-500/20 text-cyan-300',      icon: 'group_add' },
  'preauthorize.create':        { label: 'Pre-Authorized',     color: 'bg-purple-500/20 text-purple-300',  icon: 'person_add' },
  'curriculum.update':          { label: 'Curriculum Updated', color: 'bg-teal-500/20 text-teal-300',      icon: 'school' },
  'curriculum.finalize':        { label: 'Curriculum Finalized', color: 'bg-green-500/20 text-green-400',  icon: 'workspace_premium' },
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-[#00a2e6]/20 text-[#89ceff]',
  faculty: 'bg-[#a482c8]/20 text-[#dbb8ff]',
  admin: 'bg-[#8083ff]/20 text-[#c0c1ff]',
  superadmin: 'bg-amber-500/20 text-amber-300',
};

function getActionMeta(action: string) {
  return ACTION_META[action] || { label: action, color: 'bg-slate-500/20 text-slate-300', icon: 'info' };
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAbsoluteTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\bid\b/gi, 'ID')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'string' && val.length === 36 && val.includes('-')) return val.slice(0, 8) + '…'; // UUID truncation
  return String(val);
}

function buildSummary(entry: AuditLogEntry): string {
  if (!entry.changes || Object.keys(entry.changes).length === 0) {
    if (entry.action === 'bulk_enrollment.create' && entry.metadata) {
      return `Enrolled ${entry.metadata.count} student(s) into ${entry.metadata.program || 'a program'}`;
    }
    return getActionMeta(entry.action).label;
  }

  const parts = Object.entries(entry.changes).map(([field, diff]) => {
    const oldVal = formatValue(diff.old);
    const newVal = formatValue(diff.new);
    return `${formatFieldName(field)}: ${oldVal} → ${newVal}`;
  });

  return parts.join(', ');
}

function getInitials(name?: string) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const initialsColors = [
  'bg-indigo-500/20 text-indigo-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
];

type ActionFilter = 'all' | string;

export default function AuditTrailTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMetaId, setExpandedMetaId] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setIsLoading(true);
    // Fetch audit logs with actor profile info via a join
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id, created_at, actor_id, action, target_table, target_id, target_label, changes, metadata,
        actor:profiles!audit_logs_actor_id_fkey ( name, email, role )
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      const mapped: AuditLogEntry[] = data.map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        actor_id: row.actor_id,
        action: row.action,
        target_table: row.target_table,
        target_id: row.target_id,
        target_label: row.target_label,
        changes: row.changes,
        metadata: row.metadata,
        actor_name: row.actor?.name,
        actor_email: row.actor?.email,
        actor_role: row.actor?.role,
      }));
      setLogs(mapped);
    }
    setIsLoading(false);
  }

  const filtered = useMemo(() => {
    let list = [...logs];

    // Action filter
    if (actionFilter !== 'all') {
      list = list.filter(l => l.action === actionFilter);
    }

    // Date filters
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter(l => new Date(l.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(l => new Date(l.created_at) <= to);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l =>
        (l.actor_name || 'System').toLowerCase().includes(q) ||
        (l.actor_email || '').toLowerCase().includes(q) ||
        (l.actor_role || '').toLowerCase().includes(q) ||
        (l.target_label || '').toLowerCase().includes(q) ||
        (l.target_id || '').toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        getActionMeta(l.action).label.toLowerCase().includes(q) ||
        buildSummary(l).toLowerCase().includes(q)
      );
    }

    return list;
  }, [logs, actionFilter, dateFrom, dateTo, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageLogs = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [actionFilter, dateFrom, dateTo, searchQuery]);

  // Unique action types present in logs
  const actionTypes = useMemo(() => {
    const set = new Set(logs.map(l => l.action));
    return Array.from(set).sort();
  }, [logs]);

  // ─── Export functions ───
  function exportCSV() {
    const headers = ['Timestamp', 'Actor', 'Actor Email', 'Actor Role', 'Action', 'Target', 'Target Table', 'Summary', 'Changes JSON'];
    const rows = filtered.map(l => [
      formatAbsoluteTime(l.created_at),
      l.actor_name || '',
      l.actor_email || '',
      l.actor_role || '',
      l.action,
      l.target_label || '',
      l.target_table,
      buildSummary(l),
      l.changes ? JSON.stringify(l.changes) : '',
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const exportData = filtered.map(l => ({
      timestamp: l.created_at,
      actor: { id: l.actor_id, name: l.actor_name, email: l.actor_email, role: l.actor_role },
      action: l.action,
      target: { table: l.target_table, id: l.target_id, label: l.target_label },
      changes: l.changes,
      metadata: l.metadata,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-400 bg-indigo-500/10 p-2 rounded-lg">history</span>
          <div>
            <h2 className="text-on-surface text-xl font-bold font-['Space_Grotesk']">Audit Trail</h2>
            <p className="text-xs text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            CSV
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">data_object</span>
            JSON
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-indigo-500/10 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-3 items-center">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
              Filters
              {(actionFilter !== 'all' || dateFrom || dateTo) && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
            </button>

            {/* Refresh */}
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="search"
              placeholder="Search actor, action, target, or summary..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-variant/30 border border-indigo-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Filter Panel (collapsible) */}
        {showFilterPanel && (
          <div className="px-6 py-4 border-b border-indigo-500/10 bg-surface-container-high/30 flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Action Type</label>
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none min-w-[180px]"
              >
                <option value="all">All Actions</option>
                {actionTypes.map(a => (
                  <option key={a} value={a}>{getActionMeta(a).label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none"
              />
            </div>
            <button
              onClick={() => { setActionFilter('all'); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors pb-2"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-indigo-300 text-[11px] uppercase tracking-widest">
                <th className="px-6 py-4 border-b border-indigo-500/10 w-8"></th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Timestamp</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Actor</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Action</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Target</th>
                <th className="px-6 py-4 border-b border-indigo-500/10">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/10">
              {pageLogs.map((entry, i) => {
                const meta = getActionMeta(entry.action);
                const isExpanded = expandedId === entry.id;
                const isMetaExpanded = expandedMetaId === entry.id;
                const colorClass = initialsColors[i % initialsColors.length];
                const hasDetails = (entry.changes && Object.keys(entry.changes).length > 0) || (entry.metadata && Object.keys(entry.metadata).length > 0);

                return (
                  <>
                    <tr
                      key={entry.id}
                      onClick={() => hasDetails && setExpandedId(isExpanded ? null : entry.id)}
                      className={`transition-colors ${hasDetails ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-indigo-500/5' : 'hover:bg-indigo-500/5'}`}
                    >
                      {/* Expand chevron */}
                      <td className="px-4 py-5 text-center">
                        {hasDetails ? (
                          <span className={`material-symbols-outlined text-[18px] text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            chevron_right
                          </span>
                        ) : (
                          <span className="w-[18px] inline-block" />
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-5">
                        <div className="group relative">
                          <span className="text-sm text-slate-300">{formatRelativeTime(entry.created_at)}</span>
                          <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 z-10">
                            {formatAbsoluteTime(entry.created_at)}
                          </div>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full ${colorClass} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                            {getInitials(entry.actor_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">{entry.actor_name || 'System'}</p>
                            {entry.actor_role && (
                              <span className={`inline-block px-2 py-0.5 ${ROLE_COLORS[entry.actor_role]} rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5`}>
                                {entry.actor_role}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${meta.color} rounded-full text-xs font-bold uppercase tracking-wider`}>
                          <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
                          {meta.label}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-6 py-5 text-sm text-on-surface-variant max-w-[200px] truncate">
                        {entry.target_label || entry.target_id || '—'}
                      </td>

                      {/* Summary */}
                      <td className="px-6 py-5 text-sm text-slate-400 max-w-[300px]">
                        <p className="truncate">{buildSummary(entry)}</p>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && hasDetails && (
                      <tr key={`${entry.id}-detail`} className="bg-indigo-500/5">
                        <td colSpan={6} className="px-10 py-5">
                          <div className="space-y-4">
                            
                            {/* Action-Specific Content */}
                            {entry.action === 'bulk_enrollment.create' ? (
                              <div className="space-y-3">
                                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                      Enrolled into {entry.metadata?.program_code || entry.target_label} — {entry.metadata?.program}
                                  </p>
                                  <div className="bg-surface-container-low/50 rounded-lg border border-indigo-500/10 overflow-hidden">
                                      <table className="w-full text-left text-sm">
                                          <thead className="bg-surface-container-high/50 text-indigo-300 text-[10px] uppercase tracking-widest">
                                              <tr>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10 w-12">#</th>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10">ID Number</th>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10">Full Name</th>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10">Email</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-indigo-500/10">
                                              {(entry.metadata?.students || []).map((s: any, idx: number) => (
                                                  <tr key={idx} className="hover:bg-indigo-500/5">
                                                      <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                                                      <td className="px-4 py-2 text-slate-300">{s.id_number || '—'}</td>
                                                      <td className="px-4 py-2 text-slate-300">{s.name || '—'}</td>
                                                      <td className="px-4 py-2 text-slate-300">{s.email}</td>
                                                  </tr>
                                              ))}
                                              {(!entry.metadata?.students || entry.metadata.students.length === 0) && (
                                                  <tr>
                                                      <td colSpan={4} className="px-4 py-4 text-center text-slate-500 text-xs">No student details available</td>
                                                  </tr>
                                              )}
                                          </tbody>
                                      </table>
                                  </div>
                              </div>
                            ) : entry.action === 'curriculum.update' ? (
                              <div className="space-y-3">
                                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                      Year {entry.metadata?.year_level}, Semester {entry.metadata?.semester} — {entry.metadata?.total_units} units
                                  </p>
                                  <div className="bg-surface-container-low/50 rounded-lg border border-indigo-500/10 overflow-hidden">
                                      <table className="w-full text-left text-sm">
                                          <thead className="bg-surface-container-high/50 text-indigo-300 text-[10px] uppercase tracking-widest">
                                              <tr>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10">Course Code</th>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10">Course Title</th>
                                                  <th className="px-4 py-2 border-b border-indigo-500/10">Action</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-indigo-500/10">
                                              {[
                                                  ...(entry.metadata?.courses_added || []).map((c: any) => ({ ...c, type: 'added' })),
                                                  ...(entry.metadata?.courses_removed || []).map((c: any) => ({ ...c, type: 'removed' })),
                                                  ...(entry.metadata?.courses_status_changed || []).map((c: any) => ({ ...c, type: 'changed' }))
                                              ].map((c: any, idx: number) => (
                                                  <tr key={idx} className="hover:bg-indigo-500/5">
                                                      <td className="px-4 py-2 text-indigo-400 font-bold text-xs">{c.code}</td>
                                                      <td className="px-4 py-2 text-slate-300">{c.title}</td>
                                                      <td className="px-4 py-2">
                                                          {c.type === 'added' && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Added</span>}
                                                          {c.type === 'removed' && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Removed</span>}
                                                          {c.type === 'changed' && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">{c.old_status} → {c.new_status}</span>}
                                                      </td>
                                                  </tr>
                                              ))}
                                              {(!entry.metadata?.courses_added && !entry.metadata?.courses_removed && !entry.metadata?.courses_status_changed) && (
                                                  <tr>
                                                      <td colSpan={3} className="px-4 py-4 text-center text-slate-500 text-xs">No specific course modifications logged</td>
                                                  </tr>
                                              )}
                                          </tbody>
                                      </table>
                                  </div>
                              </div>
                            ) : entry.changes && Object.keys(entry.changes).length > 0 ? (
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Change Details</p>
                                <div className="grid gap-2">
                                  {Object.entries(entry.changes).map(([field, diff]) => (
                                    <div key={field} className="flex items-center gap-4 bg-surface-container-low/50 rounded-lg px-4 py-3 border border-indigo-500/10">
                                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-36 shrink-0">
                                        {formatFieldName(field)}
                                      </span>
                                      <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-sm text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                                          {formatValue(diff.old)}
                                        </span>
                                        <span className="material-symbols-outlined text-[16px] text-slate-500 shrink-0">arrow_forward</span>
                                        <span className="text-sm text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                                          {formatValue(diff.new)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {/* Metadata Toggle */}
                            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                              <div className="border border-indigo-500/10 rounded-lg overflow-hidden mt-4">
                                <button
                                  onClick={() => setExpandedMetaId(isMetaExpanded ? null : entry.id)}
                                  className="w-full px-4 py-2.5 bg-surface-container-lowest/50 hover:bg-surface-container-lowest flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[16px] transition-transform ${isMetaExpanded ? 'rotate-90' : ''}`}>chevron_right</span>
                                    Raw Metadata
                                  </span>
                                </button>
                                {isMetaExpanded && (
                                  <div className="bg-surface-container-lowest p-4 border-t border-indigo-500/10">
                                    <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap break-all">
                                      {JSON.stringify(entry.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Footer info */}
                            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-indigo-500/10">
                              <span>ID: {entry.id.slice(0, 8)}…</span>
                              <span>Table: {entry.target_table}</span>
                              <span>Target ID: {entry.target_id?.slice(0, 8)}…</span>
                              <span>{formatAbsoluteTime(entry.created_at)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {pageLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3 block">manage_search</span>
                    <p className="text-slate-500 text-sm">No audit log entries match your filters.</p>
                    <p className="text-slate-600 text-xs mt-1">Actions performed by authorized users will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-indigo-500/10 flex items-center justify-between">
          <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
