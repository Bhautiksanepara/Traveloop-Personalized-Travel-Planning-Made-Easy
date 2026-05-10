const ACCESS_TOKEN_KEY = 'traveloop_access_token';
const REFRESH_TOKEN_KEY = 'traveloop_refresh_token';
const USER_KEY = 'traveloop_user';
const SELECTED_TRIP_KEY = 'traveloop_selected_trip_id';

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSelectedTripId() {
  return localStorage.getItem(SELECTED_TRIP_KEY) || '';
}

export function setSelectedTripId(tripId) {
  if (!tripId) {
    localStorage.removeItem(SELECTED_TRIP_KEY);
    return;
  }

  localStorage.setItem(SELECTED_TRIP_KEY, tripId);
}
