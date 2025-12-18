import { createBrowserRouter } from "react-router-dom";
import Dashbaord from "../pages/dashboard/page.jsx";
import Layout from "../components/layout/layout.jsx";
import PostProperty from "../pages/post-property/page.jsx";
import Login from "../pages/sign-in/page.jsx";
import PropertyList from "../pages/post-property/propertyList.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ChannelPartnerListing from "../pages/channel-partner/page.jsx";
import ChannelPartnerCode from "../pages/channel-partner/code/page.jsx";
import AddEditChannelPartnerCodes from "../pages/channel-partner/code/addEditCode.jsx";
import AddEditChannelPartner from "../pages/channel-partner/addEditChannelPartner.jsx";
import OwnersListingPage from "../pages/owners/page.jsx";

export const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <Login />
  },
  {
    element: <ProtectedRoute />, 
    children: [
      {
        path: "/",
        element: <Layout />, 
        children: [
          { path: "/", element: <Dashbaord /> },
          { path: '/properties', element: <PropertyList /> },
          { path: '/properties/:propertyId', element: <PostProperty /> },
          { path: '/channel-partners', element: <ChannelPartnerListing /> },
          { path: '/channel-partners/edit/:id', element: <AddEditChannelPartner /> },
          { path: '/channel-partners/code', element: <ChannelPartnerCode /> },
          { path: '/channel-partners/code/add', element: <AddEditChannelPartnerCodes /> },
          { path: '/channel-partners/code/edit/:id', element: <AddEditChannelPartnerCodes /> },
          { path: '/owners', element: <OwnersListingPage /> },
        ],
      },
    ],
  },
]);
