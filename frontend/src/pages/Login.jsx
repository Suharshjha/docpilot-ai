import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Link, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useNotification } from '../components/NotificationContext';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await login(usernameOrEmail, password);
      showNotification('Successfully logged in!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showNotification(err, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Sign In
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username or Email"
        name="username"
        autoComplete="username"
        autoFocus
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={submitting}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          mb: 2,
          background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
          color: '#fff',
        }}
      >
        {submitting ? 'Authenticating...' : 'Sign In'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" color="primary" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
