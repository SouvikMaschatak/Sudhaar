const BASE_URL = 'https://sudhaar-backend.onrender.com';

// ── Resident login ────────────────────────────────────────────
export async function residentLogin(phone, password) {
  const response = await fetch(`${BASE_URL}/resident/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  localStorage.setItem("accessToken",   data.accessToken);
  localStorage.setItem("residentPhone", phone); // ← saved for API calls
  localStorage.setItem("userType",      "resident");
  return data;
}

// ── Municipality login ────────────────────────────────────────
export async function municipalityLogin(municipalityId, password) {
  const response = await fetch(`${BASE_URL}/municipality/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ municipalityId, password }),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  localStorage.setItem("accessToken",    data.accessToken);
  localStorage.setItem("municipalityId", municipalityId); // ← saved for API calls
  localStorage.setItem("userType",       "municipality");
  return data;
}

// ── Municipality registration ─────────────────────────────────
export async function municipalitySignup(formData) {
  const response = await fetch(`${BASE_URL}/municipality/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

// ── Resident registration ─────────────────────────────────────
export async function residentSignup(phone, password, name, address) {
  const response = await fetch(`${BASE_URL}/resident/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password, name, address }),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.text();
}

// ── Logout ────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("residentPhone");
  localStorage.removeItem("municipalityId");
  localStorage.removeItem("userType");
}

// ── Get stored token ──────────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// ── Authenticated fetch helper ────────────────────────────────
// Use this for ALL protected API calls — auto adds Bearer token
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}