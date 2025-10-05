"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Landing from "./landing/page";
import { PageLoader } from "@/components";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <PageLoader />;
  }

  if (currentUser) {
    return null;
  }

  return <Landing />;
}
