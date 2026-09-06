import { Routes, Route, Navigate } from "react-router-dom";
import Analytics from "./pages/Analytics";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import HabitDetails from "./pages/HabitDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>


      <Route
            path="/habits/:id"
            element={
            <ProtectedRoute>
            <HabitDetails />
            </ProtectedRoute>
                     }
      />

      {/* PUBLIC ROUTES */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* PROTECTED ROUTES */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
         path="/analytics"
         element={
           <ProtectedRoute>
              <Analytics />
           </ProtectedRoute>
     }
    />

      <Route
        path="/habits"
        element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        }
      />

      {/* DEFAULT ROUTE */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* UNKNOWN ROUTES */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;