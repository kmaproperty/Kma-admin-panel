import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ToasterProvider from "./providers/ToastProvider.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";
import App from "./App.jsx";
import StoreProvider from "./providers/StoreProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryProvider>
    <StoreProvider>
        <App/>
    </StoreProvider>
    </QueryProvider>
      <ToasterProvider/>
  </StrictMode>
);
