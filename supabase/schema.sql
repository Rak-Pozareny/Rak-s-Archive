-- Engineering Archive — Supabase schema
--
-- Run this once in your Supabase project's SQL Editor
-- (Project → SQL Editor → New query → paste this whole file → Run).
--
-- What this sets up:
--   - a `posts` table and a single-row `site_settings` table
--   - Row Level Security so ANYONE can read (the public archive),
--     but only a signed-in (authenticated) user can write — enforced by
--     Postgres itself, not by anything in the frontend code
--   - five demo posts so the site isn't empty on first load
--
-- After running this, create your one admin account:
--   Authentication → Users → Add user (email + password) in the
--   Supabase dashboard. Then also go to Authentication → Providers →
--   Email and turn OFF "Allow new users to sign up" so nobody else can
--   ever create an account that would also get write access.

create table if not exists posts (
  id text primary key,
  project_number integer not null default 0,
  revision text not null default 'REV. 01',
  title text not null,
  date text not null,
  category text not null,
  excerpt text not null default '',
  content text not null default '',
  featured_image jsonb,
  images jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  project_status text not null default 'active',
  is_demo boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id text primary key,
  data jsonb not null
);

alter table posts enable row level security;
alter table site_settings enable row level security;

-- Public (anonymous) read access — this is what makes the archive visible
-- to every visitor without them needing an account.
drop policy if exists "public read posts" on posts;
create policy "public read posts" on posts
  for select using (true);

drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings
  for select using (true);

-- Writes require a signed-in user. Combined with disabling public sign-up
-- (see note above), this means only your one admin account can write.
drop policy if exists "authenticated write posts" on posts;
create policy "authenticated write posts" on posts
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated write settings" on site_settings;
create policy "authenticated write settings" on site_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Default site settings (matches src/types.ts DEFAULT_SETTINGS).
insert into site_settings (id, data) values (
  'singleton',
  '{
    "siteName": "Your Name",
    "tagline": "Engineering projects, experiments, and things I build.",
    "archiveLabel": "PERSONAL ENGINEERING ARCHIVE",
    "background": {
      "mode": "blueprint",
      "solidColor": "#F2EFE7",
      "gradientFrom": "#F2EFE7",
      "gradientTo": "#E8E3D6",
      "imagePosition": "center",
      "imageSize": "cover",
      "imageOpacity": 1,
      "overlayOpacity": 0.85
    },
    "music": { "enabled": false, "defaultVolume": 0.2 },
    "categories": [
      "Hardware", "Software", "Mechanical", "Electronics", "Engineering",
      "Experiments", "Research", "Design", "Programming", "Other"
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- Demo/seed posts — clearly labeled, safe to edit or delete from the
-- admin dashboard once you're signed in.
insert into posts (id, project_number, revision, title, date, category, excerpt, content, images, tags, project_status, is_demo, order_index)
values
(
  'seed-001', 1, 'REV. 01',
  'First Entry — Why This Archive Exists',
  '2026-06-01', 'Other',
  'DEMO PROJECT — Placeholder log explaining the purpose of the archive. Replace with your own write-up.',
  $$**DEMO PROJECT.** This is the first placeholder entry — a good place for a short note on why you started keeping this log.

This is a working archive of things built, taken apart, and occasionally set on fire. Some entries will be finished projects; most won't be. That's on purpose — the failures are usually the more useful notes.$$,
  '[]'::jsonb, '["meta"]'::jsonb, 'completed', true, 1
),
(
  'seed-002', 2, 'REV. 02',
  'Building a Minimal Init System, Just to Understand One',
  '2026-06-30', 'Software',
  'DEMO PROJECT — Placeholder log for a systems-programming exercise. Replace with your own write-up.',
  $$**DEMO PROJECT.** Placeholder entry for a software / systems log.

Why you wanted to write this from scratch instead of reading about it.

```c
int main(void) {
    // fork the first user-space process
    return 0;
}
```

## What broke first

Be specific about the first wall you hit and how you diagnosed it.

## What you'd change

A short, honest retrospective.$$,
  '[]'::jsonb, '["linux", "systems", "c"]'::jsonb, 'archived', true, 2
),
(
  'seed-003', 3, 'REV. 01',
  'Small Mechanical Linkage Experiment',
  '2026-07-14', 'Mechanical',
  'DEMO PROJECT — Placeholder log for a mechanical prototyping session. Replace with your own write-up.',
  $$**DEMO PROJECT.** Placeholder entry for a mechanical engineering log.

What you were trying to test — a linkage geometry, a tolerance stack-up, a material choice — and why it mattered.

## Iteration 1

Describe the first print or build, what failed, and what you measured.

## Iteration 2

Describe the fix and whether it worked.

TEST RESULT / PASS

## Notes for next time

Keep this section short and specific — it's for future-you, not a reader.$$,
  '[]'::jsonb, '["mechanical", "prototyping"]'::jsonb, 'completed', true, 3
),
(
  'seed-004', 4, 'REV. 03',
  'Custom Single-Board Computer — Layout Notes',
  '2026-08-02', 'Electronics',
  'DEMO PROJECT — Placeholder log for a PCB design pass. Replace with your own write-up.',
  $$**DEMO PROJECT.** Placeholder entry demonstrating a PCB / electronics-style log.

Introductory paragraph: what the board needs to do, the constraints you're working under (size, power budget, parts on hand).

## Schematic

Describe the main blocks: power regulation, MCU, I/O headers, any protection circuitry.

FIG. 02 — POWER STAGE

## Layout

Notes on stack-up, trace widths for the power rails, and any routing compromises.

TEST RESULT / PENDING

## Open questions

- Confirm decoupling placement near the MCU
- Verify thermal relief on the ground pour
- Order a small first batch before committing to a full run$$,
  '[]'::jsonb, '["pcb", "electronics", "layout"]'::jsonb, 'active', true, 4
),
(
  'seed-005', 5, 'REV. 01',
  'Reworking a Salvaged Phone Board as a Standalone Linux Node',
  '2026-08-20', 'Hardware',
  'DEMO PROJECT — Placeholder log for a hardware teardown and rebuild. Replace with your own write-up.',
  $$**DEMO PROJECT.** This is placeholder text so you can see how a long-form entry renders — swap it out from the admin dashboard.

A short paragraph introducing the motivation for the project goes here: what broke, what you wanted to learn, and why you picked this board specifically.

## Teardown

Notes on disassembly, what you found underneath the shielding, and which components were still viable.

- Battery: removed, tested separately
- Board revision: unknown until confirmed against schematics
- Connector: nonstandard pitch, required an adapter

## Bring-up

Describe how you got a serial console attached, what bootloader was present, and what you had to patch to get further.

```
picocom -b 115200 /dev/ttyUSB0
```

FIELD NOTE — record any measurement or voltage rail check here.

## Result

Summarize where the project stands and what the next revision will attempt.$$,
  '[]'::jsonb, '["reverse-engineering", "linux", "salvage"]'::jsonb, 'experiment', true, 5
)
on conflict (id) do nothing;
