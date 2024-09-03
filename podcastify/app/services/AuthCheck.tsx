import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;  // This line is correctly added
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshToken = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/token', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsAuthenticated(false);
      setToken(null);
    }
  };

  const checkAuth = async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    window.location.href = 'http://127.0.0.1:5000/login';
  };

  const logout = async () => {
    try {
      await fetch('http://127.0.0.1:5000/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setToken(null);
      await router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry

      const refreshTimeout = setTimeout(() => {
        refreshToken();
      }, expiresIn - refreshBuffer);

      return () => clearTimeout(refreshTimeout);
    }
  }, [token]);

  const value: AuthContextType = {
    isAuthenticated,
    token,
    loading,  // This line is correctly added
    login,
    logout,
    refreshToken,
  };

  return (
      <AuthContext.Provider value={value}>
        {loading ? <div>Loading...</div> : children}
      </AuthContext.Provider>
  );
};

export const withAuth = (WrappedComponent: React.ComponentType) => {
  const WithAuth: React.FC = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login').catch(console.error);
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  // Set the display name
  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
};

// Helper function to get the display name of a component
function getDisplayName(WrappedComponent: React.ComponentType) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
