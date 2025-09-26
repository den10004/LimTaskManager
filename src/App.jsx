import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import { AppProviders } from "./AppProviders";
import { routes } from "./routesConfig";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";

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
            })}
          </Routes>
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
