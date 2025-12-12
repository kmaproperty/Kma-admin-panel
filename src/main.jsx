import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ToasterProvider from "./providers/ToastProvider.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";
import { router } from "./routes/Routes.jsx";
import { RouterProvider } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryProvider>
        <RouterProvider router={router}/>
    </QueryProvider>
      <ToasterProvider/>
  </StrictMode>
);
