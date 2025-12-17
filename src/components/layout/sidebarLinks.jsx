import { Building, ChartArea, Gauge, Home, Logs, UserStar } from "lucide-react";

export const navLinks = [
    {
        name: "Dashbaord",
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
            { name: "Emenities List", path: "/amenities", icon: <Logs className="w-5 h-5" /> },
            { name: "Furnishing List", path: "/furnishing", icon: <Logs className="w-5 h-5" /> },
            { name: "Cities List", path: "/cities", icon: <Logs className="w-5 h-5" /> },
            { name: "Socities List", path: "/socities", icon: <Logs className="w-5 h-5" /> },
            { name: "Localities List", path: "/localities", icon: <Logs className="w-5 h-5" /> },
        ],
    },
    {
        name: "Channel Partners",
        path: "/channel-partners",
        icon: <UserStar className="w-5 h-5" />,
        children: [
            { name: "Channel Partners List", path: "/channel-partners", icon: <Logs className="w-5 h-5" /> },
        ],
    },
]