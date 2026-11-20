// Hands in the GTA VI trophy guide (Node 22, standard library only).
//
// What this program does: it takes the guide in this directory — the static
// files under app/ (the page, its script, its stylesheet and its trophy
// data) and the screenshots/ captures of the running guide — copies them to
// the output directory, and writes dossier.json there with make.fun's own
// vendored library. The dossier is the summary the judge reads: the
// screenshots, the first load's files and bytes, and the guide's source.
//
// The guide itself is plain static files: a browser opens app/index.html,
// no build step, no network. vendor/makefun-frontend.ts is make.fun's file
// and must stay exactly as it is — the scorer re-runs its own copy and
// requires the dossier to match byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the guide, then the screenshots, into the output directory.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps are the bounty's own (its gate.json): only text_max_bytes shapes
// the dossier's bytes; the rest refuse an entry the scorer would refuse —
// more than 4 screenshots or one over 256 KiB, or an app past 993 files
// and directories or 48 MiB. Passing them here makes this program fail
// exactly where the scorer would.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
