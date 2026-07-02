import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0e1a',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(124, 77, 255, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 229, 255, 0.1) 0%, transparent 40%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px',
              fontFamily: 'Outfit, sans-serif',
              mb: 1,
            }}
          >
            DocPilot AI
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Intelligent Enterprise Workflow Copilot
          </Typography>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
