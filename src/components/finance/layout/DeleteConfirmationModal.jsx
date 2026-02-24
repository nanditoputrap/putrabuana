import React from 'react';
import { AlertTriangle } from 'lucide-react';

function DeleteConfirmationModal({ deleteTarget, onClose, onConfirm }) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500">{deleteTarget.message}</p>

          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DeleteConfirmationModal };
