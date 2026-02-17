import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes";
import "./styles/index.css";

export default function App() {
  return (
    <GoogleOAuthProvider clientId="423512627428-ge7b6qmbkm6emofr4fukgoboptv0rpkc.apps.googleusercontent.com">
      <AuthProvider>
             <AppRouter />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
