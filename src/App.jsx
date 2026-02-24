import React, { Suspense, lazy, useMemo, useState } from 'react';
import { PieChart } from 'lucide-react';
import { LoginScreenGlass } from './components/finance/auth';
import { AppHeader, DashboardView, DeleteConfirmationModal } from './components/finance/layout';
import { VIEWS } from './constants';
import { useAppAuth, useFinanceActions, useFinanceData } from './hooks';
import { calculateSummary, filterDashboardTransactions, formatIDR } from './utils';

const AnalyticsView = lazy(() =>
  import('./components/finance/analytics').then((module) => ({ default: module.AnalyticsView })),
);
const HistoryView = lazy(() =>
  import('./components/finance/history').then((module) => ({ default: module.HistoryView })),
);
const LoanView = lazy(() =>
  import('./components/finance/loans').then((module) => ({ default: module.LoanView })),
);
const VendorView = lazy(() =>
  import('./components/finance/vendors').then((module) => ({ default: module.VendorView })),
);
const ItemsView = lazy(() =>
  import('./components/finance/items').then((module) => ({ default: module.ItemsView })),
);
const EditTransactionModal = lazy(() =>
  import('./components/finance/edit-transaction-modal').then((module) => ({
    default: module.EditTransactionModal,
  })),
);
const InitialBalanceModal = lazy(() =>
  import('./components/finance/initial-balance-modal').then((module) => ({
    default: module.InitialBalanceModal,
  })),
);

function ContentLoading() {
  return <div className="py-12 text-center text-sm font-medium text-gray-500">Memuat konten...</div>;
}

export default function App() {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showSaldoModal, setShowSaldoModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dashboardSearch, setDashboardSearch] = useState('');

  const { appUser, authLoading, handleLogin, handleLogout, user } = useAppAuth({
    onLogout: () => setCurrentView(VIEWS.DASHBOARD),
  });

  const { dataLoading, items, loans, repayments, transactions, vendors } = useFinanceData(user);

  const {
    executeDelete,
    handleAddLoan,
    handleAddItem,
    handleAddRepayment,
    handleAddTransaction,
    handleAddVendor,
    handleUpdateTransaction,
    promptDeleteLoan,
    promptDeleteItem,
    promptDeleteTransaction,
    promptDeleteVendor,
  } = useFinanceActions({
    appUser,
    deleteTarget,
    setDeleteTarget,
    setEditingTransaction,
    user,
  });

  const summary = useMemo(() => calculateSummary(transactions), [transactions]);

  const filteredDashboardTransactions = useMemo(
    () => filterDashboardTransactions(transactions, dashboardSearch),
    [dashboardSearch, transactions],
  );
  const paymentLookup = useMemo(() => {
    const incomeStatusById = {};
    const linkedIncomeDescriptionByExpenseId = {};
    const linkedIncomeAmountTotalByExpenseId = {};
    const marginByExpenseId = {};
    const incomeById = Object.fromEntries(
      transactions
        .filter((transaction) => transaction.type === 'income')
        .map((transaction) => [transaction.id, transaction]),
    );

    transactions
      .filter((transaction) => transaction.type === 'income')
      .forEach((income) => {
        incomeStatusById[income.id] = { paid: false };
      });

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((expense) => {
        const legacyIncomeId = expense.linkedIncomeId;
        const linkedIncomeIds = Array.isArray(expense.linkedIncomeIds)
          ? expense.linkedIncomeIds
          : legacyIncomeId
            ? [legacyIncomeId]
            : [];

        linkedIncomeIds.forEach((incomeId) => {
          if (incomeStatusById[incomeId]) {
            incomeStatusById[incomeId].paid = true;
          }
        });

        const linkedIncomes = linkedIncomeIds
          .map((incomeId) => incomeById[incomeId])
          .filter(Boolean);
        const descriptions = linkedIncomes.map((income) => income.description).filter(Boolean);
        const incomeTotal = linkedIncomes.reduce(
          (total, income) => total + Number(income.amount || 0),
          0,
        );

        linkedIncomeDescriptionByExpenseId[expense.id] =
          descriptions.length > 0
            ? descriptions.join(', ')
            : expense.linkedIncomeDescription || null;
        linkedIncomeAmountTotalByExpenseId[expense.id] = incomeTotal;
        marginByExpenseId[expense.id] = incomeTotal - Number(expense.amount || 0);
      });

    return {
      incomeStatusById,
      linkedIncomeAmountTotalByExpenseId,
      linkedIncomeDescriptionByExpenseId,
      marginByExpenseId,
    };
  }, [transactions]);

  const loading = authLoading || (Boolean(user) && dataLoading);

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

  if (!appUser) {
    return <LoginScreenGlass onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2f3] via-[#e0eafc] to-[#eef2f3] font-sans text-gray-800 pb-12 selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]"></div>
      </div>

      <AppHeader
        appUser={appUser}
        currentView={currentView}
        onLogout={handleLogout}
        setCurrentView={setCurrentView}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {currentView === VIEWS.DASHBOARD && (
          <DashboardView
            appUser={appUser}
            dashboardSearch={dashboardSearch}
            filteredDashboardTransactions={filteredDashboardTransactions}
            formatIDR={formatIDR}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={setEditingTransaction}
            onSearchChange={setDashboardSearch}
            onShowSaldoModal={() => setShowSaldoModal(true)}
            promptDeleteTransaction={promptDeleteTransaction}
            setCurrentView={setCurrentView}
            summary={summary}
            paymentLookup={paymentLookup}
            transactions={transactions}
            vendors={vendors}
          />
        )}

        {currentView === VIEWS.ANALYTICS && (
          <Suspense fallback={<ContentLoading />}>
            <AnalyticsView transactions={transactions} formatIDR={formatIDR} />
          </Suspense>
        )}

        {currentView === VIEWS.HISTORY && (
          <Suspense fallback={<ContentLoading />}>
            <HistoryView
              transactions={transactions}
              paymentLookup={paymentLookup}
              formatIDR={formatIDR}
              onDelete={promptDeleteTransaction}
              onEdit={setEditingTransaction}
            />
          </Suspense>
        )}

        {currentView === VIEWS.LOANS && (
          <Suspense fallback={<ContentLoading />}>
            <LoanView
              loans={loans}
              repayments={repayments}
              onAddLoan={handleAddLoan}
              onAddRepayment={handleAddRepayment}
              onDeleteLoan={promptDeleteLoan}
              formatIDR={formatIDR}
            />
          </Suspense>
        )}

        {currentView === VIEWS.VENDOR && (
          <Suspense fallback={<ContentLoading />}>
            <VendorView vendors={vendors} onAdd={handleAddVendor} onDelete={promptDeleteVendor} />
          </Suspense>
        )}

        {currentView === VIEWS.ITEMS && (
          <Suspense fallback={<ContentLoading />}>
            <ItemsView items={items} formatIDR={formatIDR} onAdd={handleAddItem} onDelete={promptDeleteItem} />
          </Suspense>
        )}
      </main>

      <DeleteConfirmationModal
        deleteTarget={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />

      {showSaldoModal && (
        <Suspense fallback={null}>
          <InitialBalanceModal
            onClose={() => setShowSaldoModal(false)}
            onSave={handleAddTransaction}
          />
        </Suspense>
      )}

      {editingTransaction && (
        <Suspense fallback={null}>
          <EditTransactionModal
            transaction={editingTransaction}
            vendors={vendors}
            transactions={transactions}
            onClose={() => setEditingTransaction(null)}
            onSave={handleUpdateTransaction}
          />
        </Suspense>
      )}
    </div>
  );
}
