const VIEWS = {
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  HISTORY: 'history',
  LOANS: 'loans',
  VENDOR: 'vendor',
  ITEMS: 'items',
};

const APP_USER_STORAGE_KEY = 'cv_metavisi_user_standalone';

const DELETE_TARGET_MESSAGES = {
  transaction: 'Hapus data transaksi ini secara permanen?',
  vendor: 'Hapus data vendor ini?',
  loan: 'Hapus data pinjaman ini? Data cicilan terkait tidak otomatis terhapus.',
  item: 'Hapus item ini? Data transaksi lama tetap tersimpan.',
};

const DELETE_TARGET_COLLECTIONS = {
  transaction: 'transactions',
  vendor: 'vendors',
  loan: 'loans',
  item: 'items',
};

export {
  APP_USER_STORAGE_KEY,
  DELETE_TARGET_COLLECTIONS,
  DELETE_TARGET_MESSAGES,
  VIEWS,
};
