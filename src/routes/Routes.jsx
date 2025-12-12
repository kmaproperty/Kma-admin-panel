import { createBrowserRouter } from "react-router-dom";
import Dashbaord from "../pages/dashboard/page.jsx";
import Layout from "../components/layout/layout.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Dashbaord /> },
    ],
  },
]);
