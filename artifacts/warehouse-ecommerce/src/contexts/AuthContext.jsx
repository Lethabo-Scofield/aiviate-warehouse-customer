import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = '';

// Single-user store: the app signs in automatically with the store account.
const STORE_EMAIL = 'demo@bulkmart.com';
const STORE_PASSWORD = 'demo1234';

const parseError = async (response) => {
  const body = await response.json().catch(() => ({}));
  return body.error || body.message || `Request failed (${response.status})`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore an existing session if present; otherwise sign in silently
  // with the store account (open store, no login screen).
  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Session expired');
          }

          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }

      try {
        await login(STORE_EMAIL, STORE_PASSWORD);
      } catch (e) {
        // login() already records the error for display.
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retry hook for the automatic store sign-in.
  const autoLogin = () => login(STORE_EMAIL, STORE_PASSWORD);

  // Login against backend API.
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      const userData = data.user;

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register against backend API.
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Please fill in all fields');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          company: userData.company,
          phone: userData.phone,
          email: userData.email,
          password: userData.password
        })
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      const newUser = data.user;

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      autoLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};