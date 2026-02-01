#!/usr/bin/env node
/**
 * Update audio metadata (fileSizeBytes, optional duration placeholder) in podcast JSON files.
 *
 * - Liest alle JSON Dateien unter src/content/podcasts/*.json
 * - Für jedes Podcast-Objekt mit audioUrl wird ein HEAD Request ausgeführt
 * - Content-Length wird als fileSizeBytes eingetragen (falls vorhanden)
 * - Optional: Dauer-Ermittlung könnte später ergänzt werden (TODO)
 *
 * Flags:
 *  --write   : Änderungen wirklich zurückschreiben (Default ist an)
 *  --no-write : Deaktiviert Schreiben (Dry-Run)
 *  --filter=<lang> : Nur bestimmte Sprachdatei bearbeiten (z.B. en,de)
 *  --timeout=<ms> : Request Timeout (Standard 8000)
 *  --duration : Versucht Dauer zu bestimmen (music-metadata). Lädt Datei (kann Traffic erzeugen)
 *  --ffprobe : Nutzt lokales ffprobe (falls installiert) für exaktere Dauer (überschreibt music-metadata)
 *  --no-duration : Deaktiviert Dauer-Ermittlung (Default ist an)
 *  --no-ffprobe : Deaktiviert ffprobe Nutzung (Default ist an)
 *  --no-refresh : Deaktiviert erzwungenes Refresh (Default ist an)
 *  --max-bytes=<n> : Max Bytes die für music-metadata gestreamt werden (Default 6_000_000)
 *  --no-cache : Ignoriert vorhandenen Cache (Default ist an)
 *  --use-cache : Aktiviert Cache Nutzung (Default ist aus)
 *  --refresh : Erzwingt erneutes Abrufen (überschreibt Cache Eintrag)
 *  --available-only : Nur Podcasts mit isAvailable=true bearbeiten
 *  --ids=a,b,c : Nur diese Podcast-IDs verarbeiten (Komma-getrennt)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import * as mm from 'music-metadata';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'src', 'content', 'podcasts');

const args = process.argv.slice(2);
const isWrite = !args.includes('--no-write');
const filterArg = args.find(a => a.startsWith('--filter='));
const filter = filterArg ? filterArg.split('=')[1].split(',').map(s => s.trim()) : null;
const timeoutArg = args.find(a => a.startsWith('--timeout='));
const timeoutMs = timeoutArg ? parseInt(timeoutArg.split('=')[1], 10) : 8000;
const wantDuration = !args.includes('--no-duration');
const useFfprobe = !args.includes('--no-ffprobe');
const maxBytesArg = args.find(a => a.startsWith('--max-bytes='));
const maxBytes = maxBytesArg ? parseInt(maxBytesArg.split('=')[1], 10) : 6_000_000;
const noCache = !args.includes('--use-cache');
const refresh = !args.includes('--no-refresh');
const availableOnly = args.includes('--available-only');
const idsArg = args.find(a => a.startsWith('--ids='));
const idFilter = idsArg ? idsArg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean) : null;
const cacheDir = path.join(root, '.cache');
const cacheFile = path.join(cacheDir, 'audio-metadata.json');
let cache = {};
let cacheDirty = false;

async function loadCache(){
  if(noCache) { log('Cache disabled (--no-cache)'); return; }
  try {
    const data = await fs.readFile(cacheFile,'utf8');
    cache = JSON.parse(data);
    log('Cache loaded entries:', Object.keys(cache).length);
  } catch(e){ log('No existing cache'); }
}

async function saveCache(){
  if(noCache) return;
  if(!cacheDirty) return;
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2)+'\n','utf8');
  log('Cache saved');
}

/** Minimal HEAD fetch using undici (Node 18+) oder Fallback fetch */
async function head(url, { timeout } = { timeout: timeoutMs }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/** HEAD first, Range-GET fallback if HEAD not allowed (403/405/400) */
async function headWithFallback(url, { timeout } = { timeout: timeoutMs }) {
  try {
    const res = await head(url, { timeout });
    if (res.ok) return res;
    if (res.status && ![400, 401, 403, 405].includes(res.status)) return res;
  } catch (e) {
    // ignore and try fallback
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal: controller.signal
    });
    return res;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function log(...msg) { console.log('[update-audio-metadata]', ...msg); }

async function probeWithFfprobe(url) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', ['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1', url]);
    let out=''; let err='';
    proc.stdout.on('data', d=> out += d.toString());
    proc.stderr.on('data', d=> err += d.toString());
    proc.on('close', code => {
      if(code===0){
        const dur = parseFloat(out.trim());
        if(!isNaN(dur)) return resolve(dur);
        return reject(new Error('ffprobe no duration'));
      }
      reject(new Error('ffprobe failed: '+err.trim()));
    });
  });
}

