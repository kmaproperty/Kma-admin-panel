import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { navLinks } from "./sidebarLinks";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenus, setOpenMenus] = useState({});

  const isChildActive = (children) => {
    return children?.some((child) => pathname.startsWith(child.path));
  };

  // Auto open menus when on a child route
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

    if (!hasChildren) return; // no children → nothing to open

    // ---- 1. Collapse all other menus ----
    const newState = {};
    newState[link.name] = !openMenus[link.name];

    setOpenMenus(newState);

    // ---- 2. Navigate to first child if opening ----
    if (!openMenus[link.name]) {
      const firstChild = link.children[0];
      if (firstChild?.path) {
        navigate(firstChild.path);
      }
    }
  };

  return (
    <div className="w-76 px-5 py-8 h-full flex flex-col bg-gray-900">
      <div className="text-2xl font-bold">
        <img src="/assets/KMALogo.svg" alt="logo" className="w-26" />
      </div>

      <p className="text-gray-500 text-xs mt-8 font-bold uppercase">Menu</p>

      <nav className="flex-1 py-4 space-y-3">
        {navLinks.map((link) => {
          const hasChildren = Array.isArray(link.children);
          const activeParent = hasChildren && isChildActive(link.children);

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

                  {/* Parent with direct route */}
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
                    {openMenus[link.name] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                )}
              </div>

              {/* Children Dropdown */}
              {hasChildren && openMenus[link.name] && (
                <div className="ml-9 mt-1 space-y-1">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2 py-1.5 rounded text-[15px] transition
                        ${
                          isActive
                            ? "text-white"
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
  );
}
