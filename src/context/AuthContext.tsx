import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string; // Added company identifier
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll use a mock authentication
      // In a real app, you would make an API call to your backend
      
      // Fix: Trim email and make case-insensitive comparison
      const trimmedEmail = email.trim().toLowerCase();
      
      // Mock credentials for demo - case insensitive matching
      if (trimmedEmail === 'demo@example.com' && password === 'password') {
        const userData: User = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'admin',
          companyId: 'company-1'
        };
        
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Successfully logged in');
        return true;
      }
      
      // Additional mock user for testing company isolation
      if (trimmedEmail === 'user@example.com' && password === 'password') {
        const userData: User = {
          id: '2',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user',
          companyId: 'company-2'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Successfully logged in');
        return true;
      }
      
      // Improve error message
      toast.error('Invalid email or password. Please try again.');
      console.log('Login attempt failed:', { email: trimmedEmail }); // Debug log
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again later.');
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll simulate a successful registration
      // In a real app, you would make an API call to your backend
      
      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        companyId: `company-${Date.now()}` // Generate a unique company ID for new users
      };
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Registration successful');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Successfully logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
