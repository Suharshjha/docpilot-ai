import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Chip, Avatar, Card, CardContent, Divider, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import { Send as SendIcon, SmartToy as RobotIcon, Person as UserIcon, Close as CloseIcon, Description as DocIcon, FileOpen as FileIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ragService from '../services/ragService';
import { useNotification } from '../components/NotificationContext';

const ChatWorkspace = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am your DocPilot AI Copilot. I can search through all approved documents and help you answer compliance, invoice, contract, or candidate questions. What would you like to explore today?',
      citations: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState([]);
  const [showCitationsPanel, setShowCitationsPanel] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const suggestionChips = [
    { label: 'Details of Sliced Invoices?', query: 'Tell me the amount, due date and items for Sliced Invoices' },
    { label: 'Who is Suharsh Kumar?', query: 'What qualifications does Suharsh Kumar have on his resume?' },
    { label: 'Invoice payment for Acme Corp?', query: 'How much did we pay Acme Corp according to documents?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      citations: []
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const response = await ragService.chat(text);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.data.answer,
        citations: response.data.citations || []
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If response has citations, automatically display them in the side drawer
      if (response.data.citations && response.data.citations.length > 0) {
        setSelectedCitations(response.data.citations);
        setShowCitationsPanel(true);
      }
    } catch (err) {
      showNotification(
        err.response?.data?.message || 'Failed to get answer from AI Copilot. Please try again!',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = (citations) => {
    setSelectedCitations(citations);
    setShowCitationsPanel(true);
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', gap: 3, height: 'calc(100vh - 120px)', position: 'relative' }}>
      
      {/* Main Chat Feed */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit, sans-serif' }}>
          AI Copilot Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ask questions, verify details, and search context across all approved and indexed PDF documentation.
        </Typography>

        {/* Chat window */}
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            bgcolor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 3,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            mb: 2,
            gap: 2.5
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  gap: 2,
                  alignItems: 'flex-start',
                  maxWidth: isUser ? '75%' : '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: isUser ? '#10b981' : '#7c4dff',
                    width: 38,
                    height: 38,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {isUser ? <UserIcon fontSize="small" /> : <RobotIcon fontSize="small" />}
                </Avatar>

                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: isUser ? '#1e293b' : 'rgba(255, 255, 255, 0.03)',
                      border: isUser ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.04)',
                      color: '#f9fafb'
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.95rem',
                        lineHeight: 1.6
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Paper>

                  {/* Render citations count label for AI responses */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        icon={<DocIcon fontSize="small" />}
                        label={`${msg.citations.length} Source Citation(s)`}
                        onClick={() => handleCitationClick(msg.citations)}
                        variant="outlined"
                        size="small"
                        sx={{
                          cursor: 'pointer',
                          color: '#b47cff',
                          borderColor: 'rgba(180, 124, 255, 0.3)',
                          bgcolor: 'rgba(124, 77, 255, 0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(124, 77, 255, 0.12)'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}

          {/* Typing Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', alignSelf: 'flex-start' }}>
              <Avatar sx={{ bgcolor: '#7c4dff', width: 38, height: 38 }}>
                <RobotIcon fontSize="small" />
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <CircularProgress size={16} sx={{ color: '#b47cff' }} />
                <Typography variant="body2" color="text.secondary">
                  Copilot is reading sources...
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Paper>

        {/* Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
            {suggestionChips.map((chip, idx) => (
              <Chip
                key={idx}
                label={chip.label}
                onClick={() => handleSendMessage(chip.query)}
                clickable
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  color: 'text.secondary',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  '&:hover': {
                    bgcolor: 'rgba(124, 77, 255, 0.1)',
                    color: '#b47cff',
                    borderColor: 'rgba(180, 124, 255, 0.3)'
                  }
                }}
              />
            ))}
          </Box>
        )}

        {/* Bottom Input Area */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Ask AI Copilot about invoices, due dates, candidates..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSendMessage();
              }
            }}
            disabled={loading}
            autoComplete="off"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#111827',
                borderRadius: 3,
                color: '#f9fafb',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.06)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                '&.Mui-focused fieldset': { borderColor: '#7c4dff' }
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputValue.trim()}
            sx={{
              borderRadius: 3,
              px: 3.5,
              bgcolor: '#7c4dff',
              '&:hover': { bgcolor: '#651fff' }
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>

      {/* Right Side Citations Panel */}
      {showCitationsPanel && (
        <Paper
          elevation={0}
          sx={{
            width: 320,
            flexShrink: 0,
            bgcolor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              References ({selectedCitations.length})
            </Typography>
            <IconButton onClick={() => setShowCitationsPanel(false)} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* List of cited text blocks */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedCitations.map((citation, index) => (
              <Card
                key={index}
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DocIcon sx={{ color: '#00e5ff', fontSize: 16 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: '#f9fafb',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        maxWidth: '85%'
                      }}
                    >
                      {citation.filename}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.82rem',
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    "{citation.snippet}"
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<FileIcon sx={{ fontSize: 14 }} />}
                    onClick={() => navigate(`/dashboard/documents/${citation.documentId}`)}
                    sx={{
                      color: '#00e5ff',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      p: 0,
                      justifyContent: 'flex-start',
                      '&:hover': {
                        bgcolor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    View Source Document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChatWorkspace;
