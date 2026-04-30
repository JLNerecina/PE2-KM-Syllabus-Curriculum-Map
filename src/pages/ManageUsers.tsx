import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Program, Department } from '../types';
import UserListTab from './manage-users/UserListTab';
import BulkEnrollmentTab from './manage-users/BulkEnrollmentTab';
import PreAuthorizeTab from './manage-users/PreAuthorizeTab';

type Tab = 'user-list' | 'bulk-enrollment' | 'pre-authorize';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'user-list', label: 'User List', icon: 'group' },
  { id: 'bulk-enrollment', label: 'Bulk Enrollment', icon: 'group_add' },
  { id: 'pre-authorize', label: 'Pre-Authorize', icon: 'person_add' },
];

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState<Tab>('user-list');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    async function fetchLookups() {
      const [{ data: progData }, { data: deptData }] = await Promise.all([
        supabase.from('programs').select('id, name, code, department_id'),
        supabase.from('departments').select('id, name, code'),
      ]);
      if (progData) setPrograms(progData as Program[]);
      if (deptData) setDepartments(deptData as Department[]);
    }
    fetchLookups();
  }, []);

  return (
    <div className="p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent min-h-screen">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Page Header + Tab Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-on-surface font-['Space_Grotesk'] tracking-tight">Manage Users</h1>
            <p className="text-on-surface-variant text-lg">
              Oversee institutional users and facilitate rapid enrollment protocols.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 shadow-inner">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary-container/20 text-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'user-list' && <UserListTab programs={programs} />}
        {activeTab === 'bulk-enrollment' && <BulkEnrollmentTab programs={programs} departments={departments} />}
        {activeTab === 'pre-authorize' && <PreAuthorizeTab programs={programs} departments={departments} />}
      </div>
    </div>
  );
}
