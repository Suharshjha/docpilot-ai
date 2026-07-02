import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Box, Button, Grid, CircularProgress, Divider, TextField, IconButton, FormControl, MenuItem, Select, Chip, Alert } from '@mui/material';
import { ArrowBack as BackIcon, Download as DownloadIcon, Warning as ErrorIcon, Check as ApproveIcon, Close as RejectIcon } from '@mui/icons-material';
import documentService from '../services/documentService';
import documentDataService from '../services/documentDataService';
import { useNotification } from '../components/NotificationContext';

const DocumentDetail = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [extData, setExtData] = useState(null);
  const [confidence, setConfidence] = useState({});
  
  // Review Form States
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [gst, setGst] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('OTHER');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      const docResponse = await documentService.getDocumentById(id);
      setDoc(docResponse.data);

      // Fetch extraction details for all completed or failed states
      const hasFinishedOcr = 
        docResponse.data.status === 'OCR_COMPLETED' || 
        docResponse.data.status === 'APPROVED' || 
        docResponse.data.status === 'REJECTED' ||
        docResponse.data.status === 'OCR_FAILED';

      if (hasFinishedOcr) {
        try {
          const extResponse = await documentDataService.getExtractionData(id);
          const data = extResponse.data;
          setExtData(data);
          
          // Pre-fill form fields
          setVendor(data.vendor || '');
          setInvoiceNumber(data.invoiceNumber || '');
          setGst(data.gst || '');
          setAmount(data.amount || '');
          setDueDate(data.dueDate || '');
          setCurrency(data.currency || 'USD');
          setCategory(data.category || 'OTHER');

          // Parse confidence mapping
          if (data.confidenceScore) {
            setConfidence(JSON.parse(data.confidenceScore));
          }
        } catch (err) {
          console.log("No extraction data loaded yet, initializing empty review board.");
          setExtData({});
          setVendor('');
          setInvoiceNumber('');
          setGst('');
          setAmount('');
          setDueDate('');
          setCurrency('USD');
          setCategory('OTHER');
          setConfidence({});
        }
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to load document details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDownload = async () => {
    if (!doc) return;
    try {
      await documentService.download(doc.id, doc.originalFilename);
      showNotification(`Downloading ${doc.originalFilename}`, 'success');
    } catch (error) {
      showNotification('Download failed', 'error');
    }
  };

  const handleReviewSubmit = async (decision) => {
    setSaving(true);
    try {
      const payload = {
        vendor,
        invoiceNumber,
        gst,
        amount: amount ? parseFloat(amount) : null,
        dueDate,
        currency,
        category
      };

      await documentDataService.updateAndApprove(id, payload, decision);
      showNotification(`Document data successfully reviewed and marked as ${decision}`, 'success');
      navigate('/dashboard/documents');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderConfidenceChip = (score) => {
    if (score === undefined || score === null) return null;
    const percentage = Math.round(score * 100);
    const isHigh = score >= 0.8;
    return (
      <Chip
        label={`${percentage}% ${isHigh ? 'High' : 'Low'}`}
        size="small"
        sx={{
          ml: 1,
          fontSize: '0.7rem',
          fontWeight: 600,
          bgcolor: isHigh ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: isHigh ? '#10b981' : '#f59e0b',
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!doc) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h5">Document not found</Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard/documents')} sx={{ mt: 3 }}>
          Back to Documents
        </Button>
      </Box>
    );
  }

  const ocrActive = doc.status === 'OCR_COMPLETED' || doc.status === 'APPROVED' || doc.status === 'REJECTED' || doc.status === 'OCR_FAILED';

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard/documents')} color="inherit">
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
          Document Workspace Review
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Metadata Profile & Download */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              File Attributes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Original Filename</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>{doc.originalFilename}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">File Size</Typography>
                <Typography variant="body2">{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">OCR Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="body2" sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: doc.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : doc.status === 'PROCESSING' ? 'rgba(0, 229, 255, 0.15)' : doc.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : doc.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124, 77, 255, 0.15)',
                    color: doc.status === 'PENDING' ? '#f59e0b' : doc.status === 'PROCESSING' ? '#33ebff' : doc.status === 'APPROVED' ? '#10b981' : doc.status === 'REJECTED' ? '#ef4444' : '#7c4dff'
                  }}>
                    {doc.status}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Uploaded By</Typography>
                <Typography variant="body2">{doc.uploadedBy?.username || 'Unknown'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Uploaded At</Typography>
                <Typography variant="body2">{new Date(doc.createdAt).toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Button variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={handleDownload} fullWidth>
                Download Original
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Middle Column: Extracted Plain text */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Extracted OCR Output
            </Typography>
            <TextField
              multiline
              rows={18}
              fullWidth
              variant="outlined"
              value={doc.rawText || (doc.status === 'PROCESSING' ? 'OCR Engine is currently processing this file...' : 'No OCR text available.')}
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  bgcolor: 'rgba(255, 255, 255, 0.01)',
                }
              }}
            />
          </Card>
        </Grid>

        {/* Right Column: Audit Review Board */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Structured Data Review
            </Typography>

            {!ocrActive ? (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 5, textAlign: 'center' }}>
                <CircularProgress size={30} sx={{ mb: 2 }} />
                <Typography color="text.secondary">
                  Awaiting background text extraction analysis...
                </Typography>
              </Box>
            ) : !extData ? (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 5, textAlign: 'center' }}>
                <ErrorIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="text.secondary">
                  No LLM structured data extracted for this file profile.
                </Typography>
              </Box>
            ) : (
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                {doc.status === 'APPROVED' && (
                  <Alert severity="success" variant="outlined" sx={{ py: 0.5, px: 2, fontSize: '0.85rem' }}>
                    This document has been APPROVED. You can edit the fields below to update its metadata.
                  </Alert>
                )}
                {doc.status === 'REJECTED' && (
                  <Alert severity="error" variant="outlined" sx={{ py: 0.5, px: 2, fontSize: '0.85rem' }}>
                    This document is REJECTED. You can review the fields and approve it if needed.
                  </Alert>
                )}
                {doc.status === 'OCR_FAILED' && (
                  <Alert severity="error" variant="outlined" sx={{ py: 0.5, px: 2, fontSize: '0.85rem' }}>
                    OCR processing failed for this document. You can still manually enter metadata below to approve it.
                  </Alert>
                )}
                {doc.status === 'OCR_COMPLETED' && extData.status === 'NEEDS_REVIEW' && (
                  <Alert severity="warning" variant="outlined" sx={{ py: 0.5, px: 2, fontSize: '0.85rem' }}>
                    Low confidence fields detected! Please check highlighted values before approving.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Vendor / Profile Name</Typography>
                      {renderConfidenceChip(confidence.vendor)}
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                        {renderConfidenceChip(confidence.amount)}
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Currency</Typography>
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Invoice / PO #</Typography>
                        {renderConfidenceChip(confidence.invoiceNumber)}
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Due Date</Typography>
                        {renderConfidenceChip(confidence.dueDate)}
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={dueDate}
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">GST / Tax Reg #</Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      value={gst}
                      onChange={(e) => setGst(e.target.value)}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Document Category</Typography>
                      {renderConfidenceChip(confidence.category)}
                    </Box>
                    <FormControl fullWidth size="small">
                      <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <MenuItem value="INVOICE">Invoice</MenuItem>
                        <MenuItem value="RESUME">Resume / CV</MenuItem>
                        <MenuItem value="PURCHASE_ORDER">Purchase Order</MenuItem>
                        <MenuItem value="CONTRACT">Contract agreement</MenuItem>
                        <MenuItem value="OTHER">Other document</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box sx={{ mt: 'auto', pt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    disabled={saving}
                    onClick={() => handleReviewSubmit('APPROVED')}
                    sx={{ flexGrow: 1 }}
                  >
                    {saving ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    disabled={saving}
                    onClick={() => handleReviewSubmit('REJECTED')}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentDetail;
