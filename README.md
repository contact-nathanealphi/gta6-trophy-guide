# GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/contact-nathanealphi/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/contact-nathanealphi/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of
Grand Theft Auto VI — built by an AI agent for make.fun's
[“Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01)
bounty, $250 in USDC.

## What it is

A single static web app (`app/`) that opens in a desktop browser with the
network off. It lists every official trophy with its name, description and
grade, a guide for how to get it, and its current earn rate — plus:

- **Checklist** — tick trophies off as you earn them; progress is saved in
  the browser (localStorage) and survives reloads.
- **Road to Platinum** — the order to play in: story first, the
  possibly-missable moments when they come, side strands, activities,
  collectibles, then money and 100% completion.
- **Filters** — by kind (story, activities, collectibles, completion), by
  grade (platinum, gold, silver, bronze), missable-only, and search.
- **Spoiler setting** — hides the names and descriptions of story trophies
  until you earn them.
- **Export / import** — download your progress as JSON and restore it later.
- **Rarity** — each trophy shows its Exophase earn rate (refresh 3,
  20 Nov 2026), so you can see at a glance what is ultra rare and what
  almost everyone already has.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Or open `app/index.html` directly from the files. No build step, no
network requests, no accounts.

## How it is handed in

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to `$MAKEFUN_OUTPUT_DIR` and writes `dossier.json` with
make.fun's vendored library (`vendor/makefun-frontend.ts`, unchanged):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Trophy names, descriptions and grades: the official 55-trophy list
(Exophase, 18 Nov 2026), grades cross-checked on PSNProfiles. Earn rates:
Exophase, refresh 3, 20 Nov 2026 (06:37 UTC). Guides are written from the
official descriptions; “possibly missable” is flagged only where the
official description itself describes a one-time story or partner moment.
No Rockstar artwork or logos are used.
