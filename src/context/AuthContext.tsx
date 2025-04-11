
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyDomain: string; // Added for domain tracking
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
  // Store registered users in memory for demo purposes
  const [registeredUsers, setRegisteredUsers] = useState<{[email: string]: {password: string, userData: User}}>({});
  // Track companies by domain
  const [companyDomains, setCompanyDomains] = useState<{[domain: string]: string}>({});

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

    // Check for registered users in localStorage
    const storedRegisteredUsers = localStorage.getItem('registeredUsers');
    if (storedRegisteredUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedRegisteredUsers));
      } catch (error) {
        console.error('Failed to parse registered users data:', error);
      }
    }
    
    // Check for company domains in localStorage
    const storedCompanyDomains = localStorage.getItem('companyDomains');
    if (storedCompanyDomains) {
      try {
        setCompanyDomains(JSON.parse(storedCompanyDomains));
      } catch (error) {
        console.error('Failed to parse company domains data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  // Helper to extract domain from email
  const extractDomain = (email: string): string => {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : '';
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fix: Trim email and make case-insensitive comparison
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log('Login attempt with:', { email: trimmedEmail });
      console.log('Available registered users:', registeredUsers);
      
      // Mock credentials for demo - case insensitive matching
      if (trimmedEmail === 'demo@example.com' && password === 'password') {
        const userData: User = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'admin',
          companyId: 'company-1',
          companyDomain: 'example.com'
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
          companyId: 'company-2',
          companyDomain: 'example.com'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Successfully logged in');
        return true;
      }
      
      // Check against registered users
      for (const userEmail in registeredUsers) {
        if (userEmail.toLowerCase() === trimmedEmail) {
          if (registeredUsers[userEmail].password === password) {
            const userData = registeredUsers[userEmail].userData;
            
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            toast.success('Successfully logged in');
            return true;
          } else {
            toast.error('Invalid password. Please try again.');
            return false;
          }
        }
      }
      
      // Improve error message
      toast.error('Invalid email or password. Please try again.');
      console.log('Login attempt failed:', { email: trimmedEmail }); 
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again later.');
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const domain = extractDomain(trimmedEmail);
      
      if (!domain) {
        toast.error('Invalid email format. Please provide a valid email.');
        return false;
      }

      // Check if email already exists
      if (trimmedEmail.toLowerCase() === 'demo@example.com' || 
          trimmedEmail.toLowerCase() === 'user@example.com' ||
          registeredUsers[trimmedEmail.toLowerCase()]) {
        toast.error('Email already registered. Please use a different email.');
        return false;
      }
      
      // Check if the domain is already associated with a company
      let companyId: string;
      if (companyDomains[domain]) {
        // Use existing company ID for this domain
        companyId = companyDomains[domain];
        console.log(`Using existing company ID ${companyId} for domain ${domain}`);
      } else {
        // Create new company ID for this domain
        companyId = `company-${Date.now()}`;
        
        // Save the domain to company mapping
        const updatedCompanyDomains = {
          ...companyDomains,
          [domain]: companyId
        };
        
        localStorage.setItem('companyDomains', JSON.stringify(updatedCompanyDomains));
        setCompanyDomains(updatedCompanyDomains);
        console.log(`Created new company ID ${companyId} for domain ${domain}`);
      }
      
      const userData: User = {
        id: Date.now().toString(),
        email: trimmedEmail,
        name,
        role: 'user',
        companyId,
        companyDomain: domain
      };
      
      // Store in registered users
      const updatedUsers = {
        ...registeredUsers,
        [trimmedEmail.toLowerCase()]: { 
          password,
          userData 
        }
      };
      
      // Save registered users to localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      setRegisteredUsers(updatedUsers);
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Registration successful');
      console.log('User registered:', { email: trimmedEmail, companyId, domain });
      console.log('Updated registered users:', updatedUsers);
      console.log('Company domains mapping:', updatedCompanyDomains);
      
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
