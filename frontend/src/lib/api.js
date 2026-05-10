import {
  getStoredAccessToken,
  getStoredRefreshToken,
  storeSession,
  clearSession
} from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let refreshPromise = null;

async function rawRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearSession();
    throw new Error('No refresh token available.');
  }

  refreshPromise = rawRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken, deviceLabel: 'Frontend App' })
  })
    .then((response) => {
      storeSession(response.data);
      return response.data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (error) {
    if (error.status === 401 && !path.startsWith('/auth/')) {
      try {
        await refreshSession();
        return await rawRequest(path, options);
      } catch (refreshError) {
        clearSession();
        throw refreshError;
      }
    }

    throw error;
  }
}

export const authApi = {
  signup: (payload) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  logout: (refreshToken) =>
    apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
};

export const usersApi = {
  me: () => apiRequest('/users/me'),
  updateMe: (payload) =>
    apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  getSavedDestinations: () => apiRequest('/users/me/saved-destinations'),
  addSavedDestination: (cityId) =>
    apiRequest('/users/me/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ cityId })
    }),
  removeSavedDestination: (cityId) =>
    apiRequest(`/users/me/saved-destinations/${cityId}`, {
      method: 'DELETE'
    })
};

export const citiesApi = {
  list: (params = {}) => apiRequest(`/cities?${new URLSearchParams(params).toString()}`),
  activities: (cityId, params = {}) =>
    apiRequest(`/cities/${cityId}/activities?${new URLSearchParams(params).toString()}`)
};

export const activitiesApi = {
  list: (params = {}) => apiRequest(`/activities?${new URLSearchParams(params).toString()}`)
};

export const tripsApi = {
  list: (params = {}) => apiRequest(`/trips?${new URLSearchParams(params).toString()}`),
  get: (tripId) => apiRequest(`/trips/${tripId}`),
  create: (payload) =>
    apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (tripId, payload) =>
    apiRequest(`/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  remove: (tripId) =>
    apiRequest(`/trips/${tripId}`, {
      method: 'DELETE'
    }),
  itinerary: (tripId, params = {}) => apiRequest(`/trips/${tripId}/itinerary?${new URLSearchParams(params).toString()}`),
  addStop: (tripId, payload) =>
    apiRequest(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  reorderStops: (tripId, items) =>
    apiRequest(`/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items })
    }),
  removeStop: (tripId, stopId) =>
    apiRequest(`/trips/${tripId}/stops/${stopId}`, {
      method: 'DELETE'
    }),
  addStopActivity: (tripId, stopId, payload) =>
    apiRequest(`/trips/${tripId}/stops/${stopId}/activities`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateStopActivity: (tripId, stopId, stopActivityId, payload) =>
    apiRequest(`/trips/${tripId}/stops/${stopId}/activities/${stopActivityId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteStopActivity: (tripId, stopId, stopActivityId) =>
    apiRequest(`/trips/${tripId}/stops/${stopId}/activities/${stopActivityId}`, {
      method: 'DELETE'
    }),
  budgetSummary: (tripId) => apiRequest(`/trips/${tripId}/budget-summary`),
  expenses: (tripId) => apiRequest(`/trips/${tripId}/expenses`),
  createExpense: (tripId, payload) =>
    apiRequest(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateExpense: (tripId, expenseId, payload) =>
    apiRequest(`/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteExpense: (tripId, expenseId) =>
    apiRequest(`/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE'
    }),
  packingItems: (tripId) => apiRequest(`/trips/${tripId}/packing-items`),
  createPackingItem: (tripId, payload) =>
    apiRequest(`/trips/${tripId}/packing-items`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updatePackingItem: (tripId, itemId, payload) =>
    apiRequest(`/trips/${tripId}/packing-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deletePackingItem: (tripId, itemId) =>
    apiRequest(`/trips/${tripId}/packing-items/${itemId}`, {
      method: 'DELETE'
    }),
  resetPacking: (tripId) =>
    apiRequest(`/trips/${tripId}/packing-items/reset`, {
      method: 'POST'
    }),
  notes: (tripId) => apiRequest(`/trips/${tripId}/notes`),
  createNote: (tripId, payload) =>
    apiRequest(`/trips/${tripId}/notes`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateNote: (tripId, noteId, payload) =>
    apiRequest(`/trips/${tripId}/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteNote: (tripId, noteId) =>
    apiRequest(`/trips/${tripId}/notes/${noteId}`, {
      method: 'DELETE'
    }),
  share: (tripId) =>
    apiRequest(`/trips/${tripId}/share`, {
      method: 'POST'
    })
};

export const publicApi = {
  listTrips: (params = {}) => apiRequest(`/public/trips?${new URLSearchParams(params).toString()}`),
  getTrip: (token) => apiRequest(`/public/trips/${token}`),
  copyTrip: (token) =>
    apiRequest(`/public/trips/${token}/copy`, {
      method: 'POST'
    })
};

export function getApiBaseUrl() {
  return API_URL;
}
