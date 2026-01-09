import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  MinusCircle, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Save, 
  PieChart, 
  Building2, 
  Calendar, 
  Users, 
  AlertCircle, 
  Lock, 
  User, 
  LogOut, 
  ArrowRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  X, 
  LayoutDashboard, 
  History, 
  Pencil, 
  Store, 
  CreditCard, 
  Phone, 
  FileText
} from 'lucide-react';

// --- IMPORT FIREBASE ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// ==========================================
// 1. KONFIGURASI DAN INISIALISASI
// ==========================================

// Variabel ini untuk mendeteksi environment (Preview vs Production)
let firebaseConfig;
let appId = 'default-app-id';
let isPreviewEnv = false;

try {
  // Cek apakah berjalan di lingkungan Preview Gemini (Environment Variable ada)
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
    appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    isPreviewEnv = true;
  } else {
    // -----------------------------------------------------------
    // KONFIGURASI VS CODE / LOCALHOST
    // Silakan ganti bagian ini dengan Config dari Firebase Console Anda
    // -----------------------------------------------------------
    firebaseConfig = {
      apiKey: "AIzaSyAmlZ0pBAlg32Oe-BNdvOiv5duMcZejJIo",
      authDomain: "putra-buana.firebaseapp.com",
      projectId: "putra-buana",
      storageBucket: "putra-buana.firebasestorage.app",
      messagingSenderId: "899565407722",
      appId: "1:899565407722:web:1f75d3eb670857ef86b693",
      measurementId: "G-DVQM808MQP"
    };
    isPreviewEnv = false;
  }
} catch (e) {
  console.warn("Menggunakan konfigurasi fallback karena error parsing config.", e);
  // Dummy config agar tidak crash saat init pertama kali
  firebaseConfig = { apiKey: "demo", authDomain: "demo", projectId: "demo" };
}

// Inisialisasi Layanan Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. KOMPONEN UTAMA (APP)
// ==========================================

