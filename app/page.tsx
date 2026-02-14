"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // ✅ Redirect to dashboard if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/dashboard"); // better than push
      }
    };

    checkUser();
  }, [router]);

  // ✅ Google Login
  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("Login error:", error.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={login}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Login with Google
      </button>
    </div>
  );
}
