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
import { useEffect } from "react";

function NotFoundRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/task");
  }, [navigate]);

  return null;
}

function App() {
  return (
    <AppProviders>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            {routes.map((route) => {
              const {
                path,
                component: Component,
                protected: isProtected,
              } = route;
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
            })}{" "}
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
