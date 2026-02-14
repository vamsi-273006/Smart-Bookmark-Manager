"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Check user session
  useEffect(() => {
    checkUser();
  }, []);
useEffect(() => {
  let channel: any;

  const setupRealtime = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Initial load
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);

    // Realtime subscription
    channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime:", payload);

          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as any, ...prev]);
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
  };

  setupRealtime();

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
    } else {
      fetchBookmarks();
      subscribeToRealtime();
    }

    setLoading(false);
  };

  // 🔹 Fetch bookmarks (RLS ensures only own data)
  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setBookmarks(data || []);
    }
  };

  // 🔹 Add bookmark
  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
    }
  };

  // 🔹 Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  // 🔹 Realtime subscription
  const subscribeToRealtime = () => {
    supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">

        <h1 className="text-2xl font-bold mb-4 text-center">
          My Bookmarks
        </h1>

        {/* 🔹 Add Bookmark Form */}
        <form onSubmit={addBookmark} className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Bookmark
          </button>
        </form>

        {/* 🔹 Bookmark List */}
        {bookmarks.length === 0 ? (
          <p className="text-gray-500 text-center">
            No bookmarks yet.
          </p>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <a
                  href={bookmark.url}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {bookmark.title}
                </a>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
