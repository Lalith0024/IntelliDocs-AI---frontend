import axios from 'axios';

export let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Inject token into every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username'
    formData.append('password', password);
    const response = await api.post('/api/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  signup: async (email: string, password: string) => {
    const response = await api.post('/api/auth/signup', { email, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

export const chatService = {
  getChats: async () => {
    const response = await api.get('/api/chats/');
    return response.data;
  },
  getChat: async (id: string) => {
    const response = await api.get(`/api/chats/${id}`);
    return response.data;
  },
  query: async (question: string, chatId?: string) => {
    const response = await api.post('/api/chats/query', {
      question,
      chat_id: chatId || null
    });
    return response.data;
  },
  renameChat: async (chatId: string, title: string) => {
    const response = await api.put(`/api/chats/${chatId}/rename`, { title });
    return response.data;
  },
  deleteChat: async (chatId: string) => {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
  }
};

export const filesService = {
  listFiles: async () => {
    const response = await api.get('/api/documents/');
    return response.data; // List of DocumentObjects
  },
  uploadFiles: async (files: File[]) => {
    // We upload one by one in parallel or sequence
    const uploads = files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    });
    const results = await Promise.all(uploads);
    return results.map(r => r.data);
  },
  deleteFile: async (id: string) => {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
  }
};
