"use client";
import { usePathname } from "next/navigation";
import FanHeader from "./FanHeader";
import FanFooter from "./FanFooter";

const standalonePaths = [
  "/",
  "/command-center",
  "/stadium",
  "/street-map",
  "/crowd",
  "/hazard-drill",
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

  const isFanRoute = [
    "/fan",
    "/matches",
    "/match",
    "/checkout",
    "/ticket",
    "/journey-planner",
    "/hospitality-hub",
    "/crowd-flow",
    "/tourism",
  ].some((prefix) => path === prefix || path?.startsWith(prefix + "/"));

  if (isFanRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5] fan-site-frame">
        <FanHeader />
        <main className="flex-1">{children}</main>
        <FanFooter />
      </div>
    );
  }

  return children;
}
