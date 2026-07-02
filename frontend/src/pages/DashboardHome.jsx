import React from 'react';
import { Typography, Grid, Card, CardContent, Box, Button, Avatar } from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { Description as DocIcon, AssignmentTurnedIn as ApprovedIcon, PendingActions as PendingIcon, Security as SecurityIcon } from '@mui/icons-material';

const DashboardHome = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Documents Processed', value: '1,280', change: '+12% from last week', icon: <DocIcon fontSize="large" sx={{ color: '#7c4dff' }} /> },
    { title: 'Pending Approval', value: '42', change: 'Requires manager review', icon: <PendingIcon fontSize="large" sx={{ color: '#00e5ff' }} /> },
    { title: 'Approved Tasks', value: '98.4%', change: 'Accuracy rating 99.8%', icon: <ApprovedIcon fontSize="large" sx={{ color: '#10b981' }} /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1 }}>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here is your enterprise document processing dashboard.
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(124, 77, 255, 0.08)', border: '1px solid rgba(124, 77, 255, 0.2)', px: 3, py: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ color: '#b47cff' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Access Clearance
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Role: {user?.role?.replace('ROLE_', '')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.change}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {stat.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 4, backgroundImage: 'linear-gradient(135deg, rgba(124, 77, 255, 0.05) 0%, rgba(0, 229, 255, 0.05) 100%)' }}>
        <Box sx={{ maxWidth: 600 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', mb: 2 }}>
            DocPilot AI: Intelligent Copilot Status
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            System configurations for Phase 1 are fully set up. JWT Authentication, User profiles, Role Enforcement (Admin, Manager, Employee), and security audit tracking are live. Documents upload and AI-extraction modules will be configured in subsequent phases.
          </Typography>
          <Button variant="contained" color="primary" sx={{ background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)', color: '#fff' }}>
            System Health Check: OK
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default DashboardHome;
