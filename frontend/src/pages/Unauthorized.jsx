import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GppBad } from '@mui/icons-material';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0e1a',
        color: '#f9fafb',
      }}
    >
      <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
        <GppBad sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit, sans-serif' }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have the required permissions to view this resource.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    </Box>
  );
};

export default Unauthorized;
