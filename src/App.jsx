import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import HazardDetails from "./pages/HazardDetails";
import ReportHazard from "./pages/ReportHazard";
import SimplePage from "./pages/SimplePage";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/hazards/:id" element={<HazardDetails />} />

            {/* Authentication pages */}
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />

            {/* User pages */}
            <Route path="/report" element={<ReportHazard />} />
            <Route
              path="/my-reports"
              element={<SimplePage type="reports" />}
            />
            <Route
              path="/profile"
              element={<SimplePage type="profile" />}
            />
            <Route
              path="/notifications"
              element={<SimplePage type="notifications" />}
            />

            {/* Admin page */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 404 page */}
            <Route path="*" element={<SimplePage type="notfound" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}