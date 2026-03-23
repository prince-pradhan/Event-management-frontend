import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import AppRouter from "./routes";
import "./styles/index.css";

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRouter />
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}
