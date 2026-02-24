import React, { useState } from 'react';
import { MinusCircle, PlusCircle, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

// --- FORM TRANSAKSI ---
export function TransactionFormGlass({ onAdd, vendors = [], transactions = [] }) {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [linkedIncomeIds, setLinkedIncomeIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incomeTransactions = transactions.filter((transaction) => transaction.type === 'income');
  const alreadyLinkedIncomeIds = new Set(
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .flatMap((transaction) =>
        Array.isArray(transaction.linkedIncomeIds)
          ? transaction.linkedIncomeIds
          : transaction.linkedIncomeId
            ? [transaction.linkedIncomeId]
            : [],
      ),
  );
  const selectableIncomeTransactions = incomeTransactions.filter(
    (transaction) => transaction.description && !alreadyLinkedIncomeIds.has(transaction.id),
  );

  const selectedLinkedIncomes = selectableIncomeTransactions.filter((transaction) =>
    linkedIncomeIds.includes(transaction.id),
  );
  const linkedIncomeTotal = selectedLinkedIncomes.reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0,
  );
  const currentExpenseAmount = Number(amount || 0);
  const previewMargin = linkedIncomeTotal - currentExpenseAmount;

  const getMarginStatus = (value) => {
    if (value > 0) return { label: 'Surplus', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (value < 0) return { label: 'Rugi', className: 'text-rose-700 bg-rose-50 border-rose-200' };
    return { label: 'Impas', className: 'text-slate-700 bg-slate-50 border-slate-200' };
  };
  const marginStatus = getMarginStatus(previewMargin);

  const handleAmountChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setAmount(rawValue);
    setDisplayAmount(rawValue ? new Intl.NumberFormat('id-ID').format(rawValue) : '');
  };

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setLinkedIncomeIds([]);
  };

  const toggleLinkedIncome = (incomeId) => {
    setLinkedIncomeIds((prev) => {
      const exists = prev.includes(incomeId);
      const next = exists ? prev.filter((id) => id !== incomeId) : [...prev, incomeId];

      if (!description && next.length > 0) {
        const names = selectableIncomeTransactions
          .filter((transaction) => next.includes(transaction.id))
          .map((transaction) => transaction.description)
          .filter(Boolean);
        setDescription(names.join(', '));
      }

      if (next.length === 0 && description.includes(', ')) {
        setDescription('');
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    const selectedVendor = vendors.find((vendor) => vendor.id === vendorId);
    const linkedDescriptions = selectedLinkedIncomes
      .map((transaction) => transaction.description)
      .filter(Boolean);

    await onAdd({
      type,
      amount: parseFloat(amount),
      date,
      category: type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      description: description || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      vendorId: vendorId || null,
      vendorName: selectedVendor ? selectedVendor.name : null,
      linkedIncomeId: type === 'expense' ? selectedLinkedIncomes[0]?.id || null : null,
      linkedIncomeIds: type === 'expense' ? selectedLinkedIncomes.map((transaction) => transaction.id) : [],
      linkedIncomeDescription:
        type === 'expense'
          ? linkedDescriptions.length > 0
            ? linkedDescriptions.join(', ')
            : null
          : null,
      linkedIncomeAmountTotal: type === 'expense' ? linkedIncomeTotal : null,
    });

    setAmount('');
    setDisplayAmount('');
    setDescription('');
    setVendorId('');
    setLinkedIncomeIds([]);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-lg font-bold text-gray-800">Transaksi Baru</h2>
        <div className="flex p-1 bg-white/50 rounded-xl border border-white/40 backdrop-blur-sm">
          <button
            onClick={() => handleTypeChange('income')}
            className={`p-2 rounded-lg transition-all duration-300 ${type === 'income' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <PlusCircle size={20} />
          </button>
          <button
            onClick={() => handleTypeChange('expense')}
            className={`p-2 rounded-lg transition-all duration-300 ${type === 'expense' ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MinusCircle size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        {type === 'expense' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Pilih Dari Pemasukan (Bisa Lebih Dari Satu)
            </label>
            <div className="max-h-44 overflow-y-auto space-y-2 p-2 rounded-xl border border-white/60 bg-white/35">
              {selectableIncomeTransactions.length === 0 && (
                <p className="text-xs text-gray-500 px-2 py-1">Tidak ada pemasukan yang bisa dipilih.</p>
              )}
              {selectableIncomeTransactions.map((income) => (
                <label
                  key={income.id}
                  className="flex items-start gap-2 p-2 rounded-lg border border-white/60 bg-white/60 hover:bg-white/80 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={linkedIncomeIds.includes(income.id)}
                    onChange={() => toggleLinkedIncome(income.id)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-gray-700">
                    <b>{income.description}</b> - Rp {new Intl.NumberFormat('id-ID').format(income.amount || 0)}
                  </span>
                </label>
              ))}
            </div>
            {linkedIncomeIds.length > 0 && (
              <div className="p-2 rounded-lg border border-indigo-100 bg-indigo-50/70 text-xs text-indigo-700 space-y-1">
                <div>
                  Total pemasukan terpilih: <b>Rp {new Intl.NumberFormat('id-ID').format(linkedIncomeTotal)}</b>
                </div>
                <div className={`inline-flex px-2 py-0.5 rounded-full border font-bold ${marginStatus.className}`}>
                  Preview Selisih: {previewMargin >= 0 ? '+' : '-'}Rp {new Intl.NumberFormat('id-ID').format(Math.abs(previewMargin))} ({marginStatus.label})
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Jumlah (Rp)</label>
          <div className="relative group">
            <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
            <input
              type="text"
              required
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all font-mono text-lg font-bold text-gray-800 placeholder-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Tanggal</label>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm font-medium text-gray-700 shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Vendor / Klien (Opsional)</label>
          <div className="relative">
            <select
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm font-medium text-gray-700 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">-- Pilih Vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Keterangan Transaksi</label>
          <textarea
            rows="3"
            placeholder="Contoh: Spanduk Keren"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm resize-none shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-[0.98] duration-300 ${
            type === 'income'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:shadow-emerald-500/50'
              : 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30 hover:shadow-rose-500/50'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </form>
    </div>
  );
}

export function SummaryCardGlass({ title, amount, type, formatIDR, onAddInitialBalance }) {
  const styles = {
    balance: {
      gradient: 'from-blue-500 to-indigo-600',
      text: 'text-indigo-900',
      subText: 'text-indigo-600/70',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      icon: <Wallet size={20} />,
    },
    income: {
      gradient: 'from-emerald-400 to-teal-500',
      text: 'text-emerald-800',
      subText: 'text-emerald-600/70',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: <TrendingUp size={20} />,
    },
    expense: {
      gradient: 'from-rose-400 to-pink-500',
      text: 'text-rose-800',
      subText: 'text-rose-600/70',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      icon: <TrendingDown size={20} />,
    },
  };

  const s = styles[type];

  return (
    <div className="relative group overflow-hidden bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`}></div>

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${s.iconBg} ${s.iconColor} shadow-inner`}>{s.icon}</div>
        {type === 'balance' && (
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${amount >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
              {amount >= 0 ? 'Surplus' : 'Defisit'}
            </span>
            <button
              onClick={onAddInitialBalance}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-dotted"
            >
              + Isi Saldo Awal
            </button>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.subText}`}>{title}</p>
        <h3 className={`text-2xl font-black tracking-tight ${s.text} drop-shadow-sm`}>{formatIDR(amount)}</h3>
      </div>
    </div>
  );
}
