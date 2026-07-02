import api from './api';

const documentDataService = {
  getExtractionData: (documentId) => {
    return api.get(`/documents/${documentId}/data`);
  },

  updateAndApprove: (documentId, data, decision = 'APPROVED') => {
    return api.put(`/documents/${documentId}/data`, data, {
      params: { decision }
    });
  }
};

export default documentDataService;
