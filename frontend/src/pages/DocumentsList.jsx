import React, { useEffect, useState } from 'react';
import { Typography, Card, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, TextField, IconButton, Button, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search as SearchIcon, CloudUpload as UploadIcon, Visibility as ViewIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/documentService';
import { useNotification } from '../components/NotificationContext';
import { useAuth } from '../components/AuthContext';
import UploadDialog from '../components/UploadDialog';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const { showNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getDocuments(
        search,
        statusFilter,
        page,
        rowsPerPage,
        sortBy,
        sortDir
      );
      setDocuments(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to fetch documents', 'error');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage, sortBy, sortDir, search, statusFilter]);

  const handleRequestSort = (property) => {
    const isAsc = sortBy === property && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownload = async (doc) => {
    try {
      await documentService.download(doc.id, doc.originalFilename);
      showNotification(`Downloading ${doc.originalFilename}`, 'success');
    } catch (error) {
      showNotification('Download failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.delete(id);
      showNotification('Document deleted successfully', 'success');
      fetchDocuments();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return { bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
      case 'PROCESSING':
        return { bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#33ebff' };
      case 'OCR_COMPLETED':
        return { bgcolor: 'rgba(124, 77, 255, 0.15)', color: '#7c4dff' };
      case 'APPROVED':
        return { bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
      case 'REJECTED':
        return { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'OCR_FAILED':
        return { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef3030' };
      default:
        return { bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' };
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1 }}>
            Documents Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your document uploads, monitor OCR status, and view raw extractions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadOpen(true)}
          sx={{ background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)', color: '#fff' }}
        >
          Upload Document
        </Button>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search original filename or uploader..."
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
            sx={{ flexGrow: 1 }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="OCR_COMPLETED">Completed</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="OCR_FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'originalFilename'}
                    direction={sortBy === 'originalFilename' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('originalFilename')}
                  >
                    Filename
                  </TableSortLabel>
                </TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    OCR Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? sortDir : 'asc'}
                    onClick={() => handleRequestSort('createdAt')}
                  >
                    Uploaded At
                  </TableSortLabel>
                </TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.originalFilename}</TableCell>
                  <TableCell sx={{ textTransform: 'uppercase' }}>{row.fileType}</TableCell>
                  <TableCell>{(row.fileSize / (1024 * 1024)).toFixed(2)} MB</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      ...getStatusStyle(row.status)
                    }}>
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{row.uploadedBy?.username || 'Unknown'}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton onClick={() => navigate(`/dashboard/documents/${row.id}`)} color="primary" sx={{ mr: 1 }}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDownload(row)} color="secondary" sx={{ mr: 1 }}>
                      <DownloadIcon />
                    </IconButton>
                    {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER') && (
                      <IconButton onClick={() => handleDelete(row.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No documents found
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

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={fetchDocuments}
      />
    </Box>
  );
};

export default DocumentsList;
