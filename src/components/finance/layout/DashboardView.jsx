import React from 'react';
import { Search } from 'lucide-react';
import { VIEWS } from '../../../constants/app';
import { SummaryCardGlass, TransactionFormGlass } from '../dashboard';
import { TransactionItem } from '../transactions';
import { NotesCard } from './NotesCard';

function DashboardView({
  appUser,
  dashboardSearch,
  filteredDashboardTransactions,
  formatIDR,
  onAddTransaction,
  onEditTransaction,
  onSearchChange,
  onShowSaldoModal,
  promptDeleteTransaction,
  setCurrentView,
  summary,
  paymentLookup,
  transactions,
  vendors,
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        <SummaryCardGlass
          title="Total Saldo"
          amount={summary.balance}
          type="balance"
          formatIDR={formatIDR}
          onAddInitialBalance={onShowSaldoModal}
        />
        <SummaryCardGlass title="Pemasukan" amount={summary.income} type="income" formatIDR={formatIDR} />
        <SummaryCardGlass title="Pengeluaran" amount={summary.expense} type="expense" formatIDR={formatIDR} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-8 duration-700">
        <div className="lg:col-span-4">
          <TransactionFormGlass
            onAdd={onAddTransaction}
            vendors={vendors}
            transactions={transactions}
          />
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div className="xl:col-span-8 bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden relative">
              <div className="p-6 border-b border-white/30 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/20 gap-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2.5 text-lg">Transaksi Terkini</h2>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative group flex-1 md:flex-none">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={dashboardSearch}
                      onChange={(event) => onSearchChange(event.target.value)}
                      className="w-full md:w-40 pl-9 pr-3 py-1.5 bg-white/50 border border-white/60 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setCurrentView(VIEWS.HISTORY)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 whitespace-nowrap"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-3 space-y-3">
                {filteredDashboardTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    t={transaction}
                    paymentLookup={paymentLookup}
                    formatIDR={formatIDR}
                    onDelete={promptDeleteTransaction}
                    onEdit={onEditTransaction}
                  />
                ))}
                {filteredDashboardTransactions.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    {dashboardSearch ? 'Tidak ada data yang cocok.' : 'Belum ada transaksi'}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-4">
              <NotesCard key={appUser?.name || 'default'} appUser={appUser} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { DashboardView };
