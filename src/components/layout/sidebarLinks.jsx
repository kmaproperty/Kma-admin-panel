import { Binary, Building, ChartArea, CircleUserRound, Gauge, Cog , Logs, Users, UserStar, BookUser, MessageSquare, Star, Info, User  } from "lucide-react";

export const navLinks = [
    {
        name: "Dashboard",
        path: "/",
        icon: <Gauge className="w-5 h-5" />,
        children: [
            { name: "Analytics", path: "/", icon: <ChartArea className="w-5 h-5" /> },
        ],
    },
    {
        name: "Property",
        path: "/properties",
        icon: <Building className="w-5 h-5" />,
        children: [
            { name: "Properties List", path: "/properties", icon: <Logs className="w-5 h-5" /> },
            { name: "Verify Properties List", path: "/verify-property", icon: <Logs className="w-5 h-5" /> },
            { name: "Amenities List", path: "/amenities", icon: <Logs className="w-5 h-5" /> },
            { name: "Furnishing List", path: "/furnishing", icon: <Logs className="w-5 h-5" /> },
            { name: "Cities List", path: "/cities", icon: <Logs className="w-5 h-5" /> },
            { name: "Socities List", path: "/socities", icon: <Logs className="w-5 h-5" /> },
            { name: "Localities List", path: "/localities", icon: <Logs className="w-5 h-5" /> },
            { name: "BHK List", path: "/bhk", icon: <Logs className="w-5 h-5" /> },
            { name: "Property Photo/Video Type List", path: "/property-photo-type", icon: <Logs className="w-5 h-5" /> },
        ],
    },
    {
        name: "Channel Partners",
        path: "/channel-partners",
        icon: <UserStar className="w-5 h-5" />,
        children: [
            { name: "List", path: "/channel-partners", icon: <Logs className="w-5 h-5" /> },
            { name: "Code", path: "/channel-partners/code", icon: <Binary className="w-5 h-5" /> },
        ],
    },
    {
        name: "Owners",
        path: "/owners",
        icon: <CircleUserRound className="w-5 h-5" />,
        children: [
            { name: "List", path: "/owners", icon: <Logs className="w-5 h-5" /> },
        ],
    },
    {
        name: "Customers",
        path: "/customers",
        icon: <User className="w-5 h-5" />,
        children: [
            { name: "List", path: "/customers", icon: <Logs className="w-5 h-5" /> },
        ],
    },
    {
        name: "User Management",
        path: "/user-management",
        icon: <Users className="w-5 h-5" />,
        children: [
            { name: "Admin List", path: "/admins", icon: <Logs className="w-5 h-5" /> },
            { name: "Permission List", path: "/permissions", icon: <Logs className="w-5 h-5" /> },
        ],
    },

    {
        name: "Top Properties",
        path: "/top-properties",
        icon: <Star className="w-5 h-5" />,
        children: [
            { name: "Manage Top Properties", path: "/top-properties", icon: <Star className="w-5 h-5" /> },
            { name: "Featured Properties", path: "/featured-properties", icon: <Star className="w-5 h-5" /> },
        ],
    },
    {
        name: "About Us",
        path: "/about-us",
        icon: <Info className="w-5 h-5" />,
        children: [
            { name: "About Us Content", path: "/about-us", icon: <Info className="w-5 h-5" /> },
        ],
    },
    {
        name: "Queries",
        path: "/contact-us",
        icon: <MessageSquare className="w-5 h-5" />,
        children: [
            { name: "Contact Us Queries", path: "/contact-us", icon: <Logs className="w-5 h-5" /> },
        ],
    },
    {
        name: "Master Configuration",
        path: "/aboutus-configuration",
        icon: <Cog className="w-5 h-5" />,
        children: [
            { name: "About us Configuraiton", path: "/aboutus-configuration", icon: <BookUser  className="w-5 h-5" /> },
        ],
    },
]