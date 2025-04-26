import "./App.css";
import { AuthProvider } from "../contexts/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import Room from "./pages/Room";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/home" element={<Home />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/homepage/room/:roomId" element={<Room />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
