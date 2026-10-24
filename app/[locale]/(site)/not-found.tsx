import type { Metadata } from "next";
import { WrongLane } from "@/components/shell/WrongLane";

export const metadata: Metadata = { title: "Wrong lane" };

export default function NotFound() {
  return <WrongLane />;
}
