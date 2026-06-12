import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Matches from "@/pages/Matches";
import Predict from "@/pages/Predict";
import Groups from "@/pages/Groups";
import Leaderboard from "@/pages/Leaderboard";
import Leagues from "@/pages/Leagues";
import LeagueDetail from "@/pages/LeagueDetail";
import Badges from "@/pages/Badges";
import Premium from "@/pages/Premium";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";

const Protected = ({ children, adminOnly }) => {
  const { user } = useAuth();
  if (user === undefined)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-display text-2xl gold-text animate-pulse">PREDICT90</span>
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/matches" element={<Protected><Matches /></Protected>} />
        <Route path="/predict" element={<Protected><Predict /></Protected>} />
        <Route path="/groups" element={<Protected><Groups /></Protected>} />
        <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
        <Route path="/leagues" element={<Protected><Leagues /></Protected>} />
        <Route path="/leagues/:id" element={<Protected><LeagueDetail /></Protected>} />
        <Route path="/badges" element={<Protected><Badges /></Protected>} />
        <Route path="/premium" element={<Protected><Premium /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-center" richColors theme="dark" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
