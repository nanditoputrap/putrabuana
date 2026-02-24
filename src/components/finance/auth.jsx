import React from 'react';
import { Building2 } from 'lucide-react';

export function LoginScreenGlass({ onLogin }) {
  const handleUserClick = (name) => {
    // Langsung login tanpa PIN
    onLogin(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[100px]"></div>

      <div className="bg-white/30 backdrop-blur-2xl max-w-sm w-full rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden relative z-10 p-8">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 transform rotate-3">
                <Building2 size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-1">CV Metavisi</h1>
            <p className="text-indigo-600/70 font-semibold text-sm">Dashboard Keuangan</p>
        </div>
        
        <div className="space-y-4">
            <p className="text-center text-gray-500 text-sm mb-4 font-medium">Klik nama Anda untuk masuk:</p>
            <div className="grid grid-cols-2 gap-4">
                <button 
                onClick={() => handleUserClick('Aulia')}
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white/40 hover:bg-white/80 border border-white/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 mb-3 shadow-lg shadow-pink-400/30 flex items-center justify-center text-white font-bold text-lg">A</div>
                <span className="font-bold text-gray-700 group-hover:text-pink-600 transition-colors">Aulia</span>
                <span className="absolute inset-0 rounded-2xl ring-2 ring-pink-400/0 group-hover:ring-pink-400/50 transition-all"></span>
                </button>
                
                <button 
                onClick={() => handleUserClick('Dito')}
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white/40 hover:bg-white/80 border border-white/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 mb-3 shadow-lg shadow-blue-400/30 flex items-center justify-center text-white font-bold text-lg">D</div>
                <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Dito</span>
                <span className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/0 group-hover:ring-blue-400/50 transition-all"></span>
                </button>
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 font-medium">© 2026 CV Metavisi Akademika</p>
        </div>
      </div>
    </div>
  );
}

