// Auth types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  active: boolean;
  createdAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

// Poll types
export interface Option {
  id: number;
  text: string;
  displayOrder: number;
  voteCount: number;
  votePercentage: number;
}

export interface Poll {
  id: number;
  title: string;
  description?: string;
  creator: User;
  options: Option[];
  active: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  totalVotes: number;
  hasUserVoted: boolean;
  isExpired: boolean;
}

export interface CreatePollRequest {
  title: string;
  description?: string;
  options: string[];
  allowMultipleVotes: boolean;
  expiresAt?: string;
}

export interface VoteRequest {
  optionId: number;
}

export interface Vote {
  id: number;
  pollId: number;
  pollTitle: string;
  optionId: number;
  optionText: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
} 