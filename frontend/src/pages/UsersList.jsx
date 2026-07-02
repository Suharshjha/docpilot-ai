import React, { useEffect, useState } from 'react';
import { Typography, Card, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, TextField, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';
import { useNotification } from '../components/NotificationContext';
import { useAuth } from '../components/AuthContext';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('username');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', {
        params: {
          query: search,
          page,
          size: rowsPerPage,
          sortBy,
          sortDir
        }
      });
      setUsers(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to fetch users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, sortBy, sortDir, search]);

  const handleRequestSort = (property) => {
    const isAsc = sortBy === property && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword('');
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    if (!editEmail || !editRole) {
      showNotification('Email and Role are required', 'warning');
      return;
    }
    try {
      await api.put(`/users/${selectedUser.id}`, {
        email: editEmail,
        role: editRole,
        password: editPassword || null
      });
      showNotification('User updated successfully', 'success');
      handleEditClose();
      fetchUsers();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.id) {
      showNotification('You cannot delete your own account!', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      showNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
          User Management
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search username or email..."
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'username'}
                    direction={sortBy === 'username' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('username')}
                  >
                    Username
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'email'}
                    direction={sortBy === 'email' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'role'}
                    direction={sortBy === 'role' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('role')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.username}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor: row.role === 'ROLE_ADMIN' ? 'rgba(124, 77, 255, 0.15)' : row.role === 'ROLE_MANAGER' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: row.role === 'ROLE_ADMIN' ? '#b47cff' : row.role === 'ROLE_MANAGER' ? '#33ebff' : 'text.secondary'
                    }}>
                      {row.role.replace('ROLE_', '')}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditClick(row)} color="primary" sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(row.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Dialog open={editDialogOpen} onClose={handleEditClose} PaperProps={{ sx: { bgcolor: '#111827', color: '#f9fafb', borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Edit User: {selectedUser?.username}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 350, pt: 1 }}>
          <TextField
            margin="normal"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
            <InputLabel id="edit-role-label">Role</InputLabel>
            <Select
              labelId="edit-role-label"
              value={editRole}
              label="Role"
              onChange={(e) => setEditRole(e.target.value)}
            >
              <MenuItem value="ROLE_EMPLOYEE">Employee</MenuItem>
              <MenuItem value="ROLE_MANAGER">Manager</MenuItem>
              <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            label="New Password (optional)"
            type="password"
            fullWidth
            variant="outlined"
            placeholder="Leave blank to keep current password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleEditClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersList;
