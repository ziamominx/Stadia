"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
const operationPaths = [
  "/command-center",
  "/crowd",
  "/ground",
  "/transport",
  "/incidents",
  "/event-control",
  "/analytics",
];
export default function SiteFrame({ children }) {
  const path = usePathname();
  if (operationPaths.includes(path)) return children;
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
