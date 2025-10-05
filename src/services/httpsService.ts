import { auth } from '@/lib/firebase';

const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
};

const handleResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON');
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response');
  }

  return JSON.parse(text);
};

const fetchWithErrorHandling = async (
  url: string, 
  options: RequestInit, 
  operation: string
): Promise<unknown> => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : `Error ${operation} URL`);
  }
};

const createHeaders = (token?: string, additionalHeaders?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

interface HttpRequestOptions {
  url: string;
  body?: unknown;
  skipToken?: boolean;
  additionalHeaders?: Record<string, string>;
}

export const Post = async (options: HttpRequestOptions): Promise<unknown> => {
  const { url, body, skipToken = false, additionalHeaders } = options;
  const authToken = skipToken ? undefined : await getToken();

  return fetchWithErrorHandling(url, {
    method: 'POST',
    headers: createHeaders(authToken, additionalHeaders),
    body: JSON.stringify(body),
  }, 'posting to');
};

export const Get = async (options: HttpRequestOptions): Promise<unknown> => {
  const { url, skipToken = false, additionalHeaders } = options;
  const authToken = skipToken ? undefined : await getToken();

  return fetchWithErrorHandling(url, {
    method: 'GET',
    headers: createHeaders(authToken, additionalHeaders),
  }, 'getting from');
};

export const Put = async (options: HttpRequestOptions): Promise<unknown> => {
  const { url, body, skipToken = false, additionalHeaders } = options;
  const authToken = skipToken ? undefined : await getToken();

  return fetchWithErrorHandling(url, {
    method: 'PUT',
    headers: createHeaders(authToken, additionalHeaders),
    body: JSON.stringify(body),
  }, 'putting to');
};

export const Delete = async (options: HttpRequestOptions): Promise<unknown> => {
  const { url, skipToken = false, additionalHeaders } = options;
  const authToken = skipToken ? undefined : await getToken();

  return fetchWithErrorHandling(url, {
    method: 'DELETE',
    headers: createHeaders(authToken, additionalHeaders),
  }, 'deleting from');
};


async function getToken(){
    return await getCurrentUserToken() || undefined
}
