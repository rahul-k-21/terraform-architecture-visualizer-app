import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terraform Architecture Visualizer",
  description: "Analyze Terraform configuration and visualize infrastructure dependencies."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}