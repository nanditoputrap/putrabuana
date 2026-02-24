import React from 'react';
import { BarChart3, Building2, CreditCard, History, LayoutDashboard, LogOut, Store, Tag } from 'lucide-react';
import { VIEWS } from '../../../constants/app';

function AppHeader({ appUser, currentView, onLogout, setCurrentView }) {
  return (
    <header className="sticky top-0 z-30 transition-all duration-300">
      <div className="mx-4 mt-4 mb-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/5 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl lg:mx-auto">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 text-white">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">CV Metavisi</h1>
            <p className="text-xs text-indigo-600/80 font-medium mt-1 tracking-wide">Financial System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          <nav className="flex items-center gap-1 bg-white/40 p-1 rounded-xl border border-white/50 backdrop-blur-sm mr-2 flex-shrink-0">
            <button
              onClick={() => setCurrentView(VIEWS.DASHBOARD)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === VIEWS.DASHBOARD ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView(VIEWS.ANALYTICS)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === VIEWS.ANALYTICS ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
            >
              <BarChart3 size={14} />
              Analisis
            </button>
            <button
              onClick={() => setCurrentView(VIEWS.HISTORY)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === VIEWS.HISTORY ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
            >
              <History size={14} />
              Riwayat
            </button>
            <button
              onClick={() => setCurrentView(VIEWS.LOANS)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === VIEWS.LOANS ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
            >
              <CreditCard size={14} />
              Pinjaman
            </button>
            <button
              onClick={() => setCurrentView(VIEWS.VENDOR)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === VIEWS.VENDOR ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
            >
              <Store size={14} />
              Vendor
            </button>
            <button
              onClick={() => setCurrentView(VIEWS.ITEMS)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === VIEWS.ITEMS ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
            >
              <Tag size={14} />
              Item
            </button>
          </nav>

          <div className="hidden md:flex flex-col items-end mr-2 border-r border-gray-300/30 pr-4 flex-shrink-0">
            <span className="text-sm font-bold text-gray-800">{appUser.name}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100">
              {appUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-gray-500 bg-white/50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-white/60 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 flex-shrink-0"
            title="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
