// import "./App.css";
// import { AuthProvider } from "../contexts/AuthContext";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import Start from "./pages/Start";
// import Home from "./pages/Home";
// import { Provider } from "react-redux";
// import { store } from "./redux/store";
// import ResetPassword from "./pages/ResetPassword";
// import Room from "./pages/Room";

// function App() {
//   return (
//     <Provider store={store}>
//       <Router>
//         <AuthProvider>
//           <Routes>
//             <Route path="/" element={<Start />} />
//             <Route path="/home" element={<Home />} />
//             <Route path="/room/:roomId" element={<Room />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </AuthProvider>
//       </Router>
//     </Provider>
//   );
// }

// export default App;

import "./App.css";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
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
import Room from "./pages/Room";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <Room />
                </ProtectedRoute>
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
