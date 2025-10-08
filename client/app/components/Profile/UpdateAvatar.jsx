"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const UpdateAvatar = ({ avatarUrl = null, disabled = false, onChange, onRemove, label = "Profile photo" }) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((s) => s?.auth?.user);

    const diameterStyle = { width: 96, height: 96 };

    const handlePick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
            setError("Please select a JPG, PNG, WEBP, or GIF image.");
            return;
        }
        const maxBytes = 5 * 1024 * 1024;
        if (file.size > maxBytes) {
            setError("Image must be 5MB or smaller.");
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);
        onChange?.(file, url);
    };

    const handleRemove = () => {
        if (disabled) return;
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        onRemove?.();
    };

    const displayUrl = preview || avatarUrl || null;

    const fileToBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    const handleSubmit = async () => {
      try {
        if (disabled) return;
        const file = inputRef.current?.files?.[0];
        if (!file) {
          toast.error("Please choose an image first");
          return;
        }
        setUploading(true);
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          toast.error("API base URL is missing");
          return;
        }
        const avatarBase64 = await fileToBase64(file);
        const endpoint = `${API_URL}/user/profile-avatar`;
        const { data } = await axios.post(
          endpoint,
          { avatar: avatarBase64 },
          { withCredentials: true }
        );
        const updatedUser = data?.user || { ...user, avatar: data?.user?.avatar };
        if (updatedUser) {
          dispatch(setAuthUser(updatedUser));
        }
        toast.success(data?.message || "Profile picture updated");
        if (data?.user?.avatar?.url) {
          setPreview(data.user.avatar.url);
        }
      } catch (err) {
        console.error(err);
        const msg = err?.response?.data?.message || err?.message || "Failed to update avatar";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    };

    return (
        <div className="flex items-center gap-4">
            <div
                className="relative rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                style={diameterStyle}
            >
                {displayUrl ? (
                    <img
                        src={displayUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
                        IMG
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {label && (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePick}
                        disabled={disabled}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${disabled ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                    >
                        Choose Image
                    </button>
                    {displayUrl && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={disabled}
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 ${disabled ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                        >
                            Remove
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={disabled || uploading || !inputRef.current || !inputRef.current.files?.length}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm bg-sky-600 text-white hover:bg-sky-700 ${
                            disabled || uploading || !inputRef.current || !inputRef.current.files?.length ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                    >
                        {uploading ? "Saving..." : "Save"}
                    </button>
                </div>

                {error && (
                    <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-label="Upload avatar image"
                />
            </div>
        </div>
    );
};

export default UpdateAvatar;