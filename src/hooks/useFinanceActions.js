import { addDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { DELETE_TARGET_COLLECTIONS, DELETE_TARGET_MESSAGES } from '../constants/app';
import { getCollectionRef, getDocRef } from '../services/firebase/paths';

const useFinanceActions = ({
  appUser,
  deleteTarget,
  setDeleteTarget,
  setEditingTransaction,
  user,
}) => {
  const handleAddTransaction = async (newTransaction) => {
    if (!user) return;

    try {
      await addDoc(getCollectionRef('transactions'), {
        ...newTransaction,
        inputByUid: user.uid,
        inputByName: appUser?.name || 'Admin',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Gagal menambah data:', error);
    }
  };

  const handleUpdateTransaction = async (id, updatedData) => {
    if (!user) return;

    try {
      await updateDoc(getDocRef('transactions', id), {
        ...updatedData,
        updatedAt: serverTimestamp(),
        updatedBy: appUser?.name,
      });
      setEditingTransaction(null);
    } catch (error) {
      console.error('Gagal update:', error);
    }
  };

  const executeDelete = async () => {
    if (!user || !deleteTarget) return;

    try {
      const collectionName = DELETE_TARGET_COLLECTIONS[deleteTarget.type] || '';
      if (!collectionName) return;

      await deleteDoc(getDocRef(collectionName, deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Gagal hapus:', error);
    }
  };

  const promptDeleteTransaction = (id) => {
    setDeleteTarget({
      id,
      type: 'transaction',
      message: DELETE_TARGET_MESSAGES.transaction,
    });
  };

  const promptDeleteVendor = (id) => {
    setDeleteTarget({
      id,
      type: 'vendor',
      message: DELETE_TARGET_MESSAGES.vendor,
    });
  };

  const promptDeleteLoan = (id) => {
    setDeleteTarget({
      id,
      type: 'loan',
      message: DELETE_TARGET_MESSAGES.loan,
    });
  };

  const promptDeleteItem = (id) => {
    setDeleteTarget({
      id,
      type: 'item',
      message: DELETE_TARGET_MESSAGES.item,
    });
  };

  const handleAddVendor = async (newVendor) => {
    if (!user) return;

    try {
      await addDoc(getCollectionRef('vendors'), {
        ...newVendor,
        createdAt: serverTimestamp(),
        createdBy: appUser?.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = async (newItem) => {
    if (!user) return;

    try {
      await addDoc(getCollectionRef('items'), {
        ...newItem,
        createdAt: serverTimestamp(),
        createdBy: appUser?.name,
      });
    } catch (error) {
      console.error('Gagal tambah item:', error);
    }
  };

  const handleAddLoan = async (loanData, addToTransactions) => {
    if (!user) return;

    try {
      await addDoc(getCollectionRef('loans'), {
        ...loanData,
        createdAt: serverTimestamp(),
        createdBy: appUser?.name,
      });

      if (addToTransactions) {
        await handleAddTransaction({
          type: 'expense',
          amount: parseFloat(loanData.totalAmount),
          date: loanData.startDate,
          category: 'Pemberian Pinjaman',
          description: `Pinjaman ke ${loanData.debtorName}`,
          vendorName: loanData.debtorName,
        });
      }
    } catch (error) {
      console.error('Gagal tambah pinjaman:', error);
    }
  };

  const handleAddRepayment = async (repaymentData, addToTransactions) => {
    if (!user) return;

    try {
      await addDoc(getCollectionRef('loan_repayments'), {
        ...repaymentData,
        createdAt: serverTimestamp(),
        createdBy: appUser?.name,
      });

      if (addToTransactions) {
        await handleAddTransaction({
          type: 'income',
          amount: parseFloat(repaymentData.amount),
          date: repaymentData.date,
          category: 'Pembayaran Piutang',
          description: `Cicilan dari ${repaymentData.debtorName}`,
        });
      }
    } catch (error) {
      console.error('Gagal tambah cicilan:', error);
    }
  };

  return {
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
  };
};

export { useFinanceActions };
