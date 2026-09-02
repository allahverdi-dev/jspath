#!/usr/bin/env node
/**
 * npm run content:premium
 *
 * Emit the paid half of every Pro item as a single artifact that ships with the
 * `premium-content` Edge Function and never reaches the browser.
 *
 * The build-time Vite plugin removes these same fields from the client bundle;
 * this script is the other half of that split. Both read `PREMIUM_FIELDS`, so
 * the two can never disagree about what counts as paid.
 *
 * The output lives beside the function so `supabase functions deploy` carries it
 * along. It is deliberately not written anywhere Vite can see.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadAllContent } from './lib/load-content.mjs';
import { PREMIUM_FIELDS } from '../src/features/billing/premiumFields.js';
import { requiredPlanForContent } from '../src/features/billing/access.js';

const OUT_DIR = path.join('supabase', 'functions', 'premium-content');
const OUT_FILE = path.join(OUT_DIR, 'payload.json');

const content = await loadAllContent();

const collections = [
  ['challenge', content.challenges],
  ['exercise', content.exercises],
  ['interview', content.interview],
  ['project', content.projects],
];

const payload = {};
const counts = {};
let fields = 0;

for (const [kind, items] of collections) {
  const protectedFields = PREMIUM_FIELDS[kind];
  counts[kind] = 0;
  for (const item of items) {
    if (requiredPlanForContent(kind, item.id) !== 'pro') continue;
    const body = {};
    let has = false;
    for (const field of protectedFields) {
      if (item[field] === undefined) continue;
      body[field] = item[field];
      has = true;
      fields += 1;
    }
    if (!has) continue;
    payload[`${kind}:${item.id}`] = body;
    counts[kind] += 1;
  }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(payload), 'utf8');

const total = Object.values(counts).reduce((n, v) => n + v, 0);
console.log(`\n  Premium payload → ${OUT_FILE}`);
console.log(`  ${fields} protected fields across ${total} Pro items`);
for (const [kind, n] of Object.entries(counts)) console.log(`    ${kind.padEnd(10)} ${n}`);
console.log('  This file must never be served to the browser.\n');
