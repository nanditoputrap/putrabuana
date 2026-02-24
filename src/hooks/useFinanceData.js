import { useEffect, useState } from 'react';
import { onSnapshot, query } from 'firebase/firestore';
import { getCollectionRef } from '../services/firebase/paths';

const sortTransactions = (items) => {
  items.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date();
    const dateB = b.date ? new Date(b.date) : new Date();
    if (dateB - dateA !== 0) return dateB - dateA;
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  });
  return items;
};

const sortByCreatedAtDesc = (items) => {
  items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return items;
};

const sortByDateDesc = (items, fieldName) => {
  items.sort((a, b) => new Date(b[fieldName]) - new Date(a[fieldName]));
  return items;
};

const useFinanceData = (user) => {
  const [transactions, setTransactions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribeTransactions = onSnapshot(query(getCollectionRef('transactions')), (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
      setTransactions(sortTransactions(items));
      setDataLoading(false);
    });

    const unsubscribeVendors = onSnapshot(query(getCollectionRef('vendors')), (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
      setVendors(sortByCreatedAtDesc(items));
    });

    const unsubscribeItems = onSnapshot(query(getCollectionRef('items')), (snapshot) => {
      const data = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
      setItems(sortByCreatedAtDesc(data));
    });

    const unsubscribeLoans = onSnapshot(query(getCollectionRef('loans')), (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
      setLoans(sortByDateDesc(items, 'startDate'));
    });

    const unsubscribeRepayments = onSnapshot(query(getCollectionRef('loan_repayments')), (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
      setRepayments(sortByDateDesc(items, 'date'));
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeVendors();
      unsubscribeItems();
      unsubscribeLoans();
      unsubscribeRepayments();
    };
  }, [user]);

  return {
    dataLoading,
    items,
    loans,
    repayments,
    transactions,
    vendors,
  };
};

export { useFinanceData };
