import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { carsApi, type Car } from "../services/api";
import AdminNav from "../components/AdminNav";

interface AdminBooking {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  user: { id: number; firstName: string; lastName: string; email: string };
  car: { id: number; brand: string; model: string; imageUrl?: string };
}

const API_BASE = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const emptyCarForm = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  pricePerDay: 0,
  transmission: "AUTOMATIQUE" as "AUTOMATIQUE" | "MANUELLE",
  fuelType: "ESSENCE" as "ESSENCE" | "DIESEL" | "ELECTRIQUE" | "HYBRIDE",
  seats: 5,
  imageUrl: "",
  available: true,
};

const statusLabel = (status: string) => {
  if (status === "PENDING") return "En attente";
  if (status === "CONFIRMED") return "Confirmée";
  if (status === "CANCELLED") return "Annulée";
  return status;
};

const statusClass = (status: string) => {
  if (status === "PENDING")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  if (status === "CONFIRMED")
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
};

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"cars" | "bookings">("bookings");

  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);
  const [carError, setCarError] = useState("");
  const [carSaving, setCarSaving] = useState(false);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadCars();
    loadBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadCars = async () => {
    setCarsLoading(true);
    try {
      const data = await carsApi.getAll();
      setCars(data);
    } catch (err: unknown) {
      setCarError((err as Error).message || "Erreur lors du chargement des voitures");
    } finally {
      setCarsLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingError("");
    try {
      const res = await fetch(`${API_BASE}/bookings`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de chargement");
      setBookings(data);
    } catch (err: unknown) {
      setBookingError((err as Error).message || "Erreur lors du chargement des réservations");
    } finally {
      setBookingsLoading(false);
    }
  };

  const resetCarForm = () => {
    setCarForm(emptyCarForm);
    setEditingCarId(null);
    setCarError("");
  };

  const startEditCar = (car: Car) => {
    setEditingCarId(car.id);
    setCarForm({
      brand: car.brand,
      model: car.model,
      year: car.year,
      pricePerDay: Number(car.pricePerDay),
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      imageUrl: car.imageUrl || "",
      available: car.available,
    });
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarError("");
    setCarSaving(true);
    try {
      if (editingCarId) {
        await carsApi.update(editingCarId, carForm);
      } else {
        await carsApi.create(carForm);
      }
      await loadCars();
      resetCarForm();
    } catch (err: unknown) {
      setCarError((err as Error).message || "Erreur lors de l'enregistrement");
    } finally {
      setCarSaving(false);
    }
  };

  const handleDeleteCar = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette voiture ?")) return;
    try {
      await carsApi.delete(id);
      await loadCars();
    } catch (err: unknown) {
      setCarError((err as Error).message || "Erreur lors de la suppression");
    }
  };

  const updateBookingStatus = async (
    id: number,
    status: "CONFIRMED" | "CANCELLED",
  ) => {
    setBookingError("");
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
      await loadBookings();
    } catch (err: unknown) {
      setBookingError((err as Error).message || "Erreur lors de la mise à jour de la réservation");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Administration
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gérez les voitures et validez les réservations
          </p>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "bookings"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Réservations ({bookings.filter((b) => b.status === "PENDING").length} en attente)
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "cars"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Voitures ({cars.length})
          </button>
        </div>

        {activeTab === "bookings" && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {bookingError && (
              <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
                {bookingError}
              </div>
            )}
            {bookingsLoading ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                Chargement des réservations...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                Aucune réservation pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Client</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Voiture</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Période</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Prix</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {b.user.firstName} {b.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{b.user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {b.car.brand} {b.car.model}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {b.startDate} → {b.endDate}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {Number(b.totalPrice).toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass(b.status)}`}>
                            {statusLabel(b.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.status === "PENDING" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateBookingStatus(b.id, "CONFIRMED")}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                Refuser
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "cars" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingCarId ? "Modifier la voiture" : "Ajouter une voiture"}
                </h3>

                {carError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {carError}
                  </div>
                )}

                <form onSubmit={handleCarSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Marque (ex: Toyota)"
                    value={carForm.brand}
                    onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Modèle (ex: RAV4)"
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Année"
                      value={carForm.year}
                      onChange={(e) => setCarForm({ ...carForm, year: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Prix/jour (FCFA)"
                      value={carForm.pricePerDay}
                      onChange={(e) => setCarForm({ ...carForm, pricePerDay: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={carForm.transmission}
                      onChange={(e) =>
                        setCarForm({ ...carForm, transmission: e.target.value as "AUTOMATIQUE" | "MANUELLE" })
                      }
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                    >
                      <option value="AUTOMATIQUE">Automatique</option>
                      <option value="MANUELLE">Manuelle</option>
                    </select>
                    <select
                      value={carForm.fuelType}
                      onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value as "ESSENCE" | "DIESEL" | "ELECTRIQUE" | "HYBRIDE" })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ESSENCE">Essence</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIQUE">Électrique</option>
                      <option value="HYBRIDE">Hybride</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="Nombre de places"
                    value={carForm.seats}
                    onChange={(e) => setCarForm({ ...carForm, seats: Number(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="URL de l'image"
                    value={carForm.imageUrl}
                    onChange={(e) => setCarForm({ ...carForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={carForm.available}
                      onChange={(e) => setCarForm({ ...carForm, available: e.target.checked })}
                    />
                    Disponible à la location
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={carSaving}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50"
                    >
                      {carSaving ? "Enregistrement..." : editingCarId ? "Modifier" : "Ajouter"}
                    </button>
                    {editingCarId && (
                      <button
                        type="button"
                        onClick={resetCarForm}
                        className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Toutes les voitures
                </h3>
                {carsLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
                ) : (
                  <div className="space-y-3">
                    {cars.map((car) => (
                      <div
                        key={car.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <img
                          src={car.imageUrl}
                          alt={car.model}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {car.brand} {car.model} ({car.year})
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {Number(car.pricePerDay).toLocaleString()} FCFA/jour ·{" "}
                            {car.available ? (
                              <span className="text-green-600 dark:text-green-400">Disponible</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400">Réservée</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => startEditCar(car)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;