async function fetchPartial(url, limitBytes) {
  const controller = new AbortController();
  const res = await fetch(url, { signal: controller.signal });
  if(!res.ok) throw new Error('HTTP '+res.status);
  const reader = res.body.getReader();
  let received = 0; const chunks = [];
  while(true){
    const {done, value} = await reader.read();
    if(done) break;
    received += value.length;
    chunks.push(value);
    if(received >= limitBytes){
      controller.abort();
      break;
    }
  }
  return Buffer.concat(chunks);
}

async function deriveDuration(url) {
  if(useFfprobe){
    try { return await probeWithFfprobe(url); } catch(e){ log('ffprobe fallback to partial read:', e.message); }
  }
  // Fallback: partial fetch + music-metadata parse
  try {
    const buf = await fetchPartial(url, maxBytes);
    const meta = await mm.parseBuffer(buf, undefined, { duration: true });
    if(meta.format.duration) return meta.format.duration;
  } catch(e){ log('music-metadata failed', e.message); }
  return undefined;
}

async function processFile(filePath) {
  const base = path.basename(filePath);
  const lang = base.replace(/\.json$/, '');
  if (filter && !filter.includes(lang)) {
    log(`Skip (filtered) ${base}`);
    return;
  }
  const raw = await fs.readFile(filePath, 'utf8');
  let json;
  try { json = JSON.parse(raw); } catch (e) { log('JSON parse error in', base, e); return; }
  if (!Array.isArray(json.podcasts)) { log('No podcasts array in', base); return; }

  let changed = false;
  let reusedCount = 0;
  let updatedCount = 0;
  let durationAdded = 0;
  let errorsCount = 0;
  for (const p of json.podcasts) {
    if (availableOnly && !p.isAvailable) continue;
    if (idFilter && !idFilter.includes(p.id)) continue;
    if (!p.audioUrl) continue;
    try {
      const cacheKey = p.audioUrl;
      const cached = cache[cacheKey];
      const canReuse = cached && !refresh;
      if(canReuse) {
        // apply cached values if missing or different
        if(cached.fileSizeBytes && p.fileSizeBytes !== cached.fileSizeBytes){ p.fileSizeBytes = cached.fileSizeBytes; changed = true; }
        if(wantDuration && cached.durationSeconds && !p.durationSeconds){ p.durationSeconds = cached.durationSeconds; changed = true; }
        reusedCount++;
        log('REUSE', p.audioUrl);
      }
      if(!canReuse || !p.fileSizeBytes || (wantDuration && !p.durationSeconds)) {
        log('HEAD', p.audioUrl);
      const res = await headWithFallback(p.audioUrl);
      if (!res || !res.ok) {
        log('WARN status', res?.status, 'for', p.audioUrl);
        continue;
      }
      let len = res.headers.get('content-length');
      if(!len){
        const cr = res.headers.get('content-range'); // bytes 0-0/12345
        const m = cr && cr.match(/\/(\d+)$/);
        if(m) len = m[1];
      }
      if (len) {
        const num = parseInt(len, 10);
        if (!Number.isNaN(num)) {
          if (p.fileSizeBytes !== num) {
            p.fileSizeBytes = num;
            changed = true;
            log(`  -> fileSizeBytes=${num}`);
          }
        }
      } else {
        log('  (no content-length header)');
      }
        if (wantDuration && (refresh || !p.durationSeconds)) {
          log('  derive duration...');
          const dur = await deriveDuration(p.audioUrl);
          if (dur && !Number.isNaN(dur)) {
            const seconds = Math.round(dur);
            if (p.durationSeconds !== seconds) {
              p.durationSeconds = seconds;
              changed = true;
              durationAdded++;
              log(`  -> durationSeconds=${seconds}`);
            }
          } else {
            log('  (duration unresolved)');
          }
        }
        // update cache entry
        if(!noCache){
          cache[cacheKey] = {
            fileSizeBytes: p.fileSizeBytes,
            durationSeconds: p.durationSeconds
          };
          cacheDirty = true;
          updatedCount++;
        }
      }
      await wait(100); // kleine Pause um Rate Limits zu vermeiden
    } catch (e) {
      log('ERROR fetch', p.audioUrl, e.message);
      errorsCount++;
    }
  }

  if (changed) {
    if (isWrite) {
      await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      log('WROTE', base);
    } else {
      log('Dry-Run change detected for', base, '(use --write to persist)');
    }
  } else {
    log('No changes for', base);
  }
  log(`Stats ${base}: reused=${reusedCount} updated=${updatedCount} durationAdded=${durationAdded} errors=${errorsCount}`);
}

async function main() {
  await loadCache();
  log('Start (write mode:', isWrite, ') duration mode:', wantDuration, 'ffprobe:', useFfprobe, 'refresh:', refresh, 'available-only:', availableOnly, 'ids:', idFilter || 'all');
  const entries = await fs.readdir(dataDir);
  const files = entries.filter(f => f.endsWith('.json')).map(f => path.join(dataDir, f));
  for (const file of files) {
    await processFile(file);
  }
  await saveCache();
  log('Done');
  if (!isWrite) {
    log('Dry-Run beendet. Füge --write hinzu um Änderungen zu speichern.');
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
