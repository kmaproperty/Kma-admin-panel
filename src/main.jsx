import { createRoot } from "react-dom/client";
import "./index.css";
import ToasterProvider from "./providers/ToastProvider.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";
import App from "./App.jsx";
import './App.css'
import StoreProvider from "./providers/StoreProvider.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <QueryProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </QueryProvider>
    <ToasterProvider />
  </>
);
