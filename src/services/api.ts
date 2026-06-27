// =====================================================
// src/services/api.ts
// Couche de communication avec le backend DriveNow API
// =====================================================

// En développement : proxy Vite vers localhost:3000
// En production : VITE_API_URL doit pointer vers le backend Railway
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api';

// ---- Utilitaires ----

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Erreur serveur';
    throw new Error(message);
  }
  return data as T;
}

// ---- Types ----

export type UserRole = 'ADMIN' | 'CLIENT';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  access_token: string;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  transmission: 'MANUELLE' | 'AUTOMATIQUE';
  fuelType: 'ESSENCE' | 'DIESEL' | 'ELECTRIQUE' | 'HYBRIDE';
  seats: number;
  imageUrl?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  user: AuthUser;
  car: Car;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: 'CARTE' | 'VIREMENT' | 'ESPECES' | 'MOBILE_MONEY';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  booking: Booking;
  createdAt: string;
}

// ---- Auth API ----

export const authApi = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getProfile(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: authHeaders(),
    });
    return handleResponse<AuthUser>(res);
  },
};

// ---- Users API ----

export const usersApi = {
  async update(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      password?: string;
    },
  ): Promise<AuthUser> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthUser>(res);
  },

  async getAll(): Promise<AuthUser[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: authHeaders(),
    });
    return handleResponse<AuthUser[]>(res);
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ---- Cars API ----

export const carsApi = {
  async getAll(available?: boolean): Promise<Car[]> {
    const url =
      available !== undefined
        ? `${API_BASE_URL}/cars?available=${available}`
        : `${API_BASE_URL}/cars`;
    const res = await fetch(url);
    return handleResponse<Car[]>(res);
  },

  async getById(id: number): Promise<Car> {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`);
    return handleResponse<Car>(res);
  },

  async create(data: Partial<Car>): Promise<Car> {
    const res = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Car>(res);
  },

  async update(id: number, data: Partial<Car>): Promise<Car> {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Car>(res);
  },

  async delete(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};

// ---- Bookings API ----

export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      headers: authHeaders(),
    });
    return handleResponse<Booking[]>(res);
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE_URL}/bookings/my`, {
      headers: authHeaders(),
    });
    return handleResponse<Booking[]>(res);
  },

  async getById(id: number): Promise<Booking> {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<Booking>(res);
  },

  async create(data: {
    carId: number;
    startDate: string;
    endDate: string;
  }): Promise<Booking> {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Booking>(res);
  },

  async cancel(id: number): Promise<Booking> {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    return handleResponse<Booking>(res);
  },

  async delete(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};

// ---- Payments API ----

export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      headers: authHeaders(),
    });
    return handleResponse<Payment[]>(res);
  },

  async create(data: {
    bookingId: number;
    paymentMethod: 'CARTE' | 'VIREMENT' | 'ESPECES' | 'MOBILE_MONEY';
  }): Promise<Payment> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Payment>(res);
  },
};

// ---- Weather API ----

export const weatherApi = {
  async getWeather(city: string) {
    const res = await fetch(
      `${API_BASE_URL}/weather/${encodeURIComponent(city)}`,
    );
    return handleResponse<{
      city: string;
      country: string;
      temperature: number;
      feelsLike: number;
      humidity: number;
      description: string;
      icon: string;
      windSpeed: number;
      timestamp: string;
    }>(res);
  },
};
