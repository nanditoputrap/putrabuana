import React, { useState } from 'react';
import { Percent, Tag, Trash2 } from 'lucide-react';

export function ItemsView({ items, formatIDR, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const [usesUnitPricing, setUsesUnitPricing] = useState(true);
  const [unitName, setUnitName] = useState('meter');
  const [vendorUnitCost, setVendorUnitCost] = useState('');
  const [displayVendorUnitCost, setDisplayVendorUnitCost] = useState('');
  const [customerUnitPrice, setCustomerUnitPrice] = useState('');
  const [displayCustomerUnitPrice, setDisplayCustomerUnitPrice] = useState('');
  const [priceDiff, setPriceDiff] = useState('');
  const [displayPriceDiff, setDisplayPriceDiff] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUnitItem = (item) =>
    Boolean(
      item && (item.usesUnitPricing === true || (item.usesUnitPricing !== false && (item.customerUnitPrice || item.vendorUnitCost))),
    );

  const handleVendorCostChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setVendorUnitCost(rawValue);
    setDisplayVendorUnitCost(rawValue ? new Intl.NumberFormat('id-ID').format(rawValue) : '');
  };

  const handleCustomerPriceChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setCustomerUnitPrice(rawValue);
    setDisplayCustomerUnitPrice(rawValue ? new Intl.NumberFormat('id-ID').format(rawValue) : '');
  };

  const handleDiffChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setPriceDiff(rawValue);
    setDisplayPriceDiff(rawValue ? new Intl.NumberFormat('id-ID').format(rawValue) : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name) return;
    if (usesUnitPricing && (!vendorUnitCost || !customerUnitPrice)) return;
    if (!usesUnitPricing && !priceDiff) return;

    setIsSubmitting(true);
    const vendorPrice = parseFloat(vendorUnitCost || '0');
    const customerPrice = parseFloat(customerUnitPrice || '0');
    const diffValue = usesUnitPricing
      ? Math.max(customerPrice - vendorPrice, 0)
      : parseFloat(priceDiff || '0');

    await onAdd({
      name,
      usesUnitPricing,
      unitName: usesUnitPricing ? (unitName || 'item') : null,
      vendorUnitCost: usesUnitPricing ? vendorPrice : null,
      customerUnitPrice: usesUnitPricing ? customerPrice : null,
      priceDiff: diffValue,
    });

    setName('');
    setUsesUnitPricing(true);
    setUnitName('meter');
    setVendorUnitCost('');
    setDisplayVendorUnitCost('');
    setCustomerUnitPrice('');
    setDisplayCustomerUnitPrice('');
    setPriceDiff('');
    setDisplayPriceDiff('');
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-4">
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md">
              <Tag size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Tambah Item</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nama Item</label>
              <input
                type="text"
                required
                placeholder="Contoh: Spanduk Keren"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all text-sm font-bold text-gray-800 shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Tipe Item</label>
              <div className="flex items-center gap-2 text-sm bg-white/50 border border-white/60 rounded-xl px-3 py-2.5">
                <input
                  id="usesUnitPricing"
                  type="checkbox"
                  checked={usesUnitPricing}
                  onChange={(event) => setUsesUnitPricing(event.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="usesUnitPricing" className="text-gray-700 font-medium cursor-pointer">
                  Gunakan satuan (meter/pcs) dan harga per satuan
                </label>
              </div>
            </div>

            {usesUnitPricing ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={unitName}
                    onChange={(event) => setUnitName(event.target.value)}
                    placeholder="meter, pcs, lembar"
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all text-sm font-medium text-gray-800 shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Harga Vendor per {unitName || 'item'} (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                    <input
                      type="text"
                      required
                      value={displayVendorUnitCost}
                      onChange={handleVendorCostChange}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all font-mono text-sm font-bold text-gray-800 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Harga Customer per {unitName || 'item'} (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                    <input
                      type="text"
                      required
                      value={displayCustomerUnitPrice}
                      onChange={handleCustomerPriceChange}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all font-mono text-sm font-bold text-gray-800 shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 px-1">
                    Selisih otomatis dihitung dari harga customer dikurangi harga vendor.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Selisih Harga (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    required
                    value={displayPriceDiff}
                    onChange={handleDiffChange}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all font-mono text-sm font-bold text-gray-800 shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-500 px-1">
                  Untuk item tanpa satuan, isi selisih langsung per transaksi.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-[0.98] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 mt-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Item'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 bg-white/40 rounded-3xl border border-white/50">
              <Tag size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada data item</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group bg-white/60 hover:bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-white/60 hover:border-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 leading-tight text-lg">{item.name}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {isUnitItem(item) ? `Per ${item.unitName || 'item'}` : 'Tanpa satuan'}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 space-y-2">
                  {isUnitItem(item) && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-indigo-700">Vendor</span>
                        <span className="font-black text-indigo-800">{formatIDR(item.vendorUnitCost || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-indigo-700">Customer</span>
                        <span className="font-black text-indigo-800">{formatIDR(item.customerUnitPrice || 0)}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-indigo-100 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                      <Percent size={16} /> Selisih
                    </div>
                    <span className="font-black text-indigo-800">{formatIDR(item.priceDiff || 0)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
