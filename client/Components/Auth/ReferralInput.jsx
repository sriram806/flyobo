"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, Check } from "lucide-react";
import axios from "axios";

export default function ReferralInput({ onReferralChange, disabled = false }) {
  const [referralCode, setReferralCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const searchParams = useSearchParams();
  const timerRef = useRef(null);

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      const code = refParam.toUpperCase();
      setReferralCode(code);
      validateReferralCode(code);
    }
    return () => clearTimeout(timerRef.current);
  }, [searchParams]);

  const validateReferralCode = async (code) => {
    if (!code || code.length < 6) {
      setIsValid(null);
      if (onReferralChange) onReferralChange("");
      return;
    }

    const clientOk = /^FLY[A-Z0-9]{6}$/.test(code);
    if (!clientOk) {
      setIsValid(false);
      if (onReferralChange) onReferralChange("");
      return;
    }

    setIsValidating(true);
    setIsValid(null);
    try {
      const apiBase = (NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
      if (!apiBase) {
        setIsValid(true);
        if (onReferralChange) onReferralChange(code);
        return;
      }
      const url = `${apiBase}/referral/validate?code=${encodeURIComponent(code)}`;
      const { data } = await axios.get(url, { withCredentials: true, timeout: 10000 });
      const ok = !!data?.valid;
      setIsValid(ok);
      if (onReferralChange) onReferralChange(ok ? code : "");
    } catch {
      setIsValid(false);
      if (onReferralChange) onReferralChange("");
    } finally {
      setIsValidating(false);
    }
  };

  const handleReferralChange = (e) => {
    const code = e.target.value.toUpperCase().trim();
    setReferralCode(code);
    clearTimeout(timerRef.current);
    if (!code) {
      setIsValid(null);
      if (onReferralChange) onReferralChange("");
      return;
    }
    timerRef.current = setTimeout(() => validateReferralCode(code), 500);
  };

  return (
    <div className="space-y-2">
      <label className="text-[0.875rem] font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
        Referral Code <span className="font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Gift className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        <input
          type="text"
          value={referralCode}
          onChange={handleReferralChange}
          disabled={disabled}
          placeholder="Enter referral code (e.g., FLYABC123)"
          maxLength={9}
          className={`w-full pl-10 pr-10 py-3 rounded-lg border bg-transparent outline-none text-[0.95rem] transition-all duration-200
            ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70" : "focus:ring-2 focus:ring-sky-500 focus:border-sky-500"}
            ${isValid === true ? "border-green-500 bg-green-50 dark:bg-green-950/20" : isValid === false ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-gray-300 dark:border-gray-700"}
            text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isValidating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500" />
          ) : isValid === true ? (
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isValid === false ? (
            <div className="h-5 w-5 rounded-full border-2 border-red-500 flex items-center justify-center">
              <div className="w-2 h-0.5 bg-red-500" />
            </div>
          ) : null}
        </div>
      </div>

      {isValid === true && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
          <span>Valid referral code! You’ll get ₹50 bonus after signup.</span>
        </div>
      )}

      {isValid === false && referralCode.length > 0 && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          Invalid referral code format or code not found.
        </div>
      )}

      {referralCode.length === 0 && (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          Have a referral code? Enter it to get ₹50 signup bonus!
        </div>
      )}
    </div>
  );
}
