import React, { useState } from 'react';
import { X } from 'lucide-react';

export function EditTransactionModal({ transaction, onClose, onSave, vendors, items = [] }) {
  const [amount, setAmount] = useState(transaction.amount);
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description || '');
  const [type, setType] = useState(transaction.type);
  const [vendorId, setVendorId] = useState(transaction.vendorId || '');
  const [itemId, setItemId] = useState(transaction.itemId || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    const selectedVendor = vendors.find((vendor) => vendor.id === vendorId);
    const selectedItem = items.find((item) => item.id === itemId);

    await onSave(transaction.id, {
      amount: parseFloat(amount),
      date,
      description,
      type,
      category: type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      vendorId: vendorId || null,
      vendorName: selectedVendor ? selectedVendor.name : null,
      itemId: itemId || null,
      itemName: selectedItem ? selectedItem.name : null,
      itemPriceDiff: selectedItem ? Number(selectedItem.priceDiff || 0) : null,
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-indigo-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Edit Transaksi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-gray-100/80 rounded-xl">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
            >
              Pengeluaran
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vendor / Klien</label>
            <select
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none"
            >
              <option value="">-- Tidak Ada --</option>
              {vendors &&
                vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Item</label>
            <select
              value={itemId}
              onChange={(event) => setItemId(event.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none"
            >
              <option value="">-- Tidak Ada --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Jumlah</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tanggal</label>
            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Keterangan</label>
            <textarea
              rows="2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all mt-2"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
