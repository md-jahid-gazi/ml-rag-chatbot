const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // --- AUTHENTICATION ---
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('username', data.username);
    return data;
  },

  async register(username, email, password, role = 'user') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  },

  // --- CHAT & CONVERSATIONS ---
  async sendMessage(sessionId, query, topK = 4) {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ session_id: sessionId, query, top_k: topK })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send query' }));
      throw new Error(err.detail || 'Failed to send query');
    }
    return await res.json();
  },

  async getSessions() {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  },

  async createSession(title = 'New Conversation') {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Failed to create session');
    return await res.json();
  },

  async getSessionHistory(sessionId) {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load session history');
    return await res.json();
  },

  async deleteSession(sessionId) {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.ok;
  },

  // --- KNOWLEDGE BASE MANAGEMENT ---
  async getDocuments() {
    const res = await fetch(`${API_BASE}/kb/documents`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  },

  async getDocumentDetails(docId) {
    const res = await fetch(`${API_BASE}/kb/documents/${docId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load document details');
    return await res.json();
  },

  async uploadDocument(file, customTitle) {
    const formData = new FormData();
    formData.append('file', file);
    if (customTitle) formData.append('custom_title', customTitle);

    const res = await fetch(`${API_BASE}/kb/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload document' }));
      throw new Error(err.detail || 'Failed to upload document');
    }
    return await res.json();
  },

  async scrapeUrl(url, title) {
    const res = await fetch(`${API_BASE}/kb/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ url, title })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to scrape URL' }));
      throw new Error(err.detail || 'Failed to scrape URL');
    }
    return await res.json();
  },

  async syncSampleKnowledge() {
    const res = await fetch(`${API_BASE}/kb/sync-sample`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to sync sample knowledge');
    return await res.json();
  },

  async deleteDocument(docId) {
    const res = await fetch(`${API_BASE}/kb/documents/${docId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete document' }));
      throw new Error(err.detail || 'Failed to delete document');
    }
    return true;
  },

  async getKBStats() {
    const res = await fetch(`${API_BASE}/kb/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  },

  // --- ADMIN & SYSTEM MONITORING ---
  async getSystemStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Forbidden or error' }));
      throw new Error(err.detail || 'Failed to fetch admin stats');
    }
    return await res.json();
  },

  async getLogs(limit = 100) {
    const res = await fetch(`${API_BASE}/admin/logs?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Forbidden or error' }));
      throw new Error(err.detail || 'Failed to fetch logs');
    }
    return await res.json();
  },

  async getHealth() {
    const res = await fetch(`${API_BASE}/admin/health`);
    if (!res.ok) return { status: 'error' };
    return await res.json();
  }
};
