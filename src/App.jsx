import "./App.css";
import Header from "./components/Header/Header";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TeamPage from "./pages/Team";
import CreatePage from "./pages/Create";
import MainPage from "./pages/Main";
import TaskDetails from "./pages/TaskDetails";
import Directions from "./pages/Directions";
import User from "./pages/User";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/directions"
              element={
                <ProtectedRoute>
                  <Directions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
