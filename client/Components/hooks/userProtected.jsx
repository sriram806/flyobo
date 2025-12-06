"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "../LoadingScreen/Loading";

export default function UserProtected({ children }) {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
    }
  }, [user, router]);

  if (user === null) {
    return <Loading />;
  }

  return children;
}
