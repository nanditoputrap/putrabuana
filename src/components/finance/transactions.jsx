import React from 'react';
import { ArrowRight, Pencil, Store, Trash2 } from 'lucide-react';

export function TransactionItem({ t, paymentLookup, formatIDR, onDelete, onEdit }) {
  const incomeStatus = paymentLookup?.incomeStatusById?.[t.id];
  const linkedIncomeDescription =
    paymentLookup?.linkedIncomeDescriptionByExpenseId?.[t.id] || t.linkedIncomeDescription;
  const linkedIncomeAmountTotal = Number(
    paymentLookup?.linkedIncomeAmountTotalByExpenseId?.[t.id] || t.linkedIncomeAmountTotal || 0,
  );
  const marginValue =
    t.type === 'expense'
      ? Number(
          paymentLookup?.marginByExpenseId?.[t.id] ??
            (linkedIncomeAmountTotal ? linkedIncomeAmountTotal - Number(t.amount || 0) : 0),
        )
      : 0;
  const marginBadge =
    marginValue > 0
      ? {
          label: `Surplus +${formatIDR(marginValue)}`,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        }
      : marginValue < 0
        ? {
            label: `Rugi ${formatIDR(Math.abs(marginValue))}`,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
          }
        : {
            label: 'Impas',
            className: 'bg-slate-50 text-slate-700 border-slate-200',
          };

  return (
    <div className="group p-4 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 hover:border-white shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 overflow-hidden">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
            t.type === 'income'
              ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600'
              : 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600'
          }`}
        >
          {t.type === 'income' ? <ArrowRight size={20} className="-rotate-45" /> : <ArrowRight size={20} className="rotate-45" />}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-800 truncate text-base mb-0.5">{t.description || 'Transaksi'}</h3>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`px-1.5 py-0.5 rounded-md font-bold border ${
                t.type === 'income'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
            >
              {t.category || (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
            </span>

            {t.vendorName && (
              <div className="flex items-center gap-1 text-indigo-600 font-medium">
                <Store size={10} /> {t.vendorName}
              </div>
            )}

            {t.itemName && (
              <span className="px-1.5 py-0.5 rounded-md font-bold border bg-indigo-50 text-indigo-600 border-indigo-200">
                Item: {t.itemName}
              </span>
            )}

            {t.type === 'income' && (
              <span
                className={`px-1.5 py-0.5 rounded-md font-bold border ${
                  incomeStatus?.paid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {incomeStatus?.paid ? 'LUNAS' : 'BELUM DIBAYAR'}
              </span>
            )}

            {t.type === 'expense' && linkedIncomeDescription && (
              <span className="px-1.5 py-0.5 rounded-md font-bold border bg-blue-50 text-blue-700 border-blue-200">
                Bayar: {linkedIncomeDescription}
              </span>
            )}

            {t.type === 'expense' && linkedIncomeDescription && (
              <span className={`px-1.5 py-0.5 rounded-md font-bold border ${marginBadge.className}`}>
                {marginBadge.label}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 mt-1.5 font-medium">
            <span>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Input: {t.inputByName?.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-base ${t.type === 'income' ? 'text-emerald-600 drop-shadow-sm' : 'text-rose-600 drop-shadow-sm'}`}>
          {t.type === 'income' ? '+' : '-'} {formatIDR(t.amount)}
        </p>

        <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(t)}
            className="text-[10px] text-blue-500 hover:text-blue-700 font-bold tracking-wide uppercase flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100"
          >
            <Pencil size={10} /> Edit
          </button>
          <button
            onClick={() => onDelete(t.id)}
            className="text-[10px] text-red-500 hover:text-red-700 font-bold tracking-wide uppercase flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md border border-red-100"
          >
            <Trash2 size={10} /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
