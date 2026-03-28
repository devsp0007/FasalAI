/**
 * API Service — Connects frontend to FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthToken() {
  return localStorage.getItem('smartcrop_token');
}

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  // Build headers
  const headers = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      headers,
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to backend. Make sure the server is running on port 8000.');
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────

export async function registerUser(data) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Profile ───────────────────────────────────────────

export async function getProfile() {
  return apiCall('/profile');
}

export async function saveProfile(data) {
  return apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProfile() {
  return apiCall('/profile', { method: 'DELETE' });
}

// ── Health ────────────────────────────────────────────

export async function healthCheck() {
  return apiCall('/health');
}

// ── Crop Recommendation ──────────────────────────────

export async function recommendCrop(data) {
  return apiCall('/recommend/crop', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function predictYield(data) {
  return apiCall('/predict/yield', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function predictPrice(data) {
  return apiCall('/predict/price', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCrops() {
  return apiCall('/crops');
}

export async function getWeather(lat, lon) {
  return apiCall(`/weather/${lat}/${lon}`);
}

export async function getMarketPrices(crop = 'wheat', district = 'Varanasi', days = 30) {
  return apiCall(`/market/prices?crop=${crop}&district=${district}&days=${days}`);
}

// ── State-Aware Endpoints ─────────────────────────────

export async function getStates() {
  return apiCall('/states');
}

export async function getCropsByState(state) {
  return apiCall(`/crops/by-state/${encodeURIComponent(state)}`);
}

export async function getSoilTypes() {
  return apiCall('/soil-types');
}

// ── Disease Detection ─────────────────────────────────

export async function getDiseaseCrops() {
  return apiCall('/disease/crops');
}

export async function detectDisease(crop, imageFile) {
  const formData = new FormData();
  formData.append('crop', crop);
  formData.append('image', imageFile);
  return apiCall('/disease/detect', {
    method: 'POST',
    body: formData,
  });
}
