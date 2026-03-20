import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { navLinks } from "./sidebarLinks";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import Button from '@mui/material/Button';

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenus, setOpenMenus] = useState({});

  // Helper to determine if a parent should be expanded based on URL
  const isChildActive = (children) => {
    return children?.some((child) => {
      // If the child path is just "/", only return true if the pathname is exactly "/"
      if (child.path === "/") {
        return pathname === "/";
      }
      // Otherwise, check if the current URL starts with the child path
      // This ensures /property/details matches /property
      console.log(child)
      return pathname.startsWith(child.path);
    });
  };

  // Auto open/close menus when the URL changes
  useEffect(() => {
    const state = {};
    navLinks.forEach((link) => {
      if (link.children && isChildActive(link.children)) {
        state[link.name] = true;
      }
    });
    setOpenMenus(state);
  }, [pathname]);

  const handleParentClick = (link) => {
    const hasChildren = Array.isArray(link.children);
    if (!hasChildren) return;

    const isCurrentlyOpen = !!openMenus[link.name];

    // Toggle logic: Close others, toggle current
    const newState = {
      [link.name]: !isCurrentlyOpen,
    };
    setOpenMenus(newState);

    // Navigation logic: If opening a menu, jump to its first child
    if (!isCurrentlyOpen) {
      const firstChild = link.children[0];
      if (firstChild?.path) {
        navigate(firstChild.path);
      }
    }
  };

  const logout = () => {
    navigate("/sign-in");
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
  };

  return (
    <div className="w-76 pl-5 pr-2 py-8 flex flex-col bg-gray-900 justify-between h-full gap-5 ">
      <div className="w-full flex flex-col max-h-full overflow-y-auto scroll">
        <div className="text-2xl font-bold">
          <img src="/assets/KMALogo.svg" alt="logo" className="w-26" />
        </div>

        <p className="text-gray-500 text-xs mt-8 font-bold uppercase">Menu</p>

        <nav className="flex-1 py-4 space-y-3 pr-3">
          {navLinks.map((link) => {
            const hasChildren = Array.isArray(link.children);
            const activeParent = hasChildren && isChildActive(link.children);
            const isOpen = !!openMenus[link.name];

            return (
              <div key={link.name}>
                {/* Parent Row */}
                <div
                  onClick={() => handleParentClick(link)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded cursor-pointer
                    transition font-medium
                    ${
                      activeParent
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 text-[15px]">
                    {link.icon}

                    {/* Parent with direct route (No children) */}
                    {link.path && !hasChildren ? (
                      <NavLink
                        to={link.path}
                        className="flex items-center gap-2.5 text-[15px]"
                      >
                        {link.name}
                      </NavLink>
                    ) : (
                      <span>{link.name}</span>
                    )}
                  </div>

                  {/* Dropdown Arrow */}
                  {hasChildren && (
                    <span className="text-gray-400 text-[15px]">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>

                {/* Children Dropdown */}
                {hasChildren && isOpen && (
                  <div className="ml-9 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2 py-1.5 rounded text-[15px] transition
                          ${
                            isActive
                              ? "text-white font-semibold"
                              : "text-gray-400 hover:bg-gray-600"
                          }`
                        }
                      >
                        {child.icon}
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <button onClick={logout} className="bg-gray-700 cursor-pointer text-white w-full rounded-lg py-3 flex items-center justify-center gap-2 font-medium">
          <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  );
}