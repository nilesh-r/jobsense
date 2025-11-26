"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Simple User type (same shape as frontend auth helper)
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// YOUR backend base URL
const API_BASE = "https://jobsense.onrender.com";

// Local copy of setAuth to avoid importing anything SSR-unsafe
const setAuth = (token: string, user: User) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Read query params from current URL
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const error = url.searchParams.get("error");

        // If Google sent error OR no token → back to login
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
          // Invalid / expired token or server error → back to login
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

        // Save auth in localStorage
        setAuth(token, user);

        // Go to main app
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

