"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuth, User } from "@/lib/auth";
import toast from "react-hot-toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://jobsense.onrender.com";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // ✅ Query params only on client
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const error = url.searchParams.get("error");

        if (error) {
          toast.error("Authentication failed from Google");
          router.push("/login");
          return;
        }

        if (!token) {
          toast.error("No token found in callback URL");
          router.push("/login");
          return;
        }

        // 🔐 Verify token with backend
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("GET /api/auth/me failed:", res.status, txt);

          if (res.status === 401) {
            toast.error("Invalid or expired token (401)");
          } else {
            toast.error("Failed to authenticate (server error)");
          }

          router.push("/login");
          return;
        }

        const data = await res.json();
        const apiUser = data.user;

        const user: User = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
        };

        setAuth(token, user);

        toast.success("Login successful!");
        router.push("/dashboard");
      } catch (err) {
        console.error("Auth callback error:", err);
        toast.error("Network error while authenticating");
        router.push("/login");
      }
    };

    run();
  }, [router]);

  return (
    <div className="crystal-bg min-h-screen flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
