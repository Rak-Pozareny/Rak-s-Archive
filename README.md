# Engineering Archive — Personal Portfolio Site

**[Live site →https://rak-pozareny.github.io/Rak-s-Archive/ ](https://rak-pozareny.github.io/Rak-s-Archive/)**
_(fill in your actual username/repo once pushed — see "Deploying" below)_

A journal-style engineering portfolio: a scrollable public archive of project
logs, plus a hidden admin mode for writing and managing posts. Built with
React, TypeScript, Vite, and Tailwind CSS. When connected to Supabase (see
below), content is shared and permanent — admin edits are visible to every
visitor and survive restarts, redeploys, and different devices.

---

## 0. Deploying — GitHub Pages (featured directly on your GitHub account)

This repo includes a GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`) that builds and publishes the site
to **GitHub Pages** automatically every time you push to `main`. Unlike an
external host, this makes the live site part of your GitHub account
itself: it shows up right on the repo page under **Environments** (with a
"View deployment" link and a green checkmark on every commit), and it's
reachable at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

**One-time setup, after you've pushed this repo to GitHub:**

1. On the repo page, go to **Settings → Pages**.
2. Under "Build and deployment," set **Source** to **GitHub Actions**.
   (You don't need to pick a branch/folder — the workflow handles that.)
3. If you've set up Supabase for shared/permanent content (section 1
   below), go to **Settings → Secrets and variables → Actions** and add
   these repository secrets so the live build can use them:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`

   (Skip this if you're staying in local mode — the site still builds and
   deploys fine without them, just without shared content. If you want a
   working admin login in local mode on the deployed site, also add
   `VITE_ADMIN_PASSWORD_HASH` from `scripts/hash-password.mjs` as a
   secret — remember local mode still isn't shared between visitors,
   Supabase is what fixes that.)
4. Push to `main` (or go to the **Actions** tab and run the "Deploy to
   GitHub Pages" workflow manually). Watch it run under the **Actions**
   tab — it takes a minute or two.
5. Once it finishes, your repo page will show a **github-pages**
   environment on the right sidebar with a link to the live site:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.
6. Update the "Live site" link at the top of this README with your real
   URL.

Every future push to `main` redeploys automatically — editing a post from
the admin dashboard doesn't require a redeploy (that's what shared mode
in section 1 is for), but code/content changes you make in the repo
itself will go live within a minute or two of pushing.

**Alternative hosts:** Vercel and Netlify also work if you'd rather not
use GitHub Pages — see section 0a below. Either way, get the repo itself
looking good first:

- On the repo's GitHub page, click the gear icon next to "About" and add a
  short description and your live URL — that's what shows up under the
  repo name everywhere on GitHub.
- Add a few topics there too (e.g. `react`, `typescript`, `portfolio`,
  `engineering`) so it's easy to identify at a glance.
- From your GitHub profile page, click **Customize your pins** and pin
  this repo so it's one of the first things visitors see.
- A repo "social preview" image (Settings → General → Social preview)
  shows up when the link is shared elsewhere — a screenshot of the
  homepage works well; you can add one anytime after deploying.

---

## 0a. Alternative: Vercel or Netlify

Both are free and both auto-detect this as a Vite project — no config
needed for Vercel, and a `netlify.toml` is already included for Netlify.
Use this instead of GitHub Pages if you'd rather have a `.vercel.app` /
`.netlify.app` URL (or your own custom domain) — the trade-off is the
deployment lives on that platform's dashboard rather than inside GitHub
itself.

1. Push this repo to GitHub first.
2. Set up Supabase (section 1 below) if you want shared/permanent content.
3. Go to [vercel.com/new](https://vercel.com/new) or
   [app.netlify.com/start](https://app.netlify.com/start), import this
   repo, leave build settings as detected (`npm run build`, output
   directory `dist`).
4. Add the same environment variables as step 3 above, in the host's
   project settings this time instead of GitHub secrets.
5. Deploy.

---

## 1. Shared, permanent content (Supabase)

By default, without this step, the site works in **local mode**: content
lives in your browser's IndexedDB, which means only you see your own
edits, and only on the device/browser you made them on. Setting up
Supabase switches the site to **shared mode**: everyone who visits sees
the same content, and it's permanent — stored in a real database, not a
browser.

Supabase is free for a project this size (500MB database, more than
enough for text + a reasonable number of photos) and needs no server of
your own to run.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor → New query**, paste in
   the entire contents of `supabase/schema.sql` from this repo, and run
   it. This creates the tables, sets up permissions (Row Level
   Security — public can read, only a signed-in user can write), and adds
   the demo posts.
3. Go to **Authentication → Providers → Email** and turn **off** "Allow
   new users to sign up." This matters: without it, anyone who found the
   sign-up form could create an account and get write access.
4. Go to **Authentication → Users → Add user**, and create your one admin
   account with an email and a real password (a long passphrase, not a
   short PIN — this is now checked by Supabase's servers, not the
   browser, but it's still the only thing standing between the public and
   your content).
5. Go to **Settings → API** and copy the **Project URL** and the
   **anon public key**.
6. Create a `.env.local` file in the project root (there's an
   `.env.example` showing the shape) with:

   ```
   VITE_SUPABASE_URL=your project URL
   VITE_SUPABASE_ANON_KEY=your anon public key
   VITE_ADMIN_EMAIL=the email you used in step 4
   ```

7. Restart `npm run dev`. The admin dashboard header will now say
   **"Shared mode"** instead of "Local mode."

The hidden unlock flow doesn't change: click somewhere that isn't a text
field, type your password, press Enter. What happens behind it is
different now — it's a real, server-checked login (Supabase
`signInWithPassword`), not a comparison happening in your browser. Log Out
now ends that real session too.

If you skip this step, the site still works — it just stays in local
mode, and the admin dashboard will clearly say so.

---

## 2. Setup

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
cd engineering-archive-portfolio
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). You'll see the
public archive pre-populated with clearly-labeled **DEMO PROJECT** entries —
replace these with your own from the admin dashboard once you're signed in.

In local mode, `src/data/seedPosts.ts` plus the **Reset demo content**
button in the admin Posts tab control the demo content. In shared mode,
the demo posts come from `supabase/schema.sql` instead, and "Reset demo
content" is intentionally disabled — see section 4.

To build for deployment:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

`npm run build` outputs static files to `dist/` — this is a fully static
site, so it can be hosted on Vercel, Netlify, GitHub Pages, Cloudflare
Pages, or any static file host.

---

## 3. Entering admin mode

There is no visible admin button anywhere on the public site — that's
intentional. To unlock it:

1. Click anywhere on the page that isn't a text field (so your keystrokes
   aren't captured by a form).
2. Type your admin password.
3. Press **Enter**.

You'll see a brief "ADMIN MODE" confirmation, and the site switches to the
admin dashboard, which tells you right away whether you're in shared or
local mode. Click **Log Out** (top right) to return to the public view.

**If you've set up Supabase (section 1):** the password is checked by
Supabase's servers. This is genuine authentication — nobody can bypass it
by reading the JavaScript bundle or poking at browser storage, because the
database itself refuses writes from anyone who isn't signed in as your
admin account. Wrong attempts still trigger a 30-second client-side
lockout after 5 tries, as a courtesy, but the real protection is
server-side.

**If you haven't set up Supabase:** the site falls back to comparing a
SHA-256 hash of what you type against `VITE_ADMIN_PASSWORD_HASH` — all
client-side. Generate one with:

```bash
node scripts/hash-password.mjs "a long passphrase, not a 6-digit PIN"
```

and put the printed line in `.env.local`. **This local-mode gate is not
real security** — the hash it checks against ships in the public JS
bundle, so a technical, patient attacker could eventually brute-force a
weak password offline, with no lockout slowing them down (only guesses
typed into the live page are rate-limited). It only ever raises the cost
of an attack, not eliminates it. Setting up Supabase (section 1) is what
actually fixes this, and gets you shared/permanent content in the same
step.

---

## 4. What's in the admin dashboard

- **Posts** — create, edit, duplicate, delete, and reorder entries (up/down
  arrows). Each post has a title, date, category, tags, status, a
  short excerpt, and a Markdown body with a small formatting toolbar and a
  live preview toggle.
- **Images** — upload JPG/PNG/WebP per post, with drag-free reorder
  (◀ ▶ buttons), captions, a featured-image picker, and automatic
  client-side resizing so the public site doesn't ship full camera-original
  files.
- **Appearance** — site name, tagline, archive label, and background
  (blueprint grid, paper texture, solid color, gradient, or a custom
  uploaded image with position/size/overlay-opacity controls so text stays
  readable).
- **Music** — upload a background track, enable/disable it, and set a
  default (capped) volume. The public mute/unmute button lives in the
  top-left corner and remembers a visitor's preference. Because browsers
  block autoplay-with-sound, playback only begins after a visitor's first
  interaction with the page — this is standard browser behavior, not a bug.
- **Categories** — add or remove the categories used for filtering and
  tagging posts.
- **Reset demo content** — only shown in local mode. In shared mode it's
  hidden on purpose: a "wipe everyone's content back to demo posts" button
  is too dangerous once real visitors depend on that data. Manage seed
  content directly in Supabase's table editor if you ever need to.

---

## 5. Architecture notes

- **Content abstraction** — all reads/writes go through the
  `ContentRepository` interface (`src/repository/ContentRepository.ts`).
  `src/repository/index.ts` picks between two implementations
  automatically: `SupabaseRepository.ts` (shared mode, when Supabase env
  vars are set) or `IndexedDBRepository.ts` (local mode, the fallback).
  Nothing else in the app needs to know which one is active.
- **Auth abstraction** — `useAdminAuth.ts` similarly branches on whether
  Supabase is configured: a real `signInWithPassword` call in shared mode,
  a client-side hash comparison in local mode. Both share the same hidden
  keyboard-entry UX.
- **Row Level Security** — in shared mode, the actual write protection
  lives in Postgres (`supabase/schema.sql`), not in the frontend. Public
  read access, authenticated-only writes. This is what makes shared mode
  genuinely secure in a way local mode structurally can't be.
- **Sanitization** — post bodies are authored in Markdown and converted to
  HTML with `marked`, then passed through `DOMPurify` before being
  rendered, with an explicit allow-list of tags/attributes
  (`src/utils/sanitize.ts`). This blocks script injection via post content.
- **Images/audio** — uploads are validated by MIME type and size before
  being read as data URLs; images are also downscaled on a canvas before
  storage. In both modes, images are currently stored inline (as base64)
  rather than in dedicated object storage — see section 6.
- **Reduced motion** — animations are minimal (a subtle entry fade) and
  disabled globally when the visitor has `prefers-reduced-motion` set.

---

## 6. What's still worth upgrading

Shared mode (section 1) solves the two big things a static prototype
can't: content synced across visitors, and a password check that can't be
bypassed client-side. A couple of smaller things are still simplified for
a personal project:

- **Images are stored as base64 inside the database/IndexedDB row**,
  rather than in dedicated object storage (e.g. Supabase Storage,
  Cloudflare R2, S3) behind a CDN. Fine for a personal portfolio's worth
  of photos; if you start uploading a lot of large, high-resolution
  images, moving to object storage would keep pages loading fast and
  database rows small. This would mean adding upload calls to Supabase
  Storage in `ImageUploader.tsx` and storing the resulting URL instead of
  a data URL — the rest of the app doesn't care where the URL points.
- **Music files** are handled the same way and would benefit from the
  same change if you use a large track.

None of this requires rewriting the UI — it's the point of the
`ContentRepository` abstraction.

---

## 7. Manual test checklist

Before publishing, it's worth walking through:

- [ ] Create a post, add images, set a featured image, publish
- [ ] Open the site in a different browser (or ask a friend to load the
      URL) and confirm the same post shows up — this is the real test of
      shared mode
- [ ] Edit an existing post and confirm changes persist after a refresh
      and after a full redeploy
- [ ] Delete a post (with confirm step) and duplicate a post
- [ ] Reorder posts and confirm the public order updates
- [ ] Upload a background image and check overlay opacity keeps text readable
- [ ] Upload a music track, enable it, confirm the mute button appears and
      remembers its state after a refresh
- [ ] Type the hidden password + Enter to unlock admin mode, and confirm an
      incorrect sequence does nothing
- [ ] Type 5 wrong passwords in a row and confirm the page ignores further
      attempts for ~30 seconds (the lockout)
- [ ] Log out and confirm admin controls disappear from the public view,
      and (in shared mode) that a refresh doesn't silently log you back in
- [ ] In Supabase, confirm "Allow new users to sign up" is off
- [ ] Delete all posts and confirm the "ARCHIVE EMPTY" state appears
- [ ] Check the site on a small mobile viewport and a wide desktop viewport
- [ ] Tab through the page with a keyboard only and confirm focus is always
      visible
- [ ] Enable "reduce motion" in your OS accessibility settings and confirm
      animations stop
