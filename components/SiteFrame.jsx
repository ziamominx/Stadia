"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
const standalonePaths = [
  "/",
  "/command-center",
  "/stadium",
  "/street-map",
  "/crowd",
  "/ground",
  "/transport",
  "/hospitality",
  "/incidents",
  "/event-control",
  "/setup",
  "/analytics",
  "/login",
];
export default function SiteFrame({ children }) {
  const path = usePathname();
  if (standalonePaths.includes(path)) return children;
  return (
    <div className={`flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]${path === "/fan" ? " fan-site-frame" : ""}`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
