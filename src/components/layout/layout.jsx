import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="pr-5 pl-3 py-4 h-full " style={{width: "calc(100% - 304px)"}}>
        <div className="flex flex-col flex-1 bg-white h-full rounded-2xl overflow-hidden">
            <main className="pr-6 overflow-y-auto flex-1">
            <Outlet />
            </main>
        </div>
      </div>
    </div>
  );
}
