import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, CurrencyCode } from '../types/finance';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string, currency: CurrencyCode) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (incomeGoal?: number) => void;
  switchUser: (userId: string) => void;
  demoUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Check or create default demo user
    let users = StorageService.getUsers();
    
    if (users.length === 0) {
      const demoUser: UserProfile = {
        id: 'user_demo_1',
        name: 'Alex Morgan',
        email: 'alex@zenithfinance.io',
        currency: 'NPR',
        onboarded: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        createdAt: new Date().toISOString(),
        monthlyIncomeGoal: 75000,
        dateFormat: 'DD/MM/YYYY',
        theme: 'system'
      };
      StorageService.saveUserProfile(demoUser);
      StorageService.initializeUserData(demoUser.id, demoUser.currency);
      users = [demoUser];
    }

    setDemoUsers(users);

    const currentId = StorageService.getCurrentUserId();
    if (currentId) {
      const activeUser = users.find(u => u.id === currentId);
      if (activeUser) {
        setUser(activeUser);
      } else {
        setUser(users[0]);
        StorageService.setCurrentUserId(users[0].id);
      }
    } else {
      setUser(users[0]);
      StorageService.setCurrentUserId(users[0].id);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const users = StorageService.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      StorageService.setCurrentUserId(found.id);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, currency: CurrencyCode): Promise<UserProfile> => {
    const newUserId = `user_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name,
      email,
      currency,
      onboarded: false,
      createdAt: new Date().toISOString(),
      dateFormat: 'DD/MM/YYYY',
      theme: 'system'
    };

    StorageService.saveUserProfile(newUser);
    StorageService.setCurrentUserId(newUserId);
    StorageService.initializeUserData(newUserId, currency);

    setUser(newUser);
    setDemoUsers(StorageService.getUsers());
    return newUser;
  };

  const logout = () => {
    setUser(null);
    StorageService.setCurrentUserId(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    StorageService.saveUserProfile(updated);
    setDemoUsers(StorageService.getUsers());
  };

  const completeOnboarding = (incomeGoal?: number) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      onboarded: true,
      monthlyIncomeGoal: incomeGoal || user.monthlyIncomeGoal || 75000
    };
    setUser(updated);
    StorageService.saveUserProfile(updated);
  };

  const switchUser = (userId: string) => {
    const users = StorageService.getUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      setUser(target);
      StorageService.setCurrentUserId(target.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        completeOnboarding,
        switchUser,
        demoUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
