# Bookmark Manager

## Tech Stack
- Next.js (App Router)
- Supabase (Auth, DB, Realtime)
- Tailwind CSS
- Vercel (Deployment)

## Features
- Google OAuth login
- Private bookmarks per user
- Add & Delete bookmarks
- Real-time updates
- Deployed on Vercel

## Problems Faced & Solutions

### 1. RLS Blocking Inserts
Problem: Insert failed due to Row Level Security.
Solution: Added correct INSERT policy using auth.uid().

### 2. Realtime Not Updating
Problem: Realtime events were not firing.
Solution: Enabled replication in Supabase database settings.

### 3. OAuth Redirect Not Working
Problem: Login redirected to localhost.
Solution: Added correct redirect URLs in Supabase & Google Console.

### 4. Environment Variables Missing on Vercel
Problem: App crashed after deploy.
Solution: Added NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel dashboard.

## Live URL
smart-bookmark-manager-mocha.vercel.app

## GitHub Repo
https://github.com/vamsi-273006/bookmark-manager
