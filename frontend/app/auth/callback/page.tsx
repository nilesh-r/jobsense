"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Minimal User type, independent of your lib/auth
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// BACKEND URL – yahi chal raha hai
const API_BASE = "https://jobsense.onrender.com";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // ✅ Only runs in browser, safe to use window
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const error = url.searchParams.get("error");

        // Google error or missing token → back to login
        if (error || !token) {
          router.replace("/login");
          return;
        }

        // Verify token with backend
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error(
            "GET /api/auth/me failed:",
            res.status,
            await res.text()
          );
          router.replace("/login");
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

        // Save to localStorage directly
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        router.replace("/dashboard");
      } catch (err) {
        console.error("Auth callback error:", err);
        router.replace("/login");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Completing authentication...</p>
    </div>
  );
}

