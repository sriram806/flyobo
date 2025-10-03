"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/LoadingScreen/Loading";

export default function AdminProtected({ children }) {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace("/profile");
    }
  }, [user, router]);

  if (user === null || (user && user.role !== "admin")) {
    return <Loading />;
  }

  return children;
}
