import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, List, ListItem, ListItemIcon, ListItemText, LinearProgress } from '@mui/material';
import { CloudUpload as UploadIcon, Description as FileIcon } from '@mui/icons-material';
import documentService from '../services/documentService';
import { useNotification } from './NotificationContext';

const UploadDialog = ({ open, onClose, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { showNotification } = useNotification();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await documentService.upload(selectedFile);
      showNotification(`File "${selectedFile.name}" uploaded successfully! OCR started.`, 'success');
      setSelectedFile(null);
      onUploadSuccess();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || 'File upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: '#111827', color: '#f9fafb', borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Upload Documents</DialogTitle>
      <DialogContent>
        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              borderColor: '#7c4dff',
            },
          }}
          component="label"
        >
          <input type="file" hidden accept=".pdf,image/png,image/jpeg,image/jpg,image/tiff" onChange={handleFileChange} />
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Drag and drop file here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: PDF, PNG, JPG, JPEG, TIFF (Max 15MB)
          </Typography>
        </Box>

        {selectedFile && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon>
                  <FileIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={selectedFile.name}
                  secondary={`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                  primaryTypographyProps={{ sx: { fontWeight: 600, color: '#f9fafb' } }}
                />
              </ListItem>
            </List>
            {uploading && <LinearProgress color="primary" sx={{ mt: 2, borderRadius: 1 }} />}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} color="inherit" disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} variant="contained" color="primary" disabled={!selectedFile || uploading} sx={{ background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)', color: '#fff' }}>
          {uploading ? 'Uploading...' : 'Start processing'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
