import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser, IAddress } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<boolean>;
  addAddress: (address: IAddress) => Promise<boolean>;
  updateAddress: (id: string, address: IAddress) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  loginAsCustomer: () => Promise<boolean>;
  loginAsAdmin: () => Promise<boolean>;
  setAuthSession: (token: string, user: IUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kavah_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('kavah_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('kavah_token');
          setToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('kavah_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        localStorage.setItem('kavah_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(res.message || 'Welcome back to Kavah & Co.!');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: any): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.signup(data);
      if (res.success && res.token && res.user) {
        localStorage.setItem('kavah_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast('Welcome to Kavah! Account created successfully.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to create account.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kavah_token');
    setToken(null);
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; phone?: string }): Promise<boolean> => {
    try {
      const res = await api.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Profile information updated.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Could not update profile.', 'error');
      return false;
    }
  };

  const addAddress = async (address: IAddress): Promise<boolean> => {
    try {
      const res = await api.addAddress(address);
      if (res.success && res.addresses) {
        setUser(prev => prev ? { ...prev, addresses: res.addresses } : null);
        showToast('Delivery address saved.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Could not save address.', 'error');
      return false;
    }
  };

  const updateAddress = async (id: string, address: IAddress): Promise<boolean> => {
    try {
      const res = await api.updateAddress(id, address);
      if (res.success && res.addresses) {
        setUser(prev => prev ? { ...prev, addresses: res.addresses } : null);
        showToast('Address updated.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Could not update address.', 'error');
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteAddress(id);
      if (res.success && res.addresses) {
        setUser(prev => prev ? { ...prev, addresses: res.addresses } : null);
        showToast('Address removed.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Could not delete address.', 'error');
      return false;
    }
  };

  const loginAsCustomer = async () => {
    return login('customer@example.com', 'Demo123!');
  };

  const loginAsAdmin = async () => {
    return login('admin@example.com', 'Admin123!');
  };

  const setAuthSession = (newToken: string, newUser: IUser) => {
    localStorage.setItem('kavah_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        loginAsCustomer,
        loginAsAdmin,
        setAuthSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
