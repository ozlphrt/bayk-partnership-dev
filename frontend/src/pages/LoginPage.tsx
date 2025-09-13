import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { AppDispatch, RootState } from '../store/store';
import { loginUser, clearError } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role (will be implemented when auth is complete)
      navigate('/member');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser(formData));
      
      if (loginUser.fulfilled.match(result)) {
        // Navigation will be handled by useEffect
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            borderRadius: 3,
            background: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              SailClub
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Partnership Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={isLoading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={isLoading}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Demo Credentials:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Member: member@sailclub.com / password123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Partner: partner@sailclub.com / password123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin: admin@sailclub.com / password123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
