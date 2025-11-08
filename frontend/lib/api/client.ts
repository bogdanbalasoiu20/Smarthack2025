const API_BASE_URL = 'http://127.0.0.1:8000/api';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
}

async function handleResponse(response: Response) {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Presentations
  async getPresentations() {
    const response = await fetch(`${API_BASE_URL}/presentations/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getPresentation(id: string) {
    const response = await fetch(`${API_BASE_URL}/presentations/${id}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createPresentation(data: any) {
    const response = await fetch(`${API_BASE_URL}/presentations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updatePresentation(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/presentations/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deletePresentation(id: string) {
    const response = await fetch(`${API_BASE_URL}/presentations/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
  },

  // Frames
  async getFrames(presentationId: string) {
    const response = await fetch(`${API_BASE_URL}/frames/?presentation=${presentationId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createFrame(data: any) {
    const response = await fetch(`${API_BASE_URL}/frames/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateFrame(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/frames/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteFrame(id: string) {
    const response = await fetch(`${API_BASE_URL}/frames/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
  },

  // Elements
  async getElements(presentationId: string) {
    const response = await fetch(`${API_BASE_URL}/elements/?presentation=${presentationId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createElement(data: any) {
    const response = await fetch(`${API_BASE_URL}/elements/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateElement(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/elements/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async bulkUpdateElements(updates: any[]) {
    const response = await fetch(`${API_BASE_URL}/elements/bulk_update/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ updates }),
    });
    return handleResponse(response);
  },

  async deleteElement(id: string) {
    const response = await fetch(`${API_BASE_URL}/elements/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (response.status === 204) return;
    return handleResponse(response);
  },
};
