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
import Amenities from "../pages/amenities/page.jsx";
import Furnishing from "../pages/furnishings/page.jsx";
import Cities from "../pages/cities/page.jsx";
import Socities from "../pages/societies/page.jsx";
import Localities from "../pages/localities/page.jsx";
import BHk from "../pages/bhk/page.jsx";
import AddEditOwner from "../pages/owners/AddEditOwners.jsx";
import AdminList from "../pages/admin/page.jsx";
import PermissionList from "../pages/permissions/page.jsx";
import AddEditAdmin from "../pages/admin/AddEditAdmin.jsx";
import ViewProperty from "../pages/post-property/view/page.jsx";
import AboutUSConfiguration from "../pages/masterConfiguration/index.jsx";
import PropertyPhotoType from "../pages/propertyPhotoType/index.jsx";

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
          { path: '/properties/view/:propertyId', element: <ViewProperty /> },
          { path: '/channel-partners', element: <ChannelPartnerListing /> },
          { path: '/channel-partners/edit/:id', element: <AddEditChannelPartner /> },
          { path: '/channel-partners/code', element: <ChannelPartnerCode /> },
          { path: '/channel-partners/code/add', element: <AddEditChannelPartnerCodes /> },
          { path: '/channel-partners/code/edit/:id', element: <AddEditChannelPartnerCodes /> },
          { path: '/owners', element: <OwnersListingPage /> },
          { path: '/owners/edit/:id', element: <AddEditOwner /> },
          { path: '/admins', element: <AdminList /> },
          { path: '/admins/add', element: <AddEditAdmin /> },
          { path: '/permissions', element: <PermissionList /> },
          { path: '/permissions/add', element: <AddEditOwner /> },
          { path: '/amenities', element: <Amenities /> },
          { path: '/furnishing', element: <Furnishing /> },
          { path: '/cities', element: <Cities /> },
          { path: '/socities', element: <Socities /> },
          { path: '/localities', element: <Localities /> },
          { path: '/bhk', element: <BHk /> },
          { path: '/aboutus-configuration', element: <AboutUSConfiguration /> },
          { path: '/property-photo-type', element: <PropertyPhotoType /> },
        ],
      },
    ],
  },
]);
