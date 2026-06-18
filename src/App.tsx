import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ReservationProvider } from "./contexts/ReservationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import ScrollToTop from "./components/ScrollToTop";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import Cars from "./pages/Cars";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.4,
};

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <AuthProvider>
        <ReservationProvider>
          <FavoritesProvider>
            <ScrollToTop />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Landing />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/cars"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Cars />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Login />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Register />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <ResetPassword />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/reservations"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Reservations />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MainLayout>
                        <Admin />
                      </MainLayout>
                    </motion.div>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </FavoritesProvider>
        </ReservationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;