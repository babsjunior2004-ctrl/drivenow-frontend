import { useState } from "react";
import { useReservations } from "../contexts/ReservationContext";

interface DisplayCar {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
}

interface ReservationModalProps {
  car: DisplayCar;
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  car,
  isOpen,
  onClose,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { addReservation } = useReservations();

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError("Veuillez remplir les deux dates");
      return;
    }

    const today = new Date(getTodayDate());
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      setError("La date de début ne peut pas être dans le passé");
      return;
    }

    if (end <= start) {
      setError("La date de fin doit être après la date de début");
      return;
    }

    setLoading(true);

    // Le backend attend un objet "Car" complet (id, brand, model, pricePerDay...)
    // On reconstruit un objet compatible à partir des données affichées
    const success = await addReservation(
      {
        id: car.id,
        brand: car.brand,
        model: car.name,
        pricePerDay: car.price,
        year: new Date().getFullYear(),
        transmission: "AUTOMATIQUE",
        fuelType: "ESSENCE",
        seats: 5,
        imageUrl: car.image,
        available: true,
        createdAt: "",
        updatedAt: "",
      },
      startDate,
      endDate,
    );

    setLoading(false);

    if (success) {
      onClose();
      alert("Réservation effectuée avec succès !");
    } else {
      setError("Erreur lors de la réservation. La voiture est peut-être déjà prise.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 transition-colors duration-300">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Réserver {car.brand} {car.name}
        </h3>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setError("");
              }}
              min={getTodayDate()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setError("");
              }}
              min={getTodayDate()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {startDate && endDate && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Prix total:{" "}
                {(() => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const days = Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                  );
                  return (days * car.price).toLocaleString();
                })()}{" "}
                FCFA
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-300 disabled:opacity-50"
            >
              {loading ? "Réservation..." : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;