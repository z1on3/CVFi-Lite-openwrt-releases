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

const EAP225_NOTE = '⚠ Experimental — single-port AP-as-gateway image, not yet boot-tested on hardware. Flash only on a device you can recover, and verify one revision (internet + portal + a client session) first.';
const DEVICES = {
  'asus-rt-ax52':               { name: 'ASUS RT-AX52',               image: 'https://image.alza.cz/products/Asus23_022/Asus23_022-01.jpg' },
  'asus-rt-ac68u':              { name: 'ASUS RT-AC68U',              image: 'https://dlcdnwebimgs.asus.com/gain/6670e848-ba84-47e0-97d5-fd076ac3a137/w185', note: '⚠ Wi-Fi unsupported on this Broadcom board in OpenWrt — routes over Ethernet only and cannot serve its own hotspot. Use it wired or paired with an external AP. First flash from stock ASUS uses the .trx (this image is that .trx under a .bin name).' },
  'comfast-cf-n5-v2':           { name: 'Comfast CF-N5 v2',           image: 'https://comfastgroup.com/wp-content/uploads/2024/09/cf-n5-v2.webp' },
  'comfast-cf-ew71-v2':         { name: 'Comfast CF-EW71 v2',         image: '' },
  'comfast-cf-ew72-v2':         { name: 'Comfast CF-EW72 v2',         image: 'https://comfastgroup.com/wp-content/uploads/2024/09/cf-ew72-v2.webp' },
  'edup-ep-rt2983':             { name: 'EDUP EP-RT2983',             image: '' },
  'linksys-ea8300':             { name: 'Linksys EA8300',             image: '', note: '⚠ OpenWrt 24.10.3 only. Upgrading this board to 24.10.x can fail to boot or sysupgrade (openwrt#17979); keep a recovery path. CVFi Reloaded also offers a 23.05.5 image for this router.' },
  'linksys-wrt1900acs':         { name: 'Linksys WRT1900ACS',         image: '' },
  'mercusys-mr70x-v1':          { name: 'Mercusys MR70X v1',          image: 'https://static.mercusys.com/product-image/01_large20201223072930.jpg' },
  'newifi-d2':                  { name: 'Newifi D2',                  image: '' },
  'ruijie-rg-ew1200g-pro-v1.1': { name: 'Ruijie RG-EW1200G PRO v1.1', image: 'https://eo-sgp-cos.ruijie.com/background/other/2023-10-27/7b9d778c2293490a993760bc68f52396.png' },
  'ruijie-rg-ew3200gx-pro':     { name: 'Ruijie RG-EW3200GX PRO',     image: 'https://eo-sgp-cos.ruijie.com/background/other/2023-10-30/b2b529094b4d432fa998eba11a445b19.png' },
  'zbt-wg3526-16m':             { name: 'ZBT WG3526 (16M)',           image: '' },
  'airpho-ar-w410':             { name: 'AIRPHO AR-W410',             image: '', note: 'ZBT WG3526 (16M) clone, flashed through Breed. Same image as the ZBT WG3526 with the router named AR-W410.' },
  // No eap225-v2: v2 hardware has no separate OpenWrt profile and flashes the v1 image.
  'eap225-v1':                  { name: 'TP-Link EAP225 v1',          image: '', note: EAP225_NOTE },
  'eap225-v3':                  { name: 'TP-Link EAP225 v3',          image: '', note: EAP225_NOTE },
  'eap225-v4':                  { name: 'TP-Link EAP225 v4',          image: '', note: EAP225_NOTE },
  'eap225-outdoor-v1':          { name: 'TP-Link EAP225-Outdoor v1',  image: '', note: EAP225_NOTE },
  'eap225-outdoor-v3':          { name: 'TP-Link EAP225-Outdoor v3',  image: '', note: EAP225_NOTE },
  'eap225-wall-v2':             { name: 'TP-Link EAP225-Wall v2',     image: '', note: EAP225_NOTE },
  // PC / SBC whole-disk images: download only, never offered as an in-place update.
  'orange-pi-one':              { name: 'Orange Pi One',              image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Top_view_of_an_Orange_Pi_One_single-board_computer.jpg' },
  'orange-pi-pc':               { name: 'Orange Pi PC',               image: '' },
  'orange-pi-zero-3':           { name: 'Orange Pi Zero 3',           image: '' },
  'raspberry-pi-3':             { name: 'Raspberry Pi 3',             image: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Raspberry_Pi_3_B%2B.jpg' },
  'raspberry-pi-4':             { name: 'Raspberry Pi 4',             image: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Raspberry_Pi_4_Model_B_-_Top.jpg' },
  'raspberry-pi-5':             { name: 'Raspberry Pi 5',             image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Raspberry_Pi_5.jpg' },
  'x86-64':                     { name: 'PC / x86-64',                image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Intel_NUC_Mini_PC.jpg' },
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
