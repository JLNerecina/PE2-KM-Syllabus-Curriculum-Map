import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { UserProfile, UserRole, Program, Department } from '../../types';

interface Props {
  programs: Program[];
  departments: Department[];
}

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-[#00a2e6]/20 text-[#89ceff]',
  faculty: 'bg-[#a482c8]/20 text-[#dbb8ff]',
  admin: 'bg-[#8083ff]/20 text-[#c0c1ff]',
  superadmin: 'bg-amber-500/20 text-amber-300',
};

const PAGE_SIZE = 8;

type StatusFilter = 'all' | 'active' | 'blocked';
const STATUS_CYCLE: StatusFilter[] = ['all', 'active', 'blocked'];
const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'All Users',
  active: 'Active Only',
  blocked: 'Blocked Only',
};
const STATUS_ICONS: Record<StatusFilter, string> = {
  all: 'group',
  active: 'check_circle',
  blocked: 'block',
};

interface EditState {
  id_number: string;
  name: string;
  role: UserRole;
  program_id: string;
}

export default function UserListTab({ programs, departments }: Props) {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('name_asc');
  const [page, setPage] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingCurriculum, setTogglingCurriculum] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) setUsers(data as UserProfile[]);
    setIsLoading(false);
  }

  const filtered = useMemo(() => {
    let list = [...users];

    // Status filter
    if (statusFilter === 'active') list = list.filter(u => !u.is_deleted);
    else if (statusFilter === 'blocked') list = list.filter(u => u.is_deleted);

    // Role filter
    if (filterRole !== 'all') list = list.filter(u => u.role === filterRole);
    if (filterProgram !== 'all') list = list.filter(u => u.program_id === filterProgram);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => {
        const prog = programs.find(p => p.id === u.program_id);
        return (
          (u.id_number || '').toLowerCase().includes(q) ||
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          (prog?.code || '').toLowerCase().includes(q)
        );
      });
    }

    const [key, dir] = sortKey.split('_');
    list.sort((a, b) => {
      let cmp = 0;
      if (key === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (key === 'role') cmp = a.role.localeCompare(b.role);
      else if (key === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return dir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [users, filterRole, filterProgram, sortKey, searchQuery, statusFilter, programs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [filterRole, filterProgram, sortKey, searchQuery, statusFilter]);

  async function toggleSoftDelete(user: UserProfile) {
    setTogglingId(user.id);
    const { error } = await supabase.from('profiles').update({ is_deleted: !user.is_deleted }).eq('id', user.id);
    if (!error) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_deleted: !u.is_deleted } : u));
    setTogglingId(null);
  }

  async function toggleCanEditCurriculum(user: UserProfile) {
    setTogglingCurriculum(user.id);
    const newVal = !user.can_edit_curriculum;
    const { error } = await supabase.from('profiles').update({ can_edit_curriculum: newVal }).eq('id', user.id);
    if (!error) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, can_edit_curriculum: newVal } : u));
    setTogglingCurriculum(null);
  }

  function canToggle(target: UserProfile): boolean {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return target.id !== currentUser.id;
    if (currentUser.role === 'admin') return ['student', 'faculty'].includes(target.role);
    return false;
  }

  function canEditUser(target: UserProfile): boolean {
    if (!currentUser) return false;
    if (target.id === currentUser.id) return true; // Allow editing self
    if (currentUser.role === 'superadmin') return target.role !== 'superadmin';
    if (currentUser.role === 'admin') return ['student', 'faculty'].includes(target.role);
    return false;
  }

  function getAllowedRoles(): UserRole[] {
    if (!currentUser) return [];
    if (currentUser.role === 'superadmin') return ['student', 'faculty', 'admin'];
    if (currentUser.role === 'admin') return ['student', 'faculty'];
    return [];
  }

  function startEdit(user: UserProfile) {
    setEditingId(user.id);
    setEditState({
      id_number: user.id_number || '',
      name: user.name || '',
      role: user.role,
      program_id: user.program_id || '',
    });
  }

  function discardEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function saveEdit(userId: string) {
    if (!editState) return;
    setSavingId(userId);
    const updatePayload: Record<string, any> = {
      id_number: editState.id_number || null,
      name: editState.name,
      role: editState.role,
      program_id: editState.program_id || null,
    };
    const { error } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatePayload } : u));
    }
    setSavingId(null);
    setEditingId(null);
    setEditState(null);
  }

  // Determine if the Edit Curriculum switch should be permanently set
  function getCurriculumSwitchState(user: UserProfile): { checked: boolean; disabled: boolean } {
    if (user.role === 'admin' || user.role === 'superadmin') {
      return { checked: true, disabled: true }; // Always ON
    }
    if (user.role === 'student') {
      return { checked: false, disabled: true }; // Always OFF
    }
    // Faculty — toggleable (but only if current user can edit this user)
    return {
      checked: !!user.can_edit_curriculum,
      disabled: !canEditUser(user),
    };
  }

  function getInitials(name?: string) {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  const initialsColors = ['bg-indigo-500/20 text-indigo-400', 'bg-cyan-500/20 text-cyan-400', 'bg-purple-500/20 text-purple-400', 'bg-emerald-500/20 text-emerald-400', 'bg-amber-500/20 text-amber-400'];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-6 border-b border-indigo-500/10 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-3 relative">
          {/* Filter */}
          <div className="relative">
            <button onClick={() => { setShowFilter(!showFilter); setShowSort(false); }} className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
              Filter {(filterRole !== 'all' || filterProgram !== 'all') && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-2 bg-surface-container-low border border-indigo-500/20 rounded-xl p-4 shadow-2xl z-20 min-w-[240px] space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Role</label>
                  <select 
                    value={filterRole} 
                    onChange={e => {
                      const newRole = e.target.value;
                      setFilterRole(newRole);
                      if (newRole !== 'student') setFilterProgram('all');
                    }} 
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none"
                  >
                    <option value="all">All Roles</option>
                    {(['student','faculty','admin','superadmin'] as UserRole[]).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
                {filterRole === 'student' && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Program</label>
                    <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 text-sm text-slate-200 outline-none">
                      <option value="all">All Programs</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={() => { setFilterRole('all'); setFilterProgram('all'); setShowFilter(false); }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Clear Filters</button>
              </div>
            )}
          </div>
          {/* Sort */}
          <div className="relative">
            <button onClick={() => { setShowSort(!showSort); setShowFilter(false); }} className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">sort</span>Sort
            </button>
            {showSort && (
              <div className="absolute top-full left-0 mt-2 bg-surface-container-low border border-indigo-500/20 rounded-xl p-2 shadow-2xl z-20 min-w-[200px]">
                {[['name_asc','Name A → Z'],['name_desc','Name Z → A'],['role_asc','Role A → Z'],['date_asc','Oldest First'],['date_desc','Newest First']].map(([k,l]) => (
                  <button key={k} onClick={() => { setSortKey(k); setShowSort(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortKey===k ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-variant/50'}`}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Cycle Button */}
          <button
            onClick={() => {
              const idx = STATUS_CYCLE.indexOf(statusFilter);
              setStatusFilter(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
            }}
            className="px-4 py-2 bg-surface-bright rounded-lg text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{STATUS_ICONS[statusFilter]}</span>
            {STATUS_LABELS[statusFilter]}
          </button>
          <span className="text-xs text-slate-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-indigo-500/10">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="search"
            placeholder="Search by name, ID, email, role, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-variant/30 border border-indigo-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50 text-indigo-300 text-[11px] uppercase tracking-widest">
              <th className="px-6 py-4 border-b border-indigo-500/10">ID</th>
              <th className="px-6 py-4 border-b border-indigo-500/10">Full Name</th>
              <th className="px-6 py-4 border-b border-indigo-500/10">Email Address</th>
              <th className="px-6 py-4 border-b border-indigo-500/10">Role</th>
              <th className="px-6 py-4 border-b border-indigo-500/10">Program</th>
              <th className="px-6 py-4 border-b border-indigo-500/10 text-center">Edit Curriculum</th>
              <th className="px-6 py-4 border-b border-indigo-500/10 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-500/10">
            {pageUsers.map((u, i) => {
              const colorClass = initialsColors[(page * PAGE_SIZE + i) % initialsColors.length];
              const prog = programs.find(p => p.id === u.program_id);
              const isEditing = editingId === u.id;
              const switchState = getCurriculumSwitchState(u);

              return (
                <tr key={u.id} className={`transition-colors ${isEditing ? 'bg-indigo-500/5' : 'hover:bg-indigo-500/5'}`}>
                  {/* ID Number */}
                  <td className="px-6 py-5 text-sm text-slate-400 font-mono">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editState?.id_number || ''}
                        onChange={(e) => setEditState(prev => prev ? { ...prev, id_number: e.target.value } : prev)}
                        className="bg-surface-container-lowest border border-indigo-500/30 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 w-28 font-mono"
                      />
                    ) : (
                      u.id_number || '—'
                    )}
                  </td>

                  {/* Full Name */}
                  <td className="px-6 py-5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editState?.name || ''}
                        onChange={(e) => setEditState(prev => prev ? { ...prev, name: e.target.value } : prev)}
                        className="bg-surface-container-lowest border border-indigo-500/30 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 w-full min-w-[140px]"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold`}>{getInitials(u.name)}</div>
                        <span className="font-medium text-on-surface">{u.name || 'Unnamed'}</span>
                      </div>
                    )}
                  </td>

                  {/* Email — always read-only */}
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{u.email}</td>

                  {/* Role */}
                  <td className="px-6 py-5">
                    {isEditing ? (
                      <select
                        value={editState?.role || u.role}
                        disabled={u.id === currentUser?.id}
                        onChange={(e) => setEditState(prev => prev ? { ...prev, role: e.target.value as UserRole } : prev)}
                        className={`bg-surface-container-lowest border border-indigo-500/30 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 ${u.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {u.id === currentUser?.id ? (
                          <option value={u.role}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</option>
                        ) : (
                          getAllowedRoles().map(r => (
                            <option key={r} value={r} className="bg-slate-900">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))
                        )}
                      </select>
                    ) : (
                      <span className={`px-3 py-1 ${ROLE_COLORS[u.role]} rounded-full text-xs font-bold uppercase tracking-wider`}>{u.role}</span>
                    )}
                  </td>

                  {/* Program */}
                  <td className="px-6 py-5 text-sm text-slate-400">
                    {isEditing ? (
                      <select
                        value={editState?.program_id || ''}
                        onChange={(e) => setEditState(prev => prev ? { ...prev, program_id: e.target.value } : prev)}
                        className="bg-surface-container-lowest border border-indigo-500/30 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="" className="bg-slate-900">None</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-900">{p.code}</option>
                        ))}
                      </select>
                    ) : (
                      prog?.code || '—'
                    )}
                  </td>

                  {/* Edit Curriculum Toggle */}
                  <td className="px-6 py-5 text-center">
                    <label className={`relative inline-flex items-center ${switchState.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={switchState.checked}
                        disabled={switchState.disabled || togglingCurriculum === u.id}
                        onChange={() => {
                          if (u.role === 'faculty' && !switchState.disabled) {
                            toggleCanEditCurriculum(u);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className={`w-9 h-5 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        switchState.checked
                          ? 'bg-indigo-500 after:translate-x-full'
                          : 'bg-slate-600 after:translate-x-0'
                      } ${switchState.disabled ? 'opacity-50' : ''} ${togglingCurriculum === u.id ? 'animate-pulse' : ''}`}></div>
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            disabled={savingId === u.id}
                            onClick={() => saveEdit(u.id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                          >
                            {savingId === u.id ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={discardEdit}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border bg-slate-700/30 border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                          >
                            Discard
                          </button>
                        </>
                      ) : (
                        <>
                          {canEditUser(u) && (
                            <button
                              onClick={() => startEdit(u)}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
                            >
                              Edit
                            </button>
                          )}
                          {canToggle(u) ? (
                            <button
                              disabled={togglingId === u.id}
                              onClick={() => toggleSoftDelete(u)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                u.is_deleted
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {togglingId === u.id ? '...' : (u.is_deleted ? 'Unblock' : 'Block')}
                            </button>
                          ) : (
                            <div className="relative group inline-block">
                              <button disabled className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700/30 border border-slate-700/50 text-slate-500 cursor-not-allowed">
                                {u.is_deleted ? 'Blocked' : 'Active'}
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 z-10">
                                {currentUser?.id === u.id ? 'Cannot modify yourself' : 'Insufficient permissions'}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageUsers.length === 0 && (
              <tr><td colSpan={7} className="px-8 py-12 text-center text-slate-500">No users match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-indigo-500/10 flex items-center justify-between">
        <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
