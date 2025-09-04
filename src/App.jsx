import "./App.css";
import Header from "./components/Header/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TeamPage from "./pages/Team";
import CreatePage from "./pages/Create";
import MainPage from "./pages/Main";
import User from "./pages/User";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/user" element={<User />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/create" element={<CreatePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
