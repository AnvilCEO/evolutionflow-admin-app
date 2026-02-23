import { Metadata } from "next";
import AdminRequestsClient from "./AdminRequestsClient";

export const metadata: Metadata = {
  title: "Request Management | Admin | Evolutionflow",
};

export default function AdminRequestsPage() {
  return <AdminRequestsClient />;
}
