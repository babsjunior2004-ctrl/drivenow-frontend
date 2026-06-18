// =====================================================
// src/contexts/ReservationContext.tsx
// Utilise le backend NestJS pour toutes les réservations
// =====================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { bookingsApi, carsApi, type Booking, type Car } from '../services/api';

interface ReservationContextType {
  reservations: Booking[];
  loading: boolean;
  error: string | null;
  fetchMyReservations: () => Promise<void>;
  addReservation: (car: Car, startDate: string, endDate: string) => Promise<boolean>;
  cancelReservation: (id: number) => Promise<boolean>;
  getActiveReservations: () => Booking[];
  getReservationHistory: () => Booking[];
  getDashboardStats: () => {
    monthlyReservations: Array<{ month: string; count: number }>;
    topCars: Array<{ brand: string; count: number; model: string }>;
    availability: { available: number; booked: number; total: number };
    totalSpent: number;
    totalCompleted: number;
  };
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
};

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({ children }) => {
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.getMyBookings();
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  const addReservation = async (
    car: Car,
    startDate: string,
    endDate: string,
  ): Promise<boolean> => {
    setError(null);
    try {
      const booking = await bookingsApi.create({
        carId: car.id,
        startDate,
        endDate,
      });
      setReservations((prev) => [booking, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réservation');
      return false;
    }
  };

  const cancelReservation = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      const updated = await bookingsApi.cancel(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? updated : r)),
      );
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'annulation");
      return false;
    }
  };

  // Réservations actives : PENDING ou CONFIRMED dont la date de fin est dans le futur
  const getActiveReservations = () =>
    reservations.filter(
      (r) => r.status === 'PENDING' || r.status === 'CONFIRMED',
    );

  // Historique : CANCELLED + CONFIRMED dont la date de fin est passée
  const getReservationHistory = () =>
    reservations.filter((r) => r.status === 'CANCELLED');

  const getDashboardStats = () => {
    const active = getActiveReservations();
    const allReservations = reservations;

    // Réservations mensuelles
    const monthlyMap = new Map<string, number>();
    allReservations.forEach((res) => {
      const date = new Date(res.startDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    });
    const monthlyReservations = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    // Top voitures
    const carMap = new Map<string, { count: number; model: string }>();
    allReservations.forEach((res) => {
      const key = `${res.car.brand} ${res.car.model}`;
      const existing = carMap.get(key);
      carMap.set(key, {
        count: (existing?.count || 0) + 1,
        model: res.car.model,
      });
    });
    const topCars = Array.from(carMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([brand, info]) => ({
        brand,
        count: info.count,
        model: info.model,
      }));

    const totalSpent = allReservations
      .filter((r) => r.status !== 'CANCELLED')
      .reduce((sum, r) => sum + Number(r.totalPrice), 0);

    const totalCompleted = allReservations.filter(
      (r) => r.status === 'CONFIRMED',
    ).length;

    return {
      monthlyReservations,
      topCars,
      availability: {
        available: 0, // sera mis à jour par les pages qui récupèrent /cars?available=true
        booked: active.length,
        total: allReservations.length,
      },
      totalSpent,
      totalCompleted,
    };
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        loading,
        error,
        fetchMyReservations,
        addReservation,
        cancelReservation,
        getActiveReservations,
        getReservationHistory,
        getDashboardStats,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
