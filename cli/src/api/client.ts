import axios, { AxiosInstance } from 'axios';
import { getApiUrl, getToken } from '../config.js';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getApiUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 添加认证拦截器
    this.client.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async createPost(title: string, content: string) {
    const response = await this.client.post('/api/posts', {
      title,
      content,
    });
    return response.data;
  }

  async getPosts(limit: number = 10) {
    const response = await this.client.get('/api/posts', {
      params: { limit },
    });
    return response.data;
  }

  async searchPosts(query: string, limit: number = 10) {
    const response = await this.client.get('/api/posts', {
      params: { search: query, limit },
    });
    return response.data;
  }

  async getPost(id: string) {
    const response = await this.client.get(`/api/posts/${id}`);
    return response.data;
  }

  async createComment(postId: string, text: string) {
    const response = await this.client.post(`/api/posts/${postId}/comments`, {
      text,
    });
    return response.data;
  }

  async login(username: string) {
    const response = await this.client.post('/api/auth/login', {
      username,
    });
    return response.data;
  }

  async githubCallback(code: string) {
    const response = await this.client.post('/api/auth/github/callback', {
      code,
    });
    return response.data;
  }

  async githubDeviceLogin(accessToken: string) {
    const response = await this.client.post('/api/auth/github/device', {
      access_token: accessToken,
    });
    return response.data;
  }

  async votePost(postId: string, value: 1 | -1) {
    const response = await this.client.post(`/api/posts/${postId}/vote`, {
      value,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
