const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const calculateSummary = (transactions) => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return { income, expense, balance: income - expense };
};

const filterDashboardTransactions = (transactions, searchTerm, limit = 5) => {
  const normalizedTerm = searchTerm.toLowerCase();

  return transactions
    .filter((transaction) => {
      if (!searchTerm) return true;
      return (
        (transaction.description && transaction.description.toLowerCase().includes(normalizedTerm)) ||
        (transaction.vendorName && transaction.vendorName.toLowerCase().includes(normalizedTerm)) ||
        (transaction.amount && transaction.amount.toString().includes(normalizedTerm))
      );
    })
    .slice(0, limit);
};

export { calculateSummary, filterDashboardTransactions, formatIDR };
