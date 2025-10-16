import Conf from 'conf';

export const config = new Conf({
  projectName: 'cc-chat',
  defaults: {
    apiUrl: process.env.CC_CHAT_API_URL || 'https://api.cc-chat.dev',
    token: '',
  },
});

export function getApiUrl(): string {
  return config.get('apiUrl') as string;
}

export function getToken(): string | null {
  const token = config.get('token') as string;
  return token || null;
}

export function setToken(token: string): void {
  config.set('token', token);
}

export function clearToken(): void {
  config.delete('token');
}
