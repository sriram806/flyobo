"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "../LoadingScreen/Loading";
import toast from "react-hot-toast";

export default function AdminProtected({ children }) {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
      return;
    }
    if (user && user.role !== "manager") {
      router.replace("/profile?tab=overview");
      toast.error("You are not Allowed to this page!!!")
    }
  }, [user, router]);

  if (user === null || (user && user.role !== "manager")) {
    return <Loading />;
  }

  return children;
}
