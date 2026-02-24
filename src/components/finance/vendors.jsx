import React, { useState } from 'react';
import { FileText, Store, Trash2 } from 'lucide-react';

export function VendorView({ vendors, onAdd, onDelete }) {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [description, setDescription] = useState('');
    const [bankName, setBankName] = useState('BCA');
    const [accountNumber, setAccountNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bankOptions = [
        { id: 'BCA', name: 'BCA', color: 'bg-blue-600', text: 'text-white' },
        { id: 'Mandiri', name: 'Mandiri', color: 'bg-yellow-400', text: 'text-blue-900' },
        { id: 'BNI', name: 'BNI', color: 'bg-orange-500', text: 'text-white' },
        { id: 'BRI', name: 'BRI', color: 'bg-blue-800', text: 'text-white' },
        { id: 'BSI', name: 'BSI', color: 'bg-teal-600', text: 'text-white' },
        { id: 'Lainnya', name: 'Lainnya', color: 'bg-gray-500', text: 'text-white' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;
        setIsSubmitting(true);
        await onAdd({ name, contact, description, bankName, accountNumber });
        setName(''); setContact(''); setDescription(''); setAccountNumber('');
        setIsSubmitting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-4 duration-500">
            {/* VENDOR FORM */}
            <div className="lg:col-span-4">
                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                         <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md">
                             <Store size={20} />
                         </div>
                        <h2 className="text-lg font-bold text-gray-800">Tambah Vendor</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nama Vendor</label>
                            <input 
                                type="text" required placeholder="Contoh: CV Maju Jaya"
                                value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all text-sm font-bold text-gray-800 shadow-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nomor Kontak</label>
                            <input 
                                type="text" placeholder="0812..."
                                value={contact} onChange={(e) => setContact(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all text-sm font-medium text-gray-800 shadow-sm"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Keterangan</label>
                            <input 
                                type="text" placeholder="Produk/Jasa"
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all text-sm font-medium text-gray-800 shadow-sm"
                            />
                        </div>
                        
                        <div className="pt-2 pb-1">
                             <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-1">Bank</label>
                             <div className="grid grid-cols-3 gap-2 mb-2">
                                 {bankOptions.map(b => (
                                     <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setBankName(b.id)}
                                        className={`px-2 py-2 rounded-lg text-xs font-bold transition-all border ${bankName === b.id ? 'ring-2 ring-indigo-400 ring-offset-1 scale-105 shadow-md' : 'opacity-70 hover:opacity-100 border-transparent'} ${b.color} ${b.text}`}
                                     >
                                         {b.name}
                                     </button>
                                 ))}
                             </div>
                             <input 
                                type="number" placeholder="Nomor Rekening"
                                value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400/30 outline-none transition-all font-mono text-sm font-bold text-gray-800 shadow-sm"
                             />
                        </div>

                        <button
                        type="submit" disabled={isSubmitting}
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-[0.98] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 mt-2"
                        >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Vendor'}
                        </button>
                    </form>
                </div>
            </div>

            {/* VENDOR LIST */}
            <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vendors.length === 0 ? (
                         <div className="col-span-full py-20 text-center text-gray-400 bg-white/40 rounded-3xl border border-white/50">
                            <Store size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Belum ada data vendor</p>
                        </div>
                    ) : (
                        vendors.map(v => {
                             const bankStyle = bankOptions.find(b => b.id === v.bankName) || bankOptions[5];
                             return (
                                <div key={v.id} className="group bg-white/60 hover:bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-white/60 hover:border-white shadow-sm hover:shadow-lg transition-all duration-300 relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner">
                                                {v.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 leading-tight">{v.name}</h3>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">{v.contact || '-'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onDelete(v.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    {v.description && (
                                        <div className="mb-4 bg-indigo-50/50 p-2 rounded-lg border border-indigo-50">
                                            <p className="text-xs text-indigo-700 font-medium flex items-start gap-1.5">
                                                <FileText size={12} className="mt-0.5 flex-shrink-0" />
                                                {v.description}
                                            </p>
                                        </div>
                                    )}

                                    {v.accountNumber && (
                                        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100">
                                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${bankStyle.color} ${bankStyle.text}`}>
                                                {v.bankName}
                                            </div>
                                            <p className="font-mono text-sm font-bold text-gray-600 tracking-wide select-all">
                                                {v.accountNumber}
                                            </p>
                                        </div>
                                    )}
                                </div>
                             )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

