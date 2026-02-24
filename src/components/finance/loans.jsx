import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  PlusCircle,
  Users,
  Wallet,
} from 'lucide-react';

export function LoanView({ loans, repayments, onAddLoan, onAddRepayment, onDeleteLoan, formatIDR }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState(null);

    // Summary calculation for header
    const summary = useMemo(() => {
        let totalLent = 0;
        let totalPaid = 0;
        loans.forEach(l => { totalLent += Number(l.totalAmount) });
        repayments.forEach(r => { totalPaid += Number(r.amount) });
        return { totalLent, totalPaid, remaining: totalLent - totalPaid };
    }, [loans, repayments]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2 text-indigo-800">
                        <CreditCard size={20} className="text-indigo-600"/>
                        <span className="font-bold text-xs uppercase tracking-wider">Total Dipinjamkan</span>
                    </div>
                    <p className="text-2xl font-black text-indigo-900">{formatIDR(summary.totalLent)}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50">
                    <div className="flex items-center gap-3 mb-2 text-emerald-800">
                        <CheckCircle2 size={20} className="text-emerald-600"/>
                        <span className="font-bold text-xs uppercase tracking-wider">Sudah Kembali</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-900">{formatIDR(summary.totalPaid)}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50">
                    <div className="flex items-center gap-3 mb-2 text-rose-800">
                        <AlertCircle size={20} className="text-rose-600"/>
                        <span className="font-bold text-xs uppercase tracking-wider">Sisa Piutang</span>
                    </div>
                    <p className="text-2xl font-black text-rose-900">{formatIDR(summary.remaining)}</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-xl p-4 rounded-3xl border border-white/50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Users size={20} className="text-indigo-600"/> Daftar Peminjam
                </h2>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    <PlusCircle size={16}/> Buat Pinjaman Baru
                </button>
            </div>

            {/* Loans List */}
            <div className="grid grid-cols-1 gap-4">
                {loans.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 text-gray-400">
                        Belum ada data pinjaman.
                    </div>
                ) : (
                    loans.map(loan => {
                        // Calculate specific loan progress
                        const loanRepayments = repayments.filter(r => r.loanId === loan.id);
                        const paid = loanRepayments.reduce((sum, r) => sum + Number(r.amount), 0);
                        const progress = Math.min((paid / loan.totalAmount) * 100, 100);
                        const isPaidOff = paid >= loan.totalAmount;

                        return (
                            <div key={loan.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/60 hover:border-white shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                                            {loan.debtorName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{loan.debtorName}</h3>
                                            <p className="text-xs text-gray-500 font-medium">{loan.description || 'Pinjaman Tunai'}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Tgl: {new Date(loan.startDate).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Pinjaman</p>
                                        <p className="text-xl font-black text-gray-800">{formatIDR(loan.totalAmount)}</p>
                                        {isPaidOff ? (
                                            <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                                                LUNAS
                                            </span>
                                        ) : (
                                            <span className="inline-block bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 mt-1">
                                                Belum Lunas
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative z-10 mb-4">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                        <span>Terbayar: {formatIDR(paid)}</span>
                                        <span>Sisa: {formatIDR(loan.totalAmount - paid)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-1000 ${isPaidOff ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Repayment History (Brief) */}
                                {loanRepayments.length > 0 && (
                                    <div className="relative z-10 bg-white/50 rounded-xl p-3 mb-4 border border-white/50">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Riwayat Cicilan</p>
                                        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                            {loanRepayments.map(r => (
                                                <div key={r.id} className="flex justify-between text-xs font-medium text-gray-700 border-b border-gray-200/50 pb-1 last:border-0 last:pb-0">
                                                    <span>{new Date(r.date).toLocaleDateString('id-ID')}</span>
                                                    <span className="text-emerald-600">+{formatIDR(r.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-3 relative z-10 border-t border-gray-100 pt-3">
                                    <button 
                                        onClick={() => onDeleteLoan(loan.id)}
                                        className="px-3 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Hapus
                                    </button>
                                    {!isPaidOff && (
                                        <button 
                                            onClick={() => setSelectedLoanForRepayment({ ...loan, paid, remaining: loan.totalAmount - paid })}
                                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all flex items-center gap-1"
                                        >
                                            <Wallet size={12}/> Bayar Cicilan
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODALS */}
            {isFormOpen && (
                <AddLoanModal 
                    onClose={() => setIsFormOpen(false)} 
                    onSave={onAddLoan} 
                />
            )}

            {selectedLoanForRepayment && (
                <AddRepaymentModal
                    loan={selectedLoanForRepayment}
                    onClose={() => setSelectedLoanForRepayment(null)}
                    onSave={onAddRepayment}
                    formatIDR={formatIDR}
                />
            )}
        </div>
    );
}

// --- MODAL: ADD LOAN ---
export function AddLoanModal({ onClose, onSave }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState(''); // Raw number
    const [displayAmount, setDisplayAmount] = useState(''); // With dots
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [desc, setDesc] = useState('');
    const [syncTransaction, setSyncTransaction] = useState(true);

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setAmount(rawValue);
        if (rawValue) {
            setDisplayAmount(new Intl.NumberFormat('id-ID').format(rawValue));
        } else {
            setDisplayAmount('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            debtorName: name,
            totalAmount: parseFloat(amount),
            startDate: date,
            description: desc || 'Pinjaman Karyawan/Pribadi',
            status: 'active'
        }, syncTransaction);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl p-6 relative">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Catat Pinjaman Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Nama Peminjam</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Jumlah (Rp)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-2 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
                            <input 
                                type="text" 
                                required 
                                value={displayAmount} 
                                onChange={handleAmountChange} 
                                className="w-full pl-12 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Tanggal</label>
                        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Keterangan</label>
                        <textarea rows="2" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"/>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <input 
                            type="checkbox" 
                            id="syncTrx" 
                            checked={syncTransaction} 
                            onChange={e => setSyncTransaction(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                        />
                        <label htmlFor="syncTrx" className="text-xs font-medium text-rose-700 cursor-pointer select-none">
                            Catat otomatis sebagai <b>Pengeluaran</b> di Dashboard? (Saldo berkurang)
                        </label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold mt-2">Simpan Data</button>
                </form>
            </div>
        </div>
    );
}

// --- MODAL: ADD REPAYMENT ---
export function AddRepaymentModal({ loan, onClose, onSave, formatIDR }) {
    const [amount, setAmount] = useState(''); // Raw number
    const [displayAmount, setDisplayAmount] = useState(''); // With dots
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [syncTransaction, setSyncTransaction] = useState(true);

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        // Prevent typing more than remaining
        if (parseFloat(rawValue) > loan.remaining) return; 
        
        setAmount(rawValue);
        if (rawValue) {
            setDisplayAmount(new Intl.NumberFormat('id-ID').format(rawValue));
        } else {
            setDisplayAmount('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            loanId: loan.id,
            debtorName: loan.debtorName,
            amount: parseFloat(amount),
            date,
            note: note || 'Pembayaran Cicilan'
        }, syncTransaction);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl p-6 relative">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Bayar Cicilan</h3>
                <p className="text-xs text-gray-500 mb-4">Peminjam: <span className="font-bold text-indigo-600">{loan.debtorName}</span> • Sisa: {formatIDR(loan.remaining)}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Jumlah Bayar (Rp)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-2 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
                            <input 
                                type="text" 
                                required 
                                value={displayAmount} 
                                onChange={handleAmountChange} 
                                className="w-full pl-12 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Tanggal Bayar</label>
                        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Catatan (Opsional)</label>
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"/>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <input 
                            type="checkbox" 
                            id="syncRepay" 
                            checked={syncTransaction} 
                            onChange={e => setSyncTransaction(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="syncRepay" className="text-xs font-medium text-emerald-700 cursor-pointer select-none">
                            Catat otomatis sebagai <b>Pemasukan</b> di Dashboard? (Saldo bertambah)
                        </label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold mt-2">Simpan Pembayaran</button>
                </form>
            </div>
        </div>
    );
}

