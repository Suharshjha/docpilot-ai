import React, { useEffect, useState } from 'react';
import { Typography, Card, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';
import { useNotification } from '../components/NotificationContext';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  const { showNotification } = useNotification();

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit', {
        params: {
          query: search,
          page,
          size: rowsPerPage,
          sortBy,
          sortDir
        }
      });
      setLogs(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to fetch audit logs', 'error');
    }
  };

  useEffect(() => {
    fetchLogs();
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

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1 }}>
          System Audit Trail
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Security and action history logging trail for system compliance.
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search action, username, or details..."
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
                    active={sortBy === 'timestamp'}
                    direction={sortBy === 'timestamp' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('timestamp')}
                  >
                    Timestamp
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'action'}
                    direction={sortBy === 'action' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('action')}
                  >
                    Action
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'username'}
                    direction={sortBy === 'username' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('username')}
                  >
                    User
                  </TableSortLabel>
                </TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor: row.action === 'LOGIN' ? 'rgba(16, 185, 129, 0.15)' : row.action === 'LOGOUT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: row.action === 'LOGIN' ? '#10b981' : row.action === 'LOGOUT' ? '#ef4444' : '#f59e0b'
                    }}>
                      {row.action}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.username || 'System'}</TableCell>
                  <TableCell>{row.ipAddress}</TableCell>
                  <TableCell>{row.details}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default AuditLogs;
