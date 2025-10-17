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

  async replyComment(postId: string, commentId: string, text: string) {
    const response = await this.client.post(`/api/posts/${postId}/comments`, {
      text,
      parent_id: parseInt(commentId, 10),
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

  async voteComment(commentId: string, value: 1 | -1) {
    const response = await this.client.post(`/api/posts/comments/${commentId}/vote`, {
      value,
    });
    return response.data;
  }

  async deletePost(postId: string) {
    const response = await this.client.delete(`/api/posts/${postId}`);
    return response.data;
  }

  async deleteComment(commentId: string) {
    const response = await this.client.delete(`/api/posts/comments/${commentId}`);
    return response.data;
  }

  async getNotifications(limit: number = 20) {
    const response = await this.client.get('/api/notifications', {
      params: { limit },
    });
    return response.data;
  }

  async getUnreadNotificationsCount() {
    const response = await this.client.get('/api/notifications/unread-count');
    return response.data;
  }

  async markNotificationRead(notificationId: string) {
    const response = await this.client.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsRead() {
    const response = await this.client.put('/api/notifications/read-all');
    return response.data;
  }

  async bookmarkPost(postId: string) {
    const response = await this.client.post(`/api/bookmarks/${postId}`, {});
    return response.data;
  }

  async unbookmarkPost(postId: string) {
    const response = await this.client.delete(`/api/bookmarks/${postId}`);
    return response.data;
  }

  async getBookmarks(limit: number = 20) {
    const response = await this.client.get('/api/bookmarks', {
      params: { limit },
    });
    return response.data;
  }

  async checkBookmark(postId: string) {
    const response = await this.client.get(`/api/bookmarks/check/${postId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
