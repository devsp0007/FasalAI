/**
 * API Service — Connects frontend to FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
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

export async function healthCheck() {
  return apiCall('/health');
}

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
