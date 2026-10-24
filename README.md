# Our world

A static React/Vite website with Supabase Auth and Postgres, plus a Supabase Edge Function for ImageKit media operations. There is no Express server or `server` folder.

## Configure once

1. Fill `.env` using `.env.example`. The Supabase public URL and publishable key are the only browser settings. Never put the login password, service-role key, ImageKit private key, or access token in a `VITE_` variable.
2. Add `LOGIN_EMAIL` and `LOGIN_PASSWORD` (meeting your Supabase password policy). Run `npm run account:setup` once to create the login account from those values. Later `.env` edits do not silently change the account password; use Supabase Auth to reset it.
3. In Supabase Authentication settings, disable **Allow new users to sign up**. Only invited or administratively created users should access this private archive.
4. Add ImageKit public/private keys and a Supabase personal access token from https://supabase.com/dashboard/account/tokens. Run `npm run cloud:deploy`. This applies the database schema and deploys the `media` Edge Function. It can be rerun safely.
5. Run `npm run dev`. Open http://localhost:5173/login. Existing sessions sign in automatically; use the gallery's sign-out button to end a session.

Instead of a personal access token, paste `supabase/migrations/202610230001_archive.sql` into the Supabase SQL editor, create the `media` Edge Function from `supabase/functions/media/index.ts`, and set its `IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY` secrets. Disable platform JWT verification for this function: it validates the bearer token itself using Supabase Auth, which supports publishable keys. The default Supabase service-role secret stays exclusively in the function environment.

## Daily use

Open Calendar to browse circular photo thumbnails. Populated dates are public; empty dates send signed-out visitors to login and return them to that day. Slide to Explore opens the main page. Upload multiple photos or videos, see per-file progress, open full-screen views, use arrow keys, play videos, mark favorites, select items, open/download originals, and permanently delete selected files. Failed files report their own errors without discarding successful uploads. The current upload limit is 100 MB per file, also subject to your ImageKit plan. Originals open in a new tab when the browser does not allow a cross-origin download.

Uploads go directly to ImageKit. The Edge Function verifies the actual ImageKit file and its account/date folder before saving its URL to Postgres. Anyone can view archived media without signing in. Row-level security restricts favorites and media changes to each owner. File URLs are ordinary ImageKit URLs: anyone with a URL can view it; private delivery with signed URLs would require additional ImageKit configuration.

Deletion first removes the file from ImageKit, then its database record. It is permanent, with a confirmation dialog; there is no recycle bin. A retry handles an already-deleted ImageKit file. If the database is temporarily unavailable after upload, save is retried three times and the file ID is shown for recovery. Favorites remain per account.

Existing MongoDB credentials are not used by this version. Existing MongoDB media is not automatically migrated.

## Build and host

`npm run build` produces `dist/`. Host it on a static host with an SPA fallback to `index.html` (for example, Netlify using the included `_redirects`). Add the two `VITE_SUPABASE_*` build environment variables to the host. Private settings belong only in local setup or Supabase function secrets. `npm run test:cloud` uploads and deletes a tiny test photo while checking public viewing and authenticated editing. `npm test` checks the shared date validation, map memories, and metadata helpers.

The cinematic login includes Google OAuth, password reset, and signup controls. Google must be enabled in Supabase Auth with your Google credentials. Add your deployed `/login` and `/login?reset=1` URLs to the Supabase redirect allowlist for OAuth and password reset. Signup availability follows your Supabase Auth settings.

## Impressions

`/impressions` is a full-screen dark messenger using the site's Satoshi font. Visitors can read the fictional chats. Any signed-in archive account can add/edit contacts, upload/change/remove their profile pictures, send messages as You or any contact, edit message text and sender, and delete any mock message. This is a shared fictional archive, not private person-to-person messaging. All changes persist to Supabase; profile pictures upload to ImageKit through authenticated signing and verification. Deleting a contact deletes that conversation's messages, while other conversations retain messages from that contact marked as a deleted contact. The original five chats seed only once; deploying again does not recreate deleted messages or contacts. Run `npm run test:impressions` for the live CRUD/profile smoke test, which cleans up its temporary contact and media.
