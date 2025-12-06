"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import { setAuthUser } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../LoadingScreen/Loading";

const AuthLoader = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const loadUser = async () => {
    try {
      if (!API_URL) {
        dispatch(setAuthUser(null));
        return;
      }

      const res = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
        timeout: 10000,
      });

      if (res?.data?.success && res?.data?.user) {
        dispatch(setAuthUser(res.data.user));
      } else {
        dispatch(setAuthUser(null));
      }
    } catch {
      dispatch(setAuthUser(null));
    }
  };

  useEffect(() => {
    if (!user) {
      loadUser().finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [user]);

  return checking ? <Loading /> : children;
};

export default AuthLoader;
