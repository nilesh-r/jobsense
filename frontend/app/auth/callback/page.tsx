"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuth, User } from "@/lib/auth";


function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      try {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const error = url.searchParams.get("error");

        // Google se error ya token missing
        if (error || !token) {
          router.replace("/login");
          return;
        }

        
        const payload = parseJwt(token);
        if (!payload || !payload.userId || !payload.email || !payload.role) {
          console.error("Invalid JWT payload:", payload);
          router.replace("/login");
          return;
        }

        const user: User = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          
          name:
            payload.name ||
            (typeof payload.email === "string"
              ? payload.email.split("@")[0]
              : "User"),
        };

        
        setAuth(token, user);

      
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


