import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { carsApi, type Car as ApiCar } from "../services/api";
import CarCard from "../components/carCard";
import ReservationModal from "../components/ReservationModal";

interface DisplayCar {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
}

const toDisplayCar = (car: ApiCar): DisplayCar => ({
  id: car.id,
  name: car.model,
  brand: car.brand,
  price: Number(car.pricePerDay),
  image: car.imageUrl || "",
  rating: 8.5,
});
// Le Footer est inclus dans MainLayout, donc pas besoin d'import

// données des particules calculées une seule fois au chargement du module
const heroParticlesData = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 4 + Math.random() * 2,
  delay: Math.random() * 3,
}));

const statsParticlesData = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 4 + Math.random() * 2,
  delay: Math.random() * 3,
}));

const Landing = () => {
  const [landingCars, setLandingCars] = useState<DisplayCar[]>([]);

  useEffect(() => {
    carsApi
      .getAll(true)
      .then((data) => setLandingCars(data.map(toDisplayCar).slice(0, 8)))
      .catch(() => setLandingCars([]));
  }, []);
  const [selectedCar, setSelectedCar] = useState<DisplayCar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReserve = (car: DisplayCar) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  // réutiliser les constantes définies en dehors du composant
  const heroParticles = heroParticlesData;
  const statsParticles = statsParticlesData;

  return (
    <>
      {/* Hero Section Moderne */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fond avec image et particules animées */}
        <div className="absolute inset-0">
          <img
            src="https://plus.unsplash.com/premium_photo-1737458548419-394d86031310?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Voiture en arrière-plan"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-purple-600/40"></div>
          {heroParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ left: p.left, top: p.top }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>

        {/* Contenu du hero */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-display font-black text-white mb-6 tracking-tight"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(45deg, #ffffff, #e0e7ff, #ffffff)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DriveNow
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-sans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Découvrez l'excellence automobile avec notre service de location
              premium. Des véhicules d'exception pour des expériences
              inoubliables.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={() =>
                document
                  .getElementById("cars-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/25"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.25)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Explorer nos véhicules
            </motion.button>
            <motion.button
              onClick={() =>
                document
                  .getElementById("services-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Services
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform duration-300"
          onClick={() =>
            document
              .getElementById("cars-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* Cars Section Ultra Moderne */}
      <section
        id="cars-section"
        className="py-32 px-4 relative overflow-hidden"
      >
        {/* Fond avec effet de verre */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 opacity-95"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-display font-black text-gray-900 dark:text-white mb-6 tracking-tight"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(45deg, #1e40af, #7c3aed, #1e40af)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Nos Véhicules d'Exception
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Découvrez notre flotte de véhicules premium, entretenus avec soin
              pour votre confort et votre sécurité.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {landingCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.3), // Délai max de 0.3s
                }}
                viewport={{ once: true }}
                className="group"
              >
                <CarCard
                  id={car.id}
                  name={car.name}
                  brand={car.brand}
                  price={car.price}
                  image={car.image}
                  rating={car.rating}
                  onReserve={() => handleReserve(car)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Bouton Voir Plus */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/cars">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>Voir plus de véhicules</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section Services Ultra Moderne */}
      <section
        id="services-section"
        className="py-32 px-4 relative overflow-hidden"
      >
        {/* Fond avec effet de verre */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-950 dark:to-black"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-display font-black text-white mb-6 tracking-tight">
              Services d'Excellence
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans">
              Une expérience de location incomparable avec des services premium
              adaptés à vos besoins.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚗",
                title: "Location Flexible",
                description:
                  "Location journalière, hebdomadaire ou mensuelle avec tarifs préférentiels.",
                features: [
                  "Prix dégressifs",
                  "Modification gratuite",
                  "Annulation flexible",
                ],
              },
              {
                icon: "🛡️",
                title: "Sécurité & Assurance",
                description:
                  "Protection complète et assurance tous risques pour votre tranquillité d'esprit.",
                features: [
                  "Assurance tous risques",
                  "Assistance 24/7",
                  "Véhicules certifiés",
                ],
              },
              {
                icon: "⚡",
                title: "Service Express",
                description:
                  "Réservation en ligne instantanée et livraison à domicile disponible.",
                features: [
                  "Réservation en ligne",
                  "Livraison domicile",
                  "Paiement sécurisé",
                ],
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center text-gray-200"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.2 + i * 0.1,
                      }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full mr-3"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Statistiques avec compteurs animés */}
      <section className="py-32 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Particules animées */}
        <div className="absolute inset-0">
          {statsParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{ left: p.left, top: p.top }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-black text-white mb-6">
              DriveNow en Chiffres
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Notre engagement pour l'excellence se reflète dans nos résultats.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: 2500, label: "Clients Satisfaits", suffix: "+" },
              { number: 98, label: "Taux de Satisfaction", suffix: "%" },
              { number: 150, label: "Véhicules Premium", suffix: "+" },
              { number: 24, label: "Support 24/7", suffix: "/7" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-5xl md:text-6xl font-black text-white mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.3 }}
                    viewport={{ once: true }}
                  >
                    {stat.number.toLocaleString()}
                  </motion.span>
                  <span className="text-blue-300">{stat.suffix}</span>
                </motion.div>
                <p className="text-blue-100 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer avec id pour scroll Contact */}
      <div id="contact-section"></div>

      {selectedCar && (
        <ReservationModal
          car={selectedCar}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Landing;
