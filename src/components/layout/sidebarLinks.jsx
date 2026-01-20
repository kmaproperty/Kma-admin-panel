import { Binary, Building, ChartArea, CircleUserRound, Gauge, Cog , Logs, Users, UserStar, BookUser  } from "lucide-react";

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
            { name: "Amenities List", path: "/amenities", icon: <Logs className="w-5 h-5" /> },
            { name: "Furnishing List", path: "/furnishing", icon: <Logs className="w-5 h-5" /> },
            { name: "Cities List", path: "/cities", icon: <Logs className="w-5 h-5" /> },
            { name: "Socities List", path: "/socities", icon: <Logs className="w-5 h-5" /> },
            { name: "Localities List", path: "/localities", icon: <Logs className="w-5 h-5" /> },
            { name: "BHK List", path: "/bhk", icon: <Logs className="w-5 h-5" /> },
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
        name: "User Management",
        path: "/user-management",
        icon: <Users className="w-5 h-5" />,
        children: [
            { name: "Admin List", path: "/admins", icon: <Logs className="w-5 h-5" /> },
            { name: "Permission List", path: "/permissions", icon: <Logs className="w-5 h-5" /> },
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