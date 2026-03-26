import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUserData } from '../../../shared/utils/helpers';
import { authApi } from '../../../shared/api';

function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

function SidebarLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        classNames(
          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
          isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        )
      }
    >
      <span className="text-slate-500">{icon}</span>
      <span>{children}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getUserData();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API failures; local token cleanup still logs the user out
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-fit">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                P
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">ParkEz</div>
                <div className="text-xs text-slate-500">Admin Console</div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <SidebarLink
                to="/admin"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                }
              >
                Dashboard
              </SidebarLink>
              <SidebarLink
                to="/admin/inventory"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
                  </svg>
                }
              >
                Inventory
              </SidebarLink>
              <SidebarLink
                to="/admin/users"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V21h14v-4.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V21h6v-4.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                }
              >
                Registered Users
              </SidebarLink>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  {(user?.full_name || 'A').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {user?.full_name || 'Admin'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user?.email || ''}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
