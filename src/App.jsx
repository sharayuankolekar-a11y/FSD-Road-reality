import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/footer";

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

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/hazards/:id" element={<HazardDetails />} />
            <Route path="/report" element={<ReportHazard />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/my-reports" element={<SimplePage type="reports" />} />
            <Route path="/profile" element={<SimplePage type="profile" />} />
            <Route
              path="/notifications"
              element={<SimplePage type="notifications" />}
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<SimplePage type="notfound" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}