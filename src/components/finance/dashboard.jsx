import React, { useState } from 'react';
import { MinusCircle, PlusCircle, Store, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

// --- FORM TRANSAKSI ---
export function TransactionFormGlass({ onAdd, vendors = [], items = [], transactions = [], formatIDR }) {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState(''); // Nilai murni (angka)
  const [displayAmount, setDisplayAmount] = useState(''); // Nilai tampilan (dengan titik)
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [itemId, setItemId] = useState('');
  const [linkedIncomeId, setLinkedIncomeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItem = items.find((item) => item.id === itemId);
  const incomeTransactions = transactions.filter((transaction) => transaction.type === 'income');
  const alreadyLinkedIncomeIds = new Set(
    transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.linkedIncomeId)
      .map((transaction) => transaction.linkedIncomeId),
  );
  const linkableIncomeTransactions = incomeTransactions.filter(
    (transaction) => transaction.itemId && !alreadyLinkedIncomeIds.has(transaction.id),
  );
  const selectedIncome = linkableIncomeTransactions.find((transaction) => transaction.id === linkedIncomeId);
  const autoPayableAmount = selectedIncome
    ? Math.max(Number(selectedIncome.amount || 0) - Number(selectedIncome.itemPriceDiff || 0), 0)
    : 0;

  const setAmountFromNumber = (value) => {
    const normalized = String(Math.max(0, Math.round(Number(value) || 0)));
    setAmount(normalized);
    setDisplayAmount(normalized ? new Intl.NumberFormat('id-ID').format(normalized) : '');
  };

  // Fungsi untuk menangani input angka dengan format ribuan
  const handleAmountChange = (e) => {
    // Hapus karakter selain angka
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmount(rawValue);
    
    // Format ke tampilan Rupiah (ribuan)
    if (rawValue) {
        const formatted = new Intl.NumberFormat('id-ID').format(rawValue);
        setDisplayAmount(formatted);
    } else {
        setDisplayAmount('');
    }
  };

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setAmount('');
    setDisplayAmount('');
    setItemId('');
    setLinkedIncomeId('');
  };

  const handleIncomeItemChange = (nextItemId) => {
    setItemId(nextItemId);
    if (!description) {
      const item = items.find((it) => it.id === nextItemId);
      if (item) setDescription(item.name);
    }
  };

  const handleLinkedIncomeChange = (incomeId) => {
    setLinkedIncomeId(incomeId);
    if (!incomeId) {
      setAmount('');
      setDisplayAmount('');
      return;
    }

    const income = linkableIncomeTransactions.find((transaction) => transaction.id === incomeId);
    if (!income) return;

    const difference = Number(income.itemPriceDiff || 0);
    const payable = Math.max(Number(income.amount || 0) - difference, 0);
    setAmountFromNumber(payable);
    setDate(income.date || date);

    if (!description) {
      const itemName = income.itemName || 'Item';
      setDescription(`Bayar vendor untuk ${itemName}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsSubmitting(true);
    const selectedVendor = vendors.find(v => v.id === vendorId);
    
    await onAdd({ 
        type, 
        amount: parseFloat(amount), 
        date, 
        // Kategori otomatis berdasarkan tipe
        category: type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        description: description || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
        vendorId: vendorId || null,
        vendorName: selectedVendor ? selectedVendor.name : null,
        itemId: type === 'income' ? (selectedItem?.id || null) : (selectedIncome?.itemId || null),
        itemName: type === 'income' ? (selectedItem?.name || null) : (selectedIncome?.itemName || null),
        itemPriceDiff: type === 'income' ? Number(selectedItem?.priceDiff || 0) : Number(selectedIncome?.itemPriceDiff || 0),
        linkedIncomeId: type === 'expense' ? (selectedIncome?.id || null) : null,
        linkedIncomeAmount: type === 'expense' ? Number(selectedIncome?.amount || 0) : null,
        payableToVendor: type === 'expense' ? parseFloat(amount) : null,
    });
    
    // Reset Form
    setAmount('');
    setDisplayAmount('');
    setDescription('');
    setVendorId('');
    setItemId('');
    setLinkedIncomeId('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-lg font-bold text-gray-800">Transaksi Baru</h2>
        <div className="flex p-1 bg-white/50 rounded-xl border border-white/40 backdrop-blur-sm">
          <button onClick={() => handleTypeChange('income')} className={`p-2 rounded-lg transition-all duration-300 ${type === 'income' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-gray-600'}`}>
            <PlusCircle size={20} />
          </button>
          <button onClick={() => handleTypeChange('expense')} className={`p-2 rounded-lg transition-all duration-300 ${type === 'expense' ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-400 hover:text-gray-600'}`}>
            <MinusCircle size={20} />
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        {type === 'income' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Item (Opsional)</label>
            <div className="relative">
              <select
                value={itemId}
                onChange={(e) => handleIncomeItemChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm font-medium text-gray-700 appearance-none shadow-sm cursor-pointer"
              >
                <option value="">-- Pilih Item --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Selisih {formatIDR(item.priceDiff || 0)})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                <Store size={16} />
              </div>
            </div>
          </div>
        )}

        {type === 'expense' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Pilih Transaksi Masuk Item</label>
            <select
              value={linkedIncomeId}
              onChange={(e) => handleLinkedIncomeChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm font-medium text-gray-700 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">-- Pilih Transaksi Masuk --</option>
              {linkableIncomeTransactions.map((income) => (
                <option key={income.id} value={income.id}>
                  {income.itemName || income.description} - {formatIDR(income.amount || 0)}
                </option>
              ))}
            </select>
            {selectedIncome && (
              <div className="text-[11px] px-2 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                Harga masuk: <b>{formatIDR(selectedIncome.amount || 0)}</b> • Selisih item: <b>{formatIDR(selectedIncome.itemPriceDiff || 0)}</b> • Bayar vendor otomatis: <b>{formatIDR(autoPayableAmount)}</b>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Jumlah (Rp)</label>
          <div className="relative group">
            <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
            {/* Ubah type menjadi text untuk mendukung titik */}
            <input
              type="text" required placeholder="0"
              value={displayAmount} onChange={handleAmountChange}
              readOnly={type === 'expense' && Boolean(selectedIncome)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all font-mono text-lg font-bold text-gray-800 placeholder-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Tanggal</label>
            <input
                type="date" required
                value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm font-medium text-gray-700 shadow-sm"
            />
        </div>
        
        {/* VENDOR SELECTION */}
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Vendor / Klien (Opsional)</label>
            <div className="relative">
                <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm font-medium text-gray-700 appearance-none shadow-sm cursor-pointer"
                >
                    <option value="">-- Pilih Vendor --</option>
                    {vendors && vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                    <Store size={16} /> 
                </div>
            </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Keterangan Transaksi</label>
          <textarea
            rows="3" placeholder="Contoh: Beli Kertas, Bayar Listrik..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 outline-none transition-all text-sm resize-none shadow-sm"
          />
        </div>

        <button
          type="submit" disabled={isSubmitting}
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
      icon: <Wallet size={20} />
    },
    income: {
      gradient: 'from-emerald-400 to-teal-500',
      text: 'text-emerald-800',
      subText: 'text-emerald-600/70',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: <TrendingUp size={20} />
    },
    expense: {
      gradient: 'from-rose-400 to-pink-500',
      text: 'text-rose-800',
      subText: 'text-rose-600/70',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      icon: <TrendingDown size={20} />
    }
  };

  const s = styles[type];

  return (
    <div className="relative group overflow-hidden bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Decorative Gradient Blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${s.iconBg} ${s.iconColor} shadow-inner`}>
          {s.icon}
        </div>
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
        <h3 className={`text-2xl font-black tracking-tight ${s.text} drop-shadow-sm`}>
          {formatIDR(amount)}
        </h3>
      </div>
    </div>
  );
}
