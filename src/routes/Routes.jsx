import { createBrowserRouter } from "react-router-dom";
import Dashbaord from "../pages/dashboard/page.jsx";
import Layout from "../components/layout/layout.jsx";
import PostProperty from "../pages/post-property/page.jsx";
import Login from "../pages/sign-in/page.jsx";
import PropertyList from "../pages/post-property/propertyList.jsx";

export const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <Login/>
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Dashbaord /> },
      {path: '/properties', element: <PropertyList/>},
      {path: '/properties/:propertyId', element: <PostProperty/>}
    ],
  },
]);
