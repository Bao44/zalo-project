import "./App.css";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./redux/store"; // Đảm bảo đường dẫn đúng

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;