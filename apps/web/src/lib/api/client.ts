import { auth } from '@/lib/firebase/config';

const getHeaders = async (): Promise<HeadersInit> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser !== null) {
    const token = await currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const getBaseUrl = (): string => {
  return (
    process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001/api/v1'
  );
};

export const apiClient = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await getHeaders();
    const res = await fetch(`${getBaseUrl()}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const errorJson = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(errorJson.message || 'Request failed');
    }

    const json = (await res.json()) as { data: T };
    return json.data;
  },

  async post<T>(
    path: string,
    body: unknown,
    options?: RequestInit
  ): Promise<T> {
    const headers = await getHeaders();
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method: 'POST',
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorJson = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(errorJson.message || 'Request failed');
    }

    const json = (await res.json()) as { data: T };
    return json.data;
  },

  async patch<T>(
    path: string,
    body: unknown,
    options?: RequestInit
  ): Promise<T> {
    const headers = await getHeaders();
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method: 'PATCH',
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorJson = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(errorJson.message || 'Request failed');
    }

    const json = (await res.json()) as { data: T };
    return json.data;
  },
};
