import { createBrowserRouter } from "react-router-dom";
import Dashbaord from "../pages/dashboard/page.jsx";
import Layout from "../components/layout/layout.jsx";
import PostProperty from "../pages/post-property/page.jsx";
import Login from "../pages/sign-in/page.jsx";
import PropertyList from "../pages/post-property/propertyList.jsx";
import Amenities from "../pages/amenities/page.jsx";
import Furnishing from "../pages/furnishings/page.jsx";
import Cities from "../pages/cities/page.jsx";
import Socities from "../pages/societies/page.jsx";
import Localities from "../pages/localities/page.jsx";

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
      {path: '/properties/:propertyId', element: <PostProperty/>},
      {path: '/amenities', element: <Amenities/>},
      {path: '/furnishing', element: <Furnishing/>},
      {path: '/cities', element: <Cities/>},
      {path: '/socities', element: <Socities/>},
      {path: '/localities', element: <Localities/>},
    ],
  },
]);
