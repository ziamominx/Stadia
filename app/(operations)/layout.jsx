import Shell from "@/components/operations/Shell";
import "./operations.css";
export const metadata = {
  title: "STADIA — Live Event Command",
  description:
    "Crowd intelligence, ground response, and transport coordination in one shared event command platform.",
};
export default function OperationsLayout({ children }) {
  return <Shell>{children}</Shell>;
}