export default function App() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null); // User Firebase Auth
  const [appUser, setAppUser] = useState(null); // User Aplikasi (Aulia/Dito)
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [vendors, setVendors] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'history' | 'vendor'

  // Edit State
  const [editingTransaction, setEditingTransaction] = useState(null);

  // --- EFFECT: AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Logika login adaptif untuk Preview Environment vs Localhost
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Cek LocalStorage untuk sesi user aplikasi
      const savedUser = localStorage.getItem('cv_metavisi_user_standalone');
      if (savedUser) {
        setAppUser(JSON.parse(savedUser));
      }
      
      // Jika tidak ada user login, matikan loading agar LoginScreen muncul
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- EFFECT: DATA SYNC (FIRESTORE) ---
  useEffect(() => {
    if (!user) return;

    // Menentukan Path Koleksi (Preview vs Production)
    const trxCollectionPath = isPreviewEnv 
      ? collection(db, 'artifacts', appId, 'public', 'data', 'transactions')
      : collection(db, 'transactions');
      
    const vndCollectionPath = isPreviewEnv
      ? collection(db, 'artifacts', appId, 'public', 'data', 'vendors')
      : collection(db, 'vendors');

    // 1. Subscribe ke Data Transaksi
    const qTrx = query(trxCollectionPath);
    const unsubscribeTrx = onSnapshot(qTrx, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sorting Client-Side (Terbaru di atas)
      // Mengutamakan Tanggal Transaksi, lalu Waktu Input
      data.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date();
        const dateB = b.date ? new Date(b.date) : new Date();
        if (dateB - dateA !== 0) return dateB - dateA;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });

      setTransactions(data);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false); 
    });

    // 2. Subscribe ke Data Vendor
    const qVendors = query(vndCollectionPath);
    const unsubscribeVendors = onSnapshot(qVendors, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        // Sort Vendor (Terbaru di atas)
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setVendors(data);
    });

    return () => {
      unsubscribeTrx();
      unsubscribeVendors();
    };
  }, [user]);

  // --- LOGIKA BISNIS: AUTH ---

  const handleLogin = (name) => {
    const userData = { name, role: 'Admin' };
    setAppUser(userData);
    localStorage.setItem('cv_metavisi_user_standalone', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAppUser(null);
    localStorage.removeItem('cv_metavisi_user_standalone');
    setCurrentView('dashboard');
  };

  // --- LOGIKA BISNIS: TRANSAKSI ---

  const handleAddTransaction = async (newTransaction) => {
    if (!user) return;
    try {
      const colRef = isPreviewEnv 
        ? collection(db, 'artifacts', appId, 'public', 'data', 'transactions')
        : collection(db, 'transactions');

      await addDoc(colRef, {
        ...newTransaction,
        inputByUid: user.uid, 
        inputByName: appUser?.name || 'Admin', 
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Gagal menambah data:", error);
      alert("Gagal menyimpan. Cek koneksi internet.");
    }
  };

  const handleUpdateTransaction = async (id, updatedData) => {
    if (!user) return;
    try {
      const docRef = isPreviewEnv 
        ? doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id)
        : doc(db, 'transactions', id);

      await updateDoc(docRef, { 
        ...updatedData, 
        updatedAt: serverTimestamp(), 
        updatedBy: appUser?.name 
      });
      setEditingTransaction(null);
    } catch (error) {
      console.error("Gagal update:", error);
      alert("Gagal mengubah data.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!user) return;
    if (confirm('Hapus data transaksi ini secara permanen?')) {
      try {
        const docRef = isPreviewEnv 
            ? doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id)
            : doc(db, 'transactions', id);
        
        await deleteDoc(docRef);
      } catch (error) { 
        console.error("Gagal hapus:", error); 
      }
    }
  };

  // --- LOGIKA BISNIS: VENDOR ---

  const handleAddVendor = async (newVendor) => {
    if (!user) return;
    try {
        const colRef = isPreviewEnv 
            ? collection(db, 'artifacts', appId, 'public', 'data', 'vendors')
            : collection(db, 'vendors');

        await addDoc(colRef, {
            ...newVendor,
            createdAt: serverTimestamp(),
            createdBy: appUser?.name
        });
    } catch (error) {
        console.error("Gagal tambah vendor:", error);
        alert("Gagal menyimpan vendor.");
    }
  };

  const handleDeleteVendor = async (id) => {
      if (!user) return;
      if (confirm('Hapus data vendor ini?')) {
          try {
              const docRef = isPreviewEnv 
                ? doc(db, 'artifacts', appId, 'public', 'data', 'vendors', id)
                : doc(db, 'vendors', id);

              await deleteDoc(docRef);
          } catch(e) { 
            console.error(e); 
          }
      }
  };

  // --- HELPER FUNCTION: Summary Calculation ---
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // --- HELPER FUNCTION: Currency Formatter ---
  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  // --- RENDER LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-800 font-medium">
        <div className="animate-spin mr-3 p-2 bg-white rounded-full shadow-lg border border-indigo-100">
          <PieChart className="text-indigo-600" />
        </div>
        Memuat Sistem...
      </div>
    );
  }

  // --- RENDER LOGIN SCREEN (Jika belum login) ---
  if (!appUser) {
    return <LoginScreenGlass onLogin={handleLogin} />;
  }

  // --- RENDER UTAMA DASHBOARD ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2f3] via-[#e0eafc] to-[#eef2f3] font-sans text-gray-800 pb-12 selection:bg-indigo-500/30">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]"></div>
      </div>

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 transition-all duration-300">
        <div className="mx-4 mt-4 mb-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/5 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl lg:mx-auto">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 text-white">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">CV Metavisi</h1>
              <p className="text-xs text-indigo-600/80 font-medium mt-1 tracking-wide">Financial System</p>
            </div>
          </div>
          
          {/* Navigation & User Actions */}
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
            
            {/* Menu Navigation */}
            <nav className="flex items-center gap-1 bg-white/40 p-1 rounded-xl border border-white/50 backdrop-blur-sm mr-2 flex-shrink-0">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
              >
                <LayoutDashboard size={14} /> 
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('history')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
              >
                <History size={14} /> 
                Riwayat
              </button>
              <button 
                onClick={() => setCurrentView('vendor')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentView === 'vendor' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/40'}`}
              >
                <Store size={14} /> 
                Vendor
              </button>
            </nav>

            {/* User Profile */}
            <div className="hidden md:flex flex-col items-end mr-2 border-r border-gray-300/30 pr-4 flex-shrink-0">
              <span className="text-sm font-bold text-gray-800">{appUser.name}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100">{appUser.role}</span>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 bg-white/50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-white/60 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 flex-shrink-0"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* === VIEW 1: DASHBOARD === */}
        {currentView === 'dashboard' && (
          <>
            {/* Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <SummaryCardGlass 
                title="Total Saldo" 
                amount={summary.balance} 
                type="balance" 
                formatIDR={formatIDR} 
              />
              <SummaryCardGlass 
                title="Pemasukan" 
                amount={summary.income} 
                type="income" 
                formatIDR={formatIDR} 
              />
              <SummaryCardGlass 
                title="Pengeluaran" 
                amount={summary.expense} 
                type="expense" 
                formatIDR={formatIDR} 
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-8 duration-700">
              {/* Left Column: Form */}
              <div className="lg:col-span-4">
                <TransactionFormGlass 
                  onAdd={handleAddTransaction} 
                  vendors={vendors} 
                />
              </div>

              {/* Right Column: Recent Transactions */}
              <div className="lg:col-span-8">
                <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden relative">
                  <div className="p-6 border-b border-white/30 flex justify-between items-center bg-white/20">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2.5 text-lg">
                      Transaksi Terkini
                    </h2>
                    <button 
                      onClick={() => setCurrentView('history')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {transactions.slice(0, 5).map((t) => (
                      <TransactionItem 
                        key={t.id} 
                        t={t} 
                        formatIDR={formatIDR} 
                        onDelete={handleDeleteTransaction}
                        onEdit={setEditingTransaction}
                      />
                    ))}
                    {transactions.length === 0 && (
                      <div className="py-12 text-center text-gray-400 text-sm">
                        Belum ada transaksi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === VIEW 2: FULL HISTORY === */}
        {currentView === 'history' && (
           <HistoryView 
             transactions={transactions} 
             formatIDR={formatIDR} 
             onDelete={handleDeleteTransaction} 
             onEdit={setEditingTransaction}
           />
        )}

        {/* === VIEW 3: VENDOR MANAGEMENT === */}
        {currentView === 'vendor' && (
            <VendorView 
                vendors={vendors}
                onAdd={handleAddVendor}
                onDelete={handleDeleteVendor}
            />
        )}

      </main>

      {/* --- MODAL WINDOWS --- */}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal 
            transaction={editingTransaction} 
            vendors={vendors}
            onClose={() => setEditingTransaction(null)} 
            onSave={handleUpdateTransaction} 
        />
      )}
    </div>
  );
}

// ==========================================
// 3. SUB-COMPONENTS (TAMPILAN & FORM)
// ==========================================

// --- VENDOR VIEW ---
function VendorView({ vendors, onAdd, onDelete }) {
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

// --- HISTORY VIEW ---
function HistoryView({ transactions, formatIDR, onDelete, onEdit }) {
  const groupedTransactions = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = {
          items: [],
          totalIncome: 0,
          totalExpense: 0
        };
      }
      groups[key].items.push(t);
      if (t.type === 'income') groups[key].totalIncome += t.amount;
      else groups[key].totalExpense += t.amount;
    });
    return groups;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 shadow-xl backdrop-blur-xl">
        <Search size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Belum ada riwayat transaksi</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {Object.entries(groupedTransactions).map(([month, data]) => (
        <div key={month} className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          {/* Month Header */}
          <div className="p-6 bg-white/30 border-b border-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              {month}
            </h2>
            <div className="flex gap-4 text-xs font-bold">
              <div className="px-3 py-1.5 bg-emerald-100/50 text-emerald-700 rounded-lg border border-emerald-100">
                Masuk: {formatIDR(data.totalIncome)}
              </div>
              <div className="px-3 py-1.5 bg-rose-100/50 text-rose-700 rounded-lg border border-rose-100">
                Keluar: {formatIDR(data.totalExpense)}
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="p-4 space-y-3">
            {data.items.map(t => (
               <TransactionItem 
                  key={t.id} 
                  t={t} 
                  formatIDR={formatIDR} 
                  onDelete={onDelete} 
                  onEdit={onEdit}
                />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- ITEM TRANSAKSI (CARD) ---
function TransactionItem({ t, formatIDR, onDelete, onEdit }) {
  return (
    <div className="group p-4 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 hover:border-white shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
          t.type === 'income' 
            ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600' 
            : 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600'
        }`}>
          {t.type === 'income' ? <ArrowRight size={20} className="-rotate-45" /> : <ArrowRight size={20} className="rotate-45" />}
        </div>
        
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 truncate text-base">
            {t.description || t.category || "Transaksi"}
          </h3>
          {t.vendorName && (
             <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-0.5">
                <Store size={10} /> {t.vendorName}
             </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="font-medium">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-indigo-400 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100/50">
              {t.inputByName?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-base ${
          t.type === 'income' ? 'text-emerald-600 drop-shadow-sm' : 'text-rose-600 drop-shadow-sm'
        }`}>
          {t.type === 'income' ? '+' : '-'} {formatIDR(t.amount)}
        </p>
        
        {/* ACTION BUTTONS (Edit & Delete) */}
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

// --- MODAL EDIT ---
function EditTransactionModal({ transaction, onClose, onSave, vendors }) {
    const [amount, setAmount] = useState(transaction.amount);
    const [date, setDate] = useState(transaction.date);
    const [description, setDescription] = useState(transaction.description || '');
    const [type, setType] = useState(transaction.type);
    const [vendorId, setVendorId] = useState(transaction.vendorId || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const selectedVendor = vendors.find(v => v.id === vendorId);
        
        await onSave(transaction.id, {
            amount: parseFloat(amount),
            date,
            description,
            type,
            category: type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            vendorId: vendorId || null,
            vendorName: selectedVendor ? selectedVendor.name : null
        });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-indigo-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">Edit Transaksi</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Type Toggle */}
                    <div className="flex p-1 bg-gray-100/80 rounded-xl">
                        <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
                            Pemasukan
                        </button>
                        <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}>
                            Pengeluaran
                        </button>
                    </div>

                    {/* VENDOR SELECT IN EDIT */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vendor / Klien</label>
                        <select 
                            value={vendorId} onChange={(e) => setVendorId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none text-sm appearance-none"
                        >
                            <option value="">-- Tidak Ada --</option>
                            {vendors && vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Jumlah</label>
                        <input 
                            type="number" required 
                            value={amount} onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tanggal</label>
                        <input 
                            type="date" required 
                            value={date} onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Keterangan</label>
                        <textarea 
                            rows="2" 
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none resize-none" 
                        />
                    </div>

                    <button 
                        type="submit" disabled={isSaving}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all mt-2"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- FORM TRANSAKSI ---
function TransactionFormGlass({ onAdd, vendors }) {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        vendorName: selectedVendor ? selectedVendor.name : null
    });
    
    // Reset Form
    setAmount('');
    setDescription('');
    setVendorId('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-lg font-bold text-gray-800">Transaksi Baru</h2>
        <div className="flex p-1 bg-white/50 rounded-xl border border-white/40 backdrop-blur-sm">
          <button onClick={() => setType('income')} className={`p-2 rounded-lg transition-all duration-300 ${type === 'income' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-gray-600'}`}>
            <PlusCircle size={20} />
          </button>
          <button onClick={() => setType('expense')} className={`p-2 rounded-lg transition-all duration-300 ${type === 'expense' ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-400 hover:text-gray-600'}`}>
            <MinusCircle size={20} />
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Jumlah (Rp)</label>
          <div className="relative group">
            <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
            <input
              type="number" required min="0" placeholder="0"
              value={amount} onChange={(e) => setAmount(e.target.value)}
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

// --- LOGIN SCREEN ---
function LoginScreenGlass({ onLogin }) {
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

// --- SUMMARY CARD ---
function SummaryCardGlass({ title, amount, type, formatIDR }) {
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
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${amount >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            {amount >= 0 ? 'Surplus' : 'Defisit'}
          </span>
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