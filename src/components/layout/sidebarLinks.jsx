import { Binary, Building, ChartArea, CircleUserRound, Gauge, Home, Logs, UserStar } from "lucide-react";

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
]