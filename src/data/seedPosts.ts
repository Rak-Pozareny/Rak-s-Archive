import { Post } from "../types";

const now = new Date().toISOString();

/**
 * Placeholder / demo content only.
 * These are generic stand-ins so the archive isn't empty on first run —
 * replace them from the admin dashboard with real project logs.
 * None of the claims below are real accomplishments.
 */
export const seedPosts: Post[] = [
  {
    id: "seed-005",
    projectNumber: 5,
    revision: "REV. 01",
    title: "Reworking a Salvaged Phone Board as a Standalone Linux Node",
    date: "2026-08-20",
    category: "Hardware",
    excerpt:
      "DEMO PROJECT — Placeholder log for a hardware teardown and rebuild. Replace with your own write-up.",
    content: `**DEMO PROJECT.** This is placeholder text so you can see how a long-form entry renders — swap it out from the admin dashboard.

A short paragraph introducing the motivation for the project goes here: what broke, what you wanted to learn, and why you picked this board specifically.

## Teardown

Notes on disassembly, what you found underneath the shielding, and which components were still viable.

- Battery: removed, tested separately
- Board revision: unknown until confirmed against schematics
- Connector: nonstandard pitch, required an adapter

## Bring-up

Describe how you got a serial console attached, what bootloader was present, and what you had to patch to get further.

\`\`\`
picocom -b 115200 /dev/ttyUSB0
\`\`\`

FIELD NOTE — record any measurement or voltage rail check here.

## Result

Summarize where the project stands and what the next revision will attempt.`,
    images: [],
    tags: ["reverse-engineering", "linux", "salvage"],
    projectStatus: "experiment",
    isDemo: true,
    order: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-004",
    projectNumber: 4,
    revision: "REV. 03",
    title: "Custom Single-Board Computer — Layout Notes",
    date: "2026-08-02",
    category: "Electronics",
    excerpt:
      "DEMO PROJECT — Placeholder log for a PCB design pass. Replace with your own write-up.",
    content: `**DEMO PROJECT.** Placeholder entry demonstrating a PCB / electronics-style log.

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
- Order a small first batch before committing to a full run`,
    images: [],
    tags: ["pcb", "electronics", "layout"],
    projectStatus: "active",
    isDemo: true,
    order: 4,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-003",
    projectNumber: 3,
    revision: "REV. 01",
    title: "Small Mechanical Linkage Experiment",
    date: "2026-07-14",
    category: "Mechanical",
    excerpt:
      "DEMO PROJECT — Placeholder log for a mechanical prototyping session. Replace with your own write-up.",
    content: `**DEMO PROJECT.** Placeholder entry for a mechanical engineering log.

What you were trying to test — a linkage geometry, a tolerance stack-up, a material choice — and why it mattered.

## Iteration 1

Describe the first print or build, what failed, and what you measured.

## Iteration 2

Describe the fix and whether it worked.

TEST RESULT / PASS

## Notes for next time

Keep this section short and specific — it's for future-you, not a reader.`,
    images: [],
    tags: ["mechanical", "prototyping"],
    projectStatus: "completed",
    isDemo: true,
    order: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-002",
    projectNumber: 2,
    revision: "REV. 02",
    title: "Building a Minimal Init System, Just to Understand One",
    date: "2026-06-30",
    category: "Software",
    excerpt:
      "DEMO PROJECT — Placeholder log for a systems-programming exercise. Replace with your own write-up.",
    content: `**DEMO PROJECT.** Placeholder entry for a software / systems log.

Why you wanted to write this from scratch instead of reading about it.

\`\`\`c
int main(void) {
    // fork the first user-space process
    return 0;
}
\`\`\`

## What broke first

Be specific about the first wall you hit and how you diagnosed it.

## What you'd change

A short, honest retrospective.`,
    images: [],
    tags: ["linux", "systems", "c"],
    projectStatus: "archived",
    isDemo: true,
    order: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-001",
    projectNumber: 1,
    revision: "REV. 01",
    title: "First Entry — Why This Archive Exists",
    date: "2026-06-01",
    category: "Other",
    excerpt:
      "DEMO PROJECT — Placeholder log explaining the purpose of the archive. Replace with your own write-up.",
    content: `**DEMO PROJECT.** This is the first placeholder entry — a good place for a short note on why you started keeping this log.

This is a working archive of things built, taken apart, and occasionally set on fire. Some entries will be finished projects; most won't be. That's on purpose — the failures are usually the more useful notes.`,
    images: [],
    tags: ["meta"],
    projectStatus: "completed",
    isDemo: true,
    order: 1,
    createdAt: now,
    updatedAt: now,
  },
];
