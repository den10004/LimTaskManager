import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import { AppProviders } from "./AppProviders";
import { routes } from "./routesConfig";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { useEffect, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";

function NotFoundRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    navigate(isAuthenticated ? "/task" : "/");
  }, [navigate, isAuthenticated]);

  return null;
}

function App() {
  return (
    <AppProviders>
      <Router>
        <div className="App">
          <Header />
          <Suspense fallback={<div className="loading">Загрузка...</div>}>
            <Routes>
              {routes.map((route) => {
                const { path, component: Component, protected: isProtected } = route;
                return (
                  <Route
                    key={path}
                    path={path}
                    element={
                      isProtected ? (
                        <ProtectedRoute>
                          <Component />
                        </ProtectedRoute>
                      ) : (
                        <Component />
                      )
                    }
                  />
                );
              })}
              <Route path="*" element={<NotFoundRedirect />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
