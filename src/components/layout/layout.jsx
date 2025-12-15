import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="pr-6 pl-3 py-6 w-full h-full ">
        <div className="flex flex-col flex-1 bg-white h-full rounded-2xl shadow-xl">
            <header className="p-5 flex items-center justify-end">
            <div className="flex items-center gap-3">
                <img
                src="https://i.pravatar.cc/40"
                alt="User"
                className="w-10 h-10 rounded-full border"
                />
            </div>
            </header>

            <main className="pr-6 overflow-y-auto flex-1">
            <Outlet />
            </main>
        </div>
      </div>
    </div>
  );
}
