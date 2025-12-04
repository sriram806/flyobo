"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function AdminProtected({ children }) {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  return children;
}
