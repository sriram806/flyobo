"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, Check } from "lucide-react";

const ReferralInput = ({ onReferralChange, disabled = false }) => {
  const [referralCode, setReferralCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for referral code in URL params
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
      validateReferralCode(refParam.toUpperCase());
    }
  }, [searchParams]);

  const validateReferralCode = async (code) => {
    if (!code || code.length < 6) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    try {
      // Simple validation - should start with FLY and be 9 characters
      const isValidFormat = /^FLY[A-Z0-9]{6}$/.test(code);
      setIsValid(isValidFormat);
      
      if (onReferralChange) {
        onReferralChange(isValidFormat ? code : "");
      }
    } catch (error) {
      setIsValid(false);
      if (onReferralChange) {
        onReferralChange("");
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleReferralChange = (e) => {
    const code = e.target.value.toUpperCase().trim();
    setReferralCode(code);
    
    if (code.length === 0) {
      setIsValid(null);
      if (onReferralChange) {
        onReferralChange("");
      }
      return;
    }

    // Debounce validation
    const timer = setTimeout(() => {
      validateReferralCode(code);
    }, 500);

    return () => clearTimeout(timer);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Referral Code (Optional)
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Gift className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={referralCode}
          onChange={handleReferralChange}
          disabled={disabled}
          placeholder="Enter referral code (e.g., FLYABC123)"
          maxLength={9}
          className={`w-full pl-10 pr-10 py-3 border rounded-lg bg-transparent outline-none transition-all ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
              : 'focus:ring-2 focus:ring-sky-500'
          } ${
            isValid === true 
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
              : isValid === false 
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
              : 'border-gray-300 dark:border-gray-700'
          }`}
        />
        
        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isValidating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500"></div>
          ) : isValid === true ? (
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isValid === false ? (
            <div className="h-5 w-5 rounded-full border-2 border-red-500 flex items-center justify-center">
              <div className="w-2 h-0.5 bg-red-500"></div>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Status Messages */}
      {isValid === true && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
          <span>Valid referral code! You'll get ₹50 bonus after signup</span>
        </div>
      )}
      
      {isValid === false && referralCode.length > 0 && (
        <div className="text-red-600 text-sm">
          Invalid referral code format. Should be 9 characters starting with FLY.
        </div>
      )}
      
      {referralCode.length === 0 && (
        <div className="text-gray-500 text-sm">
          Have a referral code? Enter it to get ₹50 signup bonus!
        </div>
      )}
    </div>
  );
};

export default ReferralInput;