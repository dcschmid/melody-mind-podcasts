#!/usr/bin/env node
/**
 * Kurze Analyse der Zeichenlängen aller Titel & Descriptions der englischen Podcasts.
 * Ziel: Ermitteln welche angepasst werden müssen (Titel 55–65 Zeichen, Description 250–300 Zeichen).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.join(process.cwd());
const file = path.join(root, 'src', 'data', 'podcasts', 'en.json');

const raw = await fs.readFile(file, 'utf8');
const data = JSON.parse(raw);

function len(str){
  return [...str].length; // korrekt für UTF-16 surrogate pairs / Emojis
}

const TITLE_MIN = 55;
const TITLE_MAX = 65;
const DESC_MIN = 250;
const DESC_MAX = 300;

let needTitle = 0, needDesc = 0;
console.log('ID'.padEnd(28),'TitleLen','DescLen','TitleStatus','DescStatus');
for(const p of data.podcasts){
  const tLen = len(p.title || '');
  const dLen = len(p.description || '');
  const tOk = (tLen >= TITLE_MIN && tLen <= TITLE_MAX);
  const dOk = (dLen >= DESC_MIN && dLen <= DESC_MAX);
  if(!tOk) needTitle++;
  if(!dOk) needDesc++;
  const tStatus = tOk ? 'OK' : (tLen < TITLE_MIN ? `+${TITLE_MIN - tLen}` : `-${tLen - TITLE_MAX}`);
  const dStatus = dOk ? 'OK' : (dLen < DESC_MIN ? `+${DESC_MIN - dLen}` : `-${dLen - DESC_MAX}`);
  console.log(p.id.padEnd(28), String(tLen).padEnd(8), String(dLen).padEnd(8), tStatus.padEnd(10), dStatus);
}

console.log('\nTitel zu ändern:', needTitle, 'von', data.podcasts.length);
console.log('Descriptions zu ändern:', needDesc, 'von', data.podcasts.length);

// Aggregierte Statistik
const titleLengths = data.podcasts.map(p=>len(p.title));
const descLengths = data.podcasts.map(p=>len(p.description));
function stats(arr){
  const sorted = [...arr].sort((a,b)=>a-b);
  const sum = arr.reduce((a,b)=>a+b,0);
  const avg = sum/arr.length;
  const min = sorted[0];
  const max = sorted[sorted.length-1];
  const median = sorted[Math.floor(sorted.length/2)];
  return {min,max,avg:Math.round(avg*10)/10,median};
}
console.log('\nTitel Stats:', stats(titleLengths));
console.log('Description Stats:', stats(descLengths));
