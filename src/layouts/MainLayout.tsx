import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideHeader = [
    "/dashboard",
    "/reservations",
    "/profile",
    "/admin",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {!hideHeader && <Header />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
