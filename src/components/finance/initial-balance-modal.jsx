import React, { useState } from 'react';

export function InitialBalanceModal({ onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');

  const handleAmountChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setAmount(rawValue);

    if (rawValue) {
      const formatted = new Intl.NumberFormat('id-ID').format(rawValue);
      setDisplayAmount(formatted);
    } else {
      setDisplayAmount('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!amount) return;

    onSave({
      type: 'income',
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      category: 'Saldo Awal',
      description: 'Saldo Awal Sistem',
      vendorName: null,
      vendorId: null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/60 p-6 relative">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Isi Saldo Awal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
            <input
              type="text"
              required
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all font-mono text-lg font-bold text-gray-800 shadow-sm"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold">
            Simpan Saldo
          </button>
        </form>
      </div>
    </div>
  );
}
