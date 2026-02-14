"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={login}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>
    </div>
  );
}
