import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ToasterProvider from "./providers/ToastProvider.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryProvider>
        <App/>
    </QueryProvider>
      <ToasterProvider/>
  </StrictMode>
);
