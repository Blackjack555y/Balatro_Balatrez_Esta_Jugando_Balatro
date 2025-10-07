# Copilot project instructions

This repo is an Expo (SDK 54) + React Native app using expo-router (v5) with a custom auth layer over Supabase (JS v2). Use these patterns to stay consistent and productive.

## Architecture and routing
- File-based routing under `app/` via expo-router. Root layout `app/_layout.tsx` wraps all screens with `AuthProvider` from `context/AuthContext.tsx`.
- Key screens: `app/index.tsx` (login + register UI), `app/home.tsx` (protected), `app/profile.tsx` (protected), `app/rules/*` (cards rules with `index.tsx` and suit screens).
- Navigation: import `useRouter` from `expo-router` and push string paths, e.g. `router.push("/rules/spades")`. Typed routes are enabled in `app.json` (`experiments.typedRoutes: true`).

## Auth and data model
- No Supabase Auth is used. Auth is custom:
  - `useAuth()` exposes `{ user, login(username, password), register(username, password, avatarUri?), logout }`.
  - Passwords are hashed client-side with `SHA256("username:password")` (see `AuthContext.tsx`).
  - Session persistence uses `AsyncStorage` key `userId`.
- Tables expected in Supabase:
  - `users(id:number, username:string, password_hash:string, created_at:timestamp)`.
  - `profiles(user_id:number, avatar_url?:string, nickname?:string, bio?:string, bones:number, games_played:number, games_won:number, high_score:number, created_at:timestamp)`.
- Always read/write via `supabase` client from `lib/supabase.ts`.

## Protected routes pattern
- Redirect unauthenticated users. Examples:
  - `app/home.tsx`: `useEffect(() => { if (!user) router.replace("/") }, [user])`.
  - `app/profile.tsx`: returns `<Redirect href="/" />` when `!user`.
  - Follow one of these patterns for new protected screens.

## Media and storage
- Avatar flows use Expo Image Picker/Manipulator and Supabase Storage.
  - `AuthContext.register(...)` optionally uploads to bucket `avatars/` and sets `profiles.avatar_url`.
  - `profile.tsx` provides `pickFromGallery`/`takePhoto` helpers and uploads to bucket `Avatars/`.
  - Bucket name mismatch: `"avatars"` (lowercase) vs `"Avatars"` (capital A). Standardize to one (prefer the existing bucket in your Supabase project) before adding code that depends on it.
- On web or simulators without camera, `takePhoto` falls back to gallery.

## Conventions and examples
- State: use `useAuth()` instead of calling `supabase.auth.*` (not used) or duplicating auth logic.
- Data access: prefer typed shapes from `AuthContext.tsx` for `User` and `Profile`. Profile lookups use numeric `user_id`.
- UI style: React Native `StyleSheet.create`, wood texture background (`assets/wood.jpg`), bold borders, and uppercase labels for consistency (see `home.tsx`, `index.tsx`).
- Assets: imported with `require("../assets/<file>")`. Keep relative paths consistent with screen location.
- TS config: strict mode; alias `@/*` maps to repo root (`tsconfig.json`).

## Developer workflows
- Install/run: `npm install`; `npm run start` (Metro + Expo DevTools), or `npm run android` / `ios` / `web`.
- Lint: `npm run lint` (uses `eslint-config-expo`). Fix issues before committing.
- Supabase setup: credentials live in `lib/supabase.ts` (URL/anon key). Coordinate changes—don’t inline different keys mid-file.

## Gotchas
- Don’t use `supabase.auth.getUser()`—there is no Supabase Auth session; rely on `AuthContext`.
- Ensure `user.id` is numeric where required (`profile.tsx` converts to number before queries).
- When adding new profile fields, update both `Profile` type and insert/update payloads in `AuthContext.register` and profile edit flows.

## Quick snippets
- Use auth in a screen:
  - `const { user, login, register, logout } = useAuth()`; check `user` to guard routes; call `router.replace("/")` if needed.
- Add a protected screen: create `app/xyz.tsx`, import `useAuth()` + `useRouter()`, gate on `user` as in `home.tsx`.

Feedback needed: confirm the canonical Storage bucket name ("avatars" vs "Avatars"), and the exact `profiles` schema (fields listed above derived from code). If these differ, I’ll update this doc.
