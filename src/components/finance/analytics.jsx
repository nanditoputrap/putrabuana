import React, { useMemo } from 'react';
import { BarChart3, Percent, TrendingDown } from 'lucide-react';

export function AnalyticsView({ transactions, formatIDR }) {
  // 1. Data Arus Kas Bulanan (Bar Chart Data)
  const monthlyData = useMemo(() => {
    const data = {};
    const last6Months = [];
    
    // Generate label 6 bulan terakhir
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }); // Jan 24
      last6Months.push(key);
      data[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      if (data[key]) {
        if (t.type === 'income') data[key].income += Number(t.amount);
        else data[key].expense += Number(t.amount);
      }
    });

    return last6Months.map(key => ({
      label: key,
      ...data[key]
    }));
  }, [transactions]);

  // 2. Efisiensi (Total)
  const totals = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const ratio = inc > 0 ? ((exp / inc) * 100).toFixed(1) : 0;
    return { inc, exp, ratio };
  }, [transactions]);

  // 3. Top Pengeluaran (Berdasarkan Keterangan/Category)
  const topExpenses = useMemo(() => {
    const groups = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        // Gunakan category atau description singkat
        const key = t.description ? t.description.substring(0, 20) : 'Lainnya'; 
        if (!groups[key]) groups[key] = 0;
        groups[key] += t.amount;
      });
    
    return Object.entries(groups)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Ambil 5 teratas
  }, [transactions]);

  // Helper untuk tinggi bar chart
  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Grafik Arus Kas Bulanan */}
      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 lg:col-span-2">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600"/>
          Analisis Arus Kas (6 Bulan Terakhir)
        </h3>
        
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {monthlyData.map((d, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="w-full flex justify-center gap-1 items-end h-48">
                {/* Bar Income */}
                <div 
                  className="w-3 sm:w-6 bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-all relative"
                  style={{ height: `${(d.income / maxVal) * 100}%` }}
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 pointer-events-none bg-white px-1 rounded shadow whitespace-nowrap z-10">
                        Masuk: {formatIDR(d.income)}
                    </div>
                </div>
                {/* Bar Expense */}
                <div 
                  className="w-3 sm:w-6 bg-rose-400 rounded-t-md hover:bg-rose-500 transition-all relative"
                  style={{ height: `${(d.expense / maxVal) * 100}%` }}
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 pointer-events-none bg-white px-1 rounded shadow whitespace-nowrap z-10">
                        Keluar: {formatIDR(d.expense)}
                    </div>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-500">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <span className="w-3 h-3 bg-emerald-400 rounded-full"></span> Pemasukan
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <span className="w-3 h-3 bg-rose-400 rounded-full"></span> Pengeluaran
            </div>
        </div>
      </div>

      {/* 2. Indikator Kesehatan Keuangan */}
      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Percent size={20} className="text-blue-600"/>
            Efisiensi Keuangan
        </h3>
        <div className="flex items-center justify-center py-6">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={totals.ratio > 80 ? '#f43f5e' : totals.ratio > 50 ? '#f59e0b' : '#10b981'}
                        strokeWidth="3"
                        strokeDasharray={`${totals.ratio}, 100`}
                        className="animate-[spin_1s_ease-out_reverse]"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-800">{totals.ratio}%</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Ratio Keluar/Masuk</span>
                </div>
            </div>
        </div>
        <div className="text-center text-xs text-gray-600 font-medium px-4">
            {totals.ratio > 100 
                ? "Peringatan: Pengeluaran melebihi pemasukan!" 
                : totals.ratio > 70 
                ? "Perhatian: Pengeluaran cukup tinggi." 
                : "Keuangan Sehat. Terus pertahankan!"}
        </div>
      </div>

      {/* 3. Top Pengeluaran */}
      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-rose-600"/>
            Top Pengeluaran
        </h3>
        <div className="space-y-3">
            {topExpenses.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/50">
                    <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-rose-100 text-rose-600 font-bold rounded-lg text-xs">
                            {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-rose-600">{formatIDR(item.amount)}</span>
                </div>
            ))}
            {topExpenses.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Belum ada data pengeluaran.</p>
            )}
        </div>
      </div>

    </div>
  );
}

