"use client";
import { Bell, ChartSpline, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-0 shadow-md border-r p-4 pl-0">
      <div className="py-5">
        <ul className="flex flex-col  gap-3">
          <Link href="/mainteinance">
            <li
              className={`mb-2 flex items-center gap-2 duration-200 hover:translate-x-2  rounded-r-full pl-4 py-2.5 ${
                pathname === "/mainteinance" ? "bg-gray-300 translate-x-0!" : ""
              }`}
            >
              <ChartSpline />
              <span className=" font-medium">Dashboard</span>
            </li>
          </Link>
          <Link href="/mainteinance/alerts">
            <li
              className={`mb-2 flex items-center gap-2 duration-200 hover:translate-x-2  rounded-r-full pl-4 py-2.5 ${
                pathname === "/mainteinance/alerts" ? "bg-gray-300 translate-x-0!" : ""
              }`}
            >
              <Bell />
              <span className=" font-medium">Alerts</span>
            </li>
          </Link>
        </ul>
      </div>
    </aside>
  );
}
