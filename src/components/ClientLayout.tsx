"use client";

import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/header";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { currentUser } = useAuth();

  return (
    <>
      <Header />
      <main className={`${currentUser && "pt-18"}`}>
        {children}
      </main>
    </>
  );
}
