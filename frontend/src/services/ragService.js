import api from './api';

const ragService = {
  chat: (message) => {
    return api.post('/chat', { message });
  }
};

export default ragService;
