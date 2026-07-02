import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon, History as HistoryIcon, Logout as LogoutIcon, ChevronLeft as ChevronLeftIcon, Description as DocIcon, Chat as ChatIcon } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const drawerWidth = 260;

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { text: 'Documents', icon: <DocIcon />, path: '/dashboard/documents', roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { text: 'AI Copilot', icon: <ChatIcon />, path: '/dashboard/chat', roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { text: 'User Management', icon: <PeopleIcon />, path: '/dashboard/users', roles: ['ROLE_ADMIN'] },
    { text: 'Audit Trail', icon: <HistoryIcon />, path: '/dashboard/audit', roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e1a', color: '#f9fafb' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          bgcolor: 'rgba(10, 14, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{ marginRight: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              DocPilot AI
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'lowercase' }}>
                {user?.role?.replace('ROLE_', '')}
              </Typography>
            </Box>
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#7c4dff' }}>
                  {user?.username?.substring(0, 2).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f9fafb',
                  mt: 1.5,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography color="error.main">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          ...(open && {
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
              bgcolor: '#111827',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              overflowX: 'hidden',
            },
          }),
          ...(!open && {
            '& .MuiDrawer-paper': {
              width: (theme) => theme.spacing(7),
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              boxSizing: 'border-box',
              bgcolor: '#111827',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              overflowX: 'hidden',
            },
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          {open && (
            <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit, sans-serif' }}>
              DocPilot Copilot
            </Typography>
          )}
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => {
            if (user && item.roles.includes(user.role)) {
              const active = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      bgcolor: active ? 'rgba(124, 77, 255, 0.15)' : 'transparent',
                      color: active ? '#b47cff' : 'text.primary',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: active ? '#b47cff' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </ListItem>
              );
            }
            return null;
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
