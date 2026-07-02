import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Link, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useNotification } from '../components/NotificationContext';
import { Visibility, VisibilityOff, Lock, Person, Email, Badge } from '@mui/icons-material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_EMPLOYEE');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password, role);
      showNotification('Registration successful! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      showNotification(err, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Create Account
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
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
        autoComplete="new-password"
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
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth margin="normal" required sx={{ mb: 3 }}>
        <InputLabel id="role-select-label">Access Role</InputLabel>
        <Select
          labelId="role-select-label"
          id="role-select"
          value={role}
          label="Access Role"
          onChange={(e) => setRole(e.target.value)}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: 1 }}>
              <Badge color="action" />
            </InputAdornment>
          }
        >
          <MenuItem value="ROLE_EMPLOYEE">Employee (Standard View)</MenuItem>
          <MenuItem value="ROLE_MANAGER">Manager (Document Approval)</MenuItem>
          <MenuItem value="ROLE_ADMIN">Admin (Full System Controls)</MenuItem>
        </Select>
      </FormControl>

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
        {submitting ? 'Registering...' : 'Sign Up'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" color="primary" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
