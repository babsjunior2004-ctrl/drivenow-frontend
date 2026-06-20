import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useReservations } from "../contexts/ReservationContext";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { carsApi, type Car as ApiCar } from "../services/api";
import { motion } from "framer-motion";
import AdminNav from "../components/AdminNav";

const API_BASE = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

interface AllBooking {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  user: { id: number; firstName: string; lastName: string; email: string };
  car: { id: number; brand: string; model: string; imageUrl?: string };
  createdAt: string;
}

const statusLabel = (status: string) => {
  if (status === "PENDING") return "En attente";
  if (status === "CONFIRMED") return "Confirmée";
  if (status === "CANCELLED") return "Annulée";
  return status;
};

const statusClass = (status: string) => {
  if (status === "PENDING")
    return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
  if (status === "CONFIRMED")
    return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
  return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
};

// ===================================================================
// TABLEAU DE BORD ADMIN — statistiques globales sur tous les clients
// ===================================================================
const AdminDashboard = () => {
  useAuth();
  const [bookings, setBookings] = useState<AllBooking[]>([]);
  const [carsCount, setCarsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, carsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/bookings`, { headers: authHeaders() }),
        fetch(`${API_BASE}/cars`, { headers: authHeaders() }),
        fetch(`${API_BASE}/users`, { headers: authHeaders() }),
      ]);

      const bookingsData = await bookingsRes.json();
      const carsData = await carsRes.json();
      const usersData = await usersRes.json();

      if (!bookingsRes.ok) throw new Error(bookingsData.message || "Erreur réservations");

      setBookings(bookingsData);
      setCarsCount(Array.isArray(carsData) ? carsData.length : 0);
      setUsersCount(Array.isArray(usersData) ? usersData.length : 0);
    } catch (err: unknown) {
      setError((err as Error).message || "Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  // --- Calculs des statistiques à partir des vraies données du backend ---

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  // Réservations par mois (toutes confondues, tous clients)
  const monthlyMap = new Map<string, number>();
  bookings.forEach((b) => {
    const date = new Date(b.createdAt || b.startDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  });
  const monthlyData =
    monthlyMap.size > 0
      ? Array.from(monthlyMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, count]) => ({ month, reservations: count }))
      : [{ month: "Aucune donnée", reservations: 0 }];

  // Voitures les plus réservées (toutes voitures, tous clients)
  const carMap = new Map<string, number>();
  bookings.forEach((b) => {
    const key = `${b.car.brand} ${b.car.model}`;
    carMap.set(key, (carMap.get(key) || 0) + 1);
  });
  const carColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const topCarsData =
    carMap.size > 0
      ? Array.from(carMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value], i) => ({ name, value, color: carColors[i % carColors.length] }))
      : [{ name: "Aucune donnée", value: 1, color: "#9CA3AF" }];

  // Répartition par statut (pour le graphique en barres)
  const statusData = [
    { name: "En attente", value: pendingCount, color: "#F59E0B" },
    { name: "Confirmées", value: confirmedCount, color: "#10B981" },
    { name: "Annulées", value: cancelledCount, color: "#EF4444" },
  ];

  // Meilleurs clients (par nombre de réservations)
  const clientMap = new Map<string, { name: string; count: number; total: number }>();
  bookings.forEach((b) => {
    const key = b.user.email;
    const existing = clientMap.get(key);
    const name = `${b.user.firstName} ${b.user.lastName}`;
    if (existing) {
      existing.count += 1;
      existing.total += b.status !== "CANCELLED" ? Number(b.totalPrice) : 0;
    } else {
      clientMap.set(key, {
        name,
        count: 1,
        total: b.status !== "CANCELLED" ? Number(b.totalPrice) : 0,
      });
    }
  });
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tableau de bord{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Administrateur
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Vue d'ensemble de l'activité de location sur toute la plateforme
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            Chargement des statistiques...
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {pendingCount}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Réservations en attente
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {confirmedCount}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Réservations confirmées
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {totalRevenue.toLocaleString()} FCFA
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Revenu total confirmé
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {carsCount}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Voitures au catalogue
                </p>
              </motion.div>
            </motion.div>

            {/* Secondary metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{usersCount}</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Utilisateurs inscrits</p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Réservations totales</p>
                </div>
                <span className="text-3xl">📋</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{cancelledCount}</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Réservations annulées</p>
                </div>
                <span className="text-3xl">❌</span>
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Évolution des réservations (tous clients)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" stroke="currentColor" />
                    <YAxis stroke="currentColor" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reservations"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#3B82F6", strokeWidth: 2, fill: "#FFFFFF" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Voitures les plus réservées
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topCarsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {topCarsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Répartition par statut
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Meilleurs clients
                </h2>
                {topClients.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Aucune donnée client pour le moment.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topClients.map((client, index) => (
                      <div
                        key={client.name + index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {client.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {client.count} réservation(s)
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {client.total.toLocaleString()} FCFA
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent bookings table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Réservations récentes
                </h2>
                <Link
                  to="/admin"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Gérer dans Administration →
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  Aucune réservation pour le moment.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Voiture
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentBookings.map((b) => (
                        <motion.tr
                          key={b.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {b.user.firstName} {b.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {b.user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {b.car.brand} {b.car.model}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {new Date(b.startDate).toLocaleDateString()} →{" "}
                            {new Date(b.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-blue-600 dark:text-blue-400">
                              {Number(b.totalPrice).toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusClass(
                                b.status,
                              )}`}
                            >
                              {statusLabel(b.status)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

// ===================================================================
// TABLEAU DE BORD CLIENT — inchangé, basé sur ses propres réservations
// ===================================================================
const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    getActiveReservations,
    getReservationHistory,
    getDashboardStats,
    fetchMyReservations,
    reservations,
  } = useReservations();

  const [recommendedCars, setRecommendedCars] = useState<ApiCar[]>([]);

  useEffect(() => {
    fetchMyReservations();
    carsApi
      .getAll(true)
      .then((cars) => setRecommendedCars(cars.slice(0, 4)))
      .catch(() => setRecommendedCars([]));
  }, [fetchMyReservations]);

  const activeReservations = getActiveReservations();
  const history = getReservationHistory();
  const stats = getDashboardStats();

  const monthlyData =
    stats.monthlyReservations.length > 0
      ? stats.monthlyReservations.map((m) => ({
          month: m.month,
          reservations: m.count,
        }))
      : [{ month: "Aucune donnée", reservations: 0 }];

  const carTypeColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const carTypeData =
    stats.topCars.length > 0
      ? stats.topCars.map((c, i) => ({
          name: `${c.brand} ${c.model}`.trim(),
          value: c.count,
          color: carTypeColors[i % carTypeColors.length],
        }))
      : [{ name: "Aucune réservation", value: 1, color: "#9CA3AF" }];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DriveNow
                </span>
              </motion.div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/dashboard"
                className="relative px-4 py-2 text-blue-600 dark:text-blue-400 font-medium transition-colors group"
              >
                <span>Tableau de bord</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  initial={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <Link
                to="/reservations"
                className="relative px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <span>Réservations</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <Link
                to="/profile"
                className="relative px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <span>Profil</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Déconnexion
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bienvenue,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user?.firstName}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez vos réservations et découvrez nos meilleures offres de
            location
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {activeReservations.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Réservations actives
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalSpent.toLocaleString()} FCFA
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Total dépensé
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-2xl">🚗</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalCompleted}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Réservations confirmées
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Évolution des réservations
              </h2>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                />
                <XAxis dataKey="month" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reservations"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                  activeDot={{
                    r: 8,
                    stroke: "#3B82F6",
                    strokeWidth: 2,
                    fill: "#FFFFFF",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Vos voitures les plus réservées
              </h2>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={carTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {carTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Recommandations pour vous
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Découvrez nos véhicules disponibles
              </p>
            </div>
            <Link
              to="/cars"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Voir toutes les voitures →
            </Link>
          </div>
          {recommendedCars.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune voiture disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative mb-4">
                    <img
                      src={car.imageUrl}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {car.brand} {car.model}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Number(car.pricePerDay).toLocaleString()} FCFA
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      /jour
                    </span>
                  </div>
                  <Link
                    to="/cars"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 block text-center shadow-lg hover:shadow-xl"
                  >
                    Réserver maintenant
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Réservations récentes
            </h2>
          </div>
          {reservations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              Aucune réservation pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Voiture
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...activeReservations, ...history.slice(0, 5)].map(
                    (reservation) => (
                      <motion.tr
                        key={reservation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={reservation.car.imageUrl}
                              alt={reservation.car.model}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {reservation.car.brand} {reservation.car.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {new Date(reservation.startDate).toLocaleDateString()} →{" "}
                          {new Date(reservation.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {Number(reservation.totalPrice).toLocaleString()} FCFA
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusClass(
                              reservation.status,
                            )}`}
                          >
                            {statusLabel(reservation.status)}
                          </span>
                        </td>
                      </motion.tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ===================================================================
// POINT D'ENTRÉE — choisit le bon dashboard selon le rôle
// ===================================================================
const Dashboard = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
};

export default Dashboard;
