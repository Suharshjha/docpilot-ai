import api from './api';

const documentService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getDocuments: (query = '', status = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    const params = { page, size, sortBy, sortDir };
    if (query) params.query = query;
    if (status) params.status = status;
    return api.get('/documents', { params });
  },

  getDocumentById: (id) => {
    return api.get(`/documents/${id}`);
  },

  download: async (id, filename) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  delete: (id) => {
    return api.delete(`/documents/${id}`);
  },
};

export default documentService;
