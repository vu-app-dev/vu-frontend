// the core API client to make requests to the backend, it will automatically add the base URL and the Authorization header if token is available, and handle errors in a consistent way

import { getStoredToken } from './storage';

function requireEnv(name) {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`${name} is required. Add it to your .env file before building the app.`);
  }
  return value;
}

export const API_BASE_URL = requireEnv('VITE_API_BASE_URL');
export const API_PUBLIC_ORIGIN = import.meta.env.VITE_PUBLIC_API_ORIGIN || API_BASE_URL;

export class ApiError extends Error {
  constructor(payload, response) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : Array.isArray(payload?.message)
          ? payload.message.join(', ')
          : `Request failed with ${response?.status || 'unknown status'}`;

    super(message);
    this.name = 'ApiError';
    this.payload = payload;
    this.status = response?.status;
    this.statusCode = payload?.statusCode ?? response?.status;
    this.error = payload?.error;
  }
}

// add the base URL to the path if it's a relative path, otherwise return the absolute URL as is
function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

// build query string from an object { page: 1, search: "react" } ->  "?page=1&search=react"
export function buildQueryString(input = {}) {
  const params = new URLSearchParams();

  const append = (key, value) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => append(key, item));
      return;
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        append(`${key}[${childKey}]`, childValue);
      });
      return;
    }

    params.append(key, value instanceof Date ? value.toISOString() : String(value));
  };

  Object.entries(input).forEach(([key, value]) => append(key, value));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// the core function to make API calls, it will automatically add the base URL and the Authorization header if token is available
/* 

instead of :
fetch('http://localhost:4000/jobs/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify(data)
})

we use  :
apiFetch(endpoints.jobs.create, {
   method: 'POST',
   body: data
})

*/
export async function apiFetch(path, options = {}, token = getStoredToken()) {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (body && !(body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (typeof body !== 'string') body = JSON.stringify(body);
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(resolveUrl(path), {
    ...options,
    body, // override body with the processed one
    headers, // override headers with the processed one
  });

  const text = await response.text(); // parse as text first to handle non-JSON responses gracefully
  const payload = text // try to parse as JSON, if fails return the raw text, if empty return true for successful response without body
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : true;

  if (!response.ok) {
    throw new ApiError(payload, response);
  }

  return payload;
}

// for public file URLs, if it's already an absolute URL
export function publicFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_PUBLIC_ORIGIN.replace(/\/$/, '')}/public/${String(fileUrl).replace(/^\//, '')}`;
}
