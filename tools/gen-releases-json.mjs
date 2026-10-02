#!/usr/bin/env node
// Generate releases.json (the update list CVFi Lite routers read) from the GitHub
// releases of this repository. Requires the `gh` CLI, authenticated.
//
//   node tools/gen-releases-json.mjs [owner/repo] > releases.json
//
// A router offers an asset when board == its board slug, openwrt == its OpenWrt
// release and the file is a .bin. Whole-disk .img.gz images are listed for download
// only. Draft releases are skipped: their assets are not publicly downloadable.

import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repo = process.argv[2] || 'z1on3/CVFi-Lite-openwrt-releases';
const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const CHANNELS = ['preview', 'stable', 'beta'];

const DISCLAIMERS = (() => {
  const builtin = {
    default: "⚠ Flash at your own risk. We're not responsible for any damage to your device.",
  };
  try {
    const raw = JSON.parse(readFileSync(new URL('../disclaimers.json', import.meta.url), 'utf8'));
    const picked = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!k.startsWith('_') && typeof v === 'string') { picked[k] = v; }
    }
    return { ...builtin, ...picked };
  } catch (e) {
    process.stderr.write(`warn: disclaimers.json unreadable (${e.message}); using built-in text\n`);
    return builtin;
  }
})();

// CVFi-Lite-<board>-<openwrt>-<version>.bin  (board slugs contain dashes; the first
// N.N.N token after the slug is the OpenWrt release)
const IMG_RE = /^CVFi-Lite-(.+?)-(\d+\.\d+\.\d+)-(.+)\.bin$/;
const APP_RE = /^CVFi-Lite-(.+?)-(\d+\.\d+\.\d+)-(.+?)(-efi)?\.img\.gz$/;

const DEVICES = {
  'asus-rt-ax52':       { name: 'ASUS RT-AX52',       image: 'https://image.alza.cz/products/Asus23_022/Asus23_022-01.jpg' },
  'comfast-cf-ew71-v2': { name: 'Comfast CF-EW71 v2', image: '' },
  'x86-64':             { name: 'PC / x86-64',        image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Intel_NUC_Mini_PC.jpg' },
};

function parseSums(text) {
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([0-9a-fA-F]{64})\s+\*?(.+)$/);
    if (m) { map[m[2].replace(/^.*\//, '')] = m[1].toLowerCase(); }
  }
  return map;
}

function downloadSums(tag, pattern) {
  const tmp = join(tmpdir(), `cvfi-lite-${pattern}-${tag.replace(/[^\w.-]/g, '_')}`);
  try {
    gh(['release', 'download', tag, '--repo', repo, '--pattern', pattern, '--output', tmp, '--clobber']);
    const sums = parseSums(readFileSync(tmp, 'utf8'));
    rmSync(tmp, { force: true });
    return sums;
  } catch (e) {
    process.stderr.write(`warn: ${tag}: could not read ${pattern} (${e.message})\n`);
    return {};
  }
}

const releases = JSON.parse(gh(['release', 'list', '--repo', repo, '--json', 'tagName,name,publishedAt,isPrerelease,isDraft']));
const out = { latest: '', releases: [] };

for (const rel of releases) {
  if (rel.isDraft) { continue; }
  const tag = rel.tagName;
  const view = JSON.parse(gh(['release', 'view', tag, '--repo', repo, '--json', 'assets']));
  const names = (view.assets || []).map((a) => a.name);
  if (!names.includes('SHA256SUMS.txt')) { continue; }
  const sums = downloadSums(tag, 'SHA256SUMS.txt');
  const appSums = names.includes('SHA256SUMS-appliance.txt') ? downloadSums(tag, 'SHA256SUMS-appliance.txt') : {};

  const assets = [];
  for (const name of names) {
    let m = name.match(IMG_RE);
    let appliance = false;
    if (!m) {
      m = name.match(APP_RE);
      appliance = !!m;
    }
    if (!m) { continue; }
    const [, board, openwrt] = m;
    const sha256 = (appliance ? appSums[name] : null) || sums[name];
    if (!sha256) { continue; }
    const meta = DEVICES[board] || { name: board, image: '', note: '' };
    let displayName = meta.name;
    if (appliance && board === 'x86-64') {
      displayName = /-efi\.img\.gz$/.test(name) ? `${meta.name} (EFI)` : `${meta.name} (BIOS)`;
    }
    assets.push({ board, name: displayName, openwrt, file: name, sha256, image: meta.image || '', note: meta.note || '', appliance });
  }
  if (!assets.length) { continue; }

  const version = tag.replace(/^v/, '');
  const channel = CHANNELS.find((c) => version.endsWith(`-${c}`)) || '';
  out.releases.push({
    version,
    tag,
    channel,
    disclaimer: DISCLAIMERS[channel] ?? DISCLAIMERS.default ?? '',
    date: (rel.publishedAt || '').slice(0, 10),
    notes: rel.name || '',
    assets,
  });
}

if (out.releases.length) { out.latest = out.releases[0].version; }
out.devices = Object.fromEntries(
  Object.entries(DEVICES).map(([k, v]) => [k, { name: v.name, image: v.image || '', note: v.note || '' }]),
);
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
