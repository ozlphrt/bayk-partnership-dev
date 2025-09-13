import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { getCurrentUser, logoutUser } from '../store/slices/authSlice';
import { apiService } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !isAuthenticated) {
        apiService.setToken(storedToken);
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          // Token is invalid, clear it
          apiService.setToken(null);
          localStorage.removeItem('token');
        }
      }
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  // Auto-logout on token expiration
  useEffect(() => {
    if (token) {
      apiService.setToken(token);
    } else {
      apiService.setToken(null);
    }
  }, [token]);

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      navigate('/login');
    }
  };

  const getRedirectPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'MEMBER':
        return '/member';
      case 'PARTNER':
        return '/partner';
      case 'ADMIN':
        return '/admin';
      default:
        return '/login';
    }
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    logout,
    getRedirectPath,
    hasRole,
    hasAnyRole,
  };
};
