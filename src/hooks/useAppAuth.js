import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { APP_USER_STORAGE_KEY } from '../constants/app';
import { auth, getInitialAuthToken } from '../services/firebase/client';

const useAppAuth = ({ onLogout } = {}) => {
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialAuthToken = getInitialAuthToken();
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      const savedUser = localStorage.getItem(APP_USER_STORAGE_KEY);
      if (savedUser) {
        setAppUser(JSON.parse(savedUser));
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (name) => {
    const userData = { name, role: 'Admin' };
    setAppUser(userData);
    localStorage.setItem(APP_USER_STORAGE_KEY, JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAppUser(null);
    localStorage.removeItem(APP_USER_STORAGE_KEY);
    if (onLogout) onLogout();
  };

  return {
    appUser,
    authLoading,
    handleLogin,
    handleLogout,
    user,
  };
};

export { useAppAuth };
