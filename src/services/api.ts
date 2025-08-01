import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Poll, 
  CreatePollRequest, 
  VoteRequest, 
  Vote,
  PaginatedResponse
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

// Poll API
export const pollApi = {
  getPolls: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<PaginatedResponse<Poll>> => {
    const response = await api.get('/polls/public', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  getPollById: async (id: number): Promise<Poll> => {
    const response = await api.get(`/polls/public/${id}`);
    return response.data;
  },

  getUserPolls: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<PaginatedResponse<Poll>> => {
    const response = await api.get('/polls/my', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  createPoll: async (data: CreatePollRequest): Promise<Poll> => {
    const response = await api.post('/polls', data);
    return response.data;
  },

  updatePoll: async (id: number, data: Partial<CreatePollRequest>): Promise<Poll> => {
    const response = await api.put(`/polls/${id}`, data);
    return response.data;
  },

  deletePoll: async (id: number): Promise<void> => {
    await api.delete(`/polls/${id}`);
  },
};

// Vote API
export const voteApi = {
  vote: async (pollId: number, data: VoteRequest): Promise<Vote> => {
    const response = await api.post(`/votes/polls/${pollId}`, data);
    return response.data;
  },

  getUserVotes: async (): Promise<Vote[]> => {
    const response = await api.get('/votes/my');
    return response.data;
  },

  removeVote: async (pollId: number): Promise<void> => {
    await api.delete(`/votes/polls/${pollId}`);
  },
};

export default api; 