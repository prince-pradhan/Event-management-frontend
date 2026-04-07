import { GoogleOAuthProvider } from "@react-oauth/google";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import AppRouter from "./routes";
import "./styles/index.css";

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <PayPalScriptProvider options={{ 
        "client-id": paypalClientId,
        intent: "capture",
        currency: "USD"
      }}>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRouter />
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  );
}
