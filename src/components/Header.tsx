import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  const handleScrollTo = (sectionId: string) => () => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-white dark:bg-gray-900 shadow-md"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mr-12"
        >
          <Link
            to="/"
            className="text-3xl font-display font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500">
              Drive
            </span>
            <span className="text-gray-800 dark:text-white">Now</span>
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-10 font-medium ml-8">
          {(isAdmin
            ? [
                { to: "/dashboard", label: "Dashboard" },
                { to: "/admin", label: "Administration" },
                { to: "/profile", label: "Profil" },
                { to: "/", label: "Déconnexion", onClick: handleLogout },
              ]
            : [
                { to: "/", label: "Accueil", onClick: undefined },
                { to: "/cars", label: "Notre Flotte", onClick: undefined },
                {
                  to: "#services-section",
                  label: "Services",
                  onClick: handleScrollTo("services-section"),
                },
                {
                  to: "#contact-section",
                  label: "Contact",
                  onClick: handleScrollTo("contact-section"),
                },
                ...(isAuthenticated
                  ? [
                      { to: "/dashboard", label: "Dashboard" },
                      { to: "/reservations", label: "Historique" },
                      { to: "/profile", label: "Profil" },
                      { to: "/", label: "Déconnexion", onClick: handleLogout },
                    ]
                  : [{ to: "/register", label: "Connexion" }]),
              ]
          ).map((item, index) => (
            <motion.div
              key={item.label}
              className="relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              ) : (
                <Link
                  to={item.to}
                  className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              )}
            </motion.div>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-6 ml-10">
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            title={isDark ? "Mode clair" : "Mode sombre"}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zm2.828 2.828l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM10 2a1 1 0 01.993.883l.084 1.002a1 1 0 11-1.98.14l-.084-1.002A1 1 0 0110 2zm0 16a1 1 0 01-.993-.883l-.084-1.002a1 1 0 111.98-.14l.084 1.002A1 1 0 0110 18zm4.068-4.068l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM5.932 5.932l.707-.707a1 1 0 00-1.414-1.414L4.518 4.518a1 1 0 001.414 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </motion.div>
          </motion.button>

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap relative z-10"
              >
                Réservez maintenant
              </Link>
            </motion.div>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            title={isDark ? "Mode clair" : "Mode sombre"}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zm2.828 2.828l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM10 2a1 1 0 01.993.883l.084 1.002a1 1 0 11-1.98.14l-.084-1.002A1 1 0 0110 2zm0 16a1 1 0 01-.993-.883l-.084-1.002a1 1 0 111.98-.14l.084 1.002A1 1 0 0110 18zm4.068-4.068l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM5.932 5.932l.707-.707a1 1 0 00-1.414-1.414L4.518 4.518a1 1 0 001.414 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </motion.div>
          </motion.button>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                initial={false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-t border-gray-200 dark:border-gray-700"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="px-4 py-6 space-y-4">
              {[
                { to: "/", label: "Accueil", onClick: undefined },
                {
                  to: "#cars-section",
                  label: "Voitures",
                  onClick: handleScrollTo("cars-section"),
                },
                { to: "/cars", label: "Notre Flotte", onClick: undefined },
                {
                  to: "#services-section",
                  label: "Services",
                  onClick: handleScrollTo("services-section"),
                },
                {
                  to: "#contact-section",
                  label: "Contact",
                  onClick: handleScrollTo("contact-section"),
                },
                ...(isAuthenticated
                  ? [
                      { to: "/dashboard", label: "Dashboard" },
                      { to: "/reservations", label: "Historique" },

                      { to: "/profile", label: "Profil" },
                      {
                        to: "/",
                        label: "Déconnexion",
                        onClick: () => {
                          handleLogout();
                        },
                      },
                    ]
                  : [{ to: "/register", label: "Connexion" }]),
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  className="border-b border-gray-100 dark:border-gray-800 pb-3"
                >
                  {item.onClick ? (
                    <button
                      onClick={() => {
                        item.onClick();
                        setIsOpen(false);
                      }}
                      className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium py-2"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium py-2"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              {isAuthenticated && (
                <>
                  {[
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/reservations", label: "Historique" },
                    ...(isAdmin
                      ? [{ to: "/admin", label: "Administration" }]
                      : []),
                    { to: "/profile", label: "Profil" },
                    { to: "/", label: "Déconnexion", onClick: handleLogout },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      variants={itemVariants}
                      className="border-b border-gray-100 dark:border-gray-800 pb-3"
                    >
                      {item.onClick ? (
                        <button
                          onClick={() => {
                            item.onClick?.();
                            setIsOpen(false);
                          }}
                          className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium py-2"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={() => setIsOpen(false)}
                          className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium py-2"
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </>
              )}

              <motion.div variants={itemVariants} className="pt-4">
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Réservez maintenant
                </Link>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
