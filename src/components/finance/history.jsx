import React, { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import { TransactionItem } from './transactions';

export function HistoryView({ transactions, paymentLookup, formatIDR, onDelete, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filterType !== 'all' && transaction.type !== filterType) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (transaction.description && transaction.description.toLowerCase().includes(term)) ||
          (transaction.vendorName && transaction.vendorName.toLowerCase().includes(term)) ||
          (transaction.amount && transaction.amount.toString().includes(term))
        );
      }
      return true;
    });
  }, [transactions, searchTerm, filterType]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = {
          items: [],
          totalIncome: 0,
          totalExpense: 0,
        };
      }
      groups[key].items.push(transaction);
      if (transaction.type === 'income') groups[key].totalIncome += transaction.amount;
      else groups[key].totalExpense += transaction.amount;
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full md:w-auto flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/60 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${filterType === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-white/50 text-gray-600 border-white/60 hover:bg-white'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap flex items-center gap-1 ${filterType === 'income' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white/50 text-gray-600 border-white/60 hover:bg-white'}`}
          >
            <ArrowRight size={12} className="-rotate-45" /> Pemasukan
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap flex items-center gap-1 ${filterType === 'expense' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30' : 'bg-white/50 text-gray-600 border-white/60 hover:bg-white'}`}
          >
            <ArrowRight size={12} className="rotate-45" /> Pengeluaran
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 shadow-xl backdrop-blur-xl">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Tidak ada transaksi ditemukan</p>
        </div>
      ) : (
        Object.entries(groupedTransactions).map(([month, data]) => (
          <div key={month} className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="p-6 bg-white/30 border-b border-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" />
                {month}
              </h2>
              <div className="flex gap-4 text-xs font-bold">
                <div className="px-3 py-1.5 bg-emerald-100/50 text-emerald-700 rounded-lg border border-emerald-100">
                  Masuk: {formatIDR(data.totalIncome)}
                </div>
                <div className="px-3 py-1.5 bg-rose-100/50 text-rose-700 rounded-lg border border-rose-100">
                  Keluar: {formatIDR(data.totalExpense)}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {data.items.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  t={transaction}
                  paymentLookup={paymentLookup}
                  formatIDR={formatIDR}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
