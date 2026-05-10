import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCb);
const SOURCE_URL = 'https://www.tentors.org.uk/eventdata/routei.html';
const TEAM_CODE = 'IF';
const TEAM_NAME = 'Polar Explorer Scouts';
const OUTPUT = process.env.OUTPUT || 'ten-tors-route-i/data.json';
const EXISTING_DATA = process.env.EXISTING_DATA || OUTPUT;
const IMAGE_OUTPUT_DIR = process.env.IMAGE_OUTPUT_DIR || 'ten-tors-route-i/images';
const IMAGE_PUBLIC_PATH = (process.env.IMAGE_PUBLIC_PATH || './images').replace(/\/$/, '');
const FORCE_IMAGE_REFRESH = String(process.env.FORCE_IMAGE_REFRESH || 'false').toLowerCase() === 'true';

const ROUTE = ['START','HIGHER TOR','COSDON HILL','SHILSTONE TOR','STEEPERTON TOR','WATERN TOR','SITTAFORD TOR','STANNON TOR','POSTBRIDGE','HIGHER WHITE TOR','HOLMING BEAM','WHITE BARROW','STANDON FARM','WILLSWORTHY','HARE TOR','KITTY TOR','EAST MILL TOR','FINISH'];
const COORDS = { START:[50.7379,-4.0068], 'HIGHER TOR':[50.7167,-4.0032], 'COSDON HILL':[50.6928,-3.9414], 'SHILSTONE TOR':[50.6705,-3.9126], 'STEEPERTON TOR':[50.6729,-3.9744], 'WATERN TOR':[50.6657,-3.9647], 'SITTAFORD TOR':[50.6597,-3.9308], 'STANNON TOR':[50.6467,-3.9348], POSTBRIDGE:[50.5958,-3.9185], 'HIGHER WHITE TOR':[50.5891,-3.9794], 'HOLMING BEAM':[50.5723,-4.0115], 'WHITE BARROW':[50.5757,-4.0459], 'STANDON FARM':[50.6167,-4.0525], WILLSWORTHY:[50.6281,-4.0712], 'HARE TOR':[50.6269,-4.0318], 'KITTY TOR':[50.6574,-4.0221], 'EAST MILL TOR':[50.6903,-4.0105], FINISH:[50.7379,-4.0068] };

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const minutes = (v) => /^\d{1,2}:\d{2}$/.test(v || '') ? (Number(v.split(':')[0]) * 60 + Number(v.split(':')[1])) : null;
const elapsed = (a,b) => { const x=minutes(a), y=minutes(b); if (x==null||y==null) return null; const d=Math.max(0,y-x); const h=Math.floor(d/60), m=d%60; return { minutes:d, label:h?`${h}h ${String(m).padStart(2,'0')}m`:`${m}m` }; };

function cleanText(html){return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');}

async function fetchWithRetry(url, options = {}, attempts = 4) {
  let lastError;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (i < attempts) await new Promise((r) => setTimeout(r, i * 1500));
    }
  }
  throw lastError;
}

function parse(html){
  const lines=cleanText(html).split(/\n+/).map((x)=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const sourceLastUpdated=(lines.find((l)=>/^LAST UPDATED:/i.test(l))||'LAST UPDATED: unknown').replace(/^LAST UPDATED:\s*/i,'');
  const row=lines.find((l)=>new RegExp(`\\b${TEAM_CODE}\\b`).test(l)&&/\b\d{1,2}:\d{2}\b/.test(l));
  if(!row) throw new Error(`Could not find team code ${TEAM_CODE}`);
  const firstTime=row.search(/\b\d{1,2}:\d{2}\b/);
  const sourceName=row.slice(0,firstTime).replace(new RegExp(`\\b${TEAM_CODE}\\s*$`),'').trim()||TEAM_NAME;
  const times=row.match(/\b\d{1,2}:\d{2}\b/g)||[];
  const checkpoints=ROUTE.map((name,i)=>{const arrivalTime=times[i]||null;const reached=Boolean(arrivalTime);return {name,arrivalTime,reached,elapsed:reached?elapsed(times[0],arrivalTime):null,progressPercent:Math.round((i/(ROUTE.length-1))*100),coordinates:{lat:COORDS[name][0],lon:COORDS[name][1]}};});
  const reachedCount=checkpoints.filter((c)=>c.reached).length;
  return {sourceUrl:SOURCE_URL,generatedAt:new Date().toISOString(),sourceLastUpdated,team:{requestedName:TEAM_NAME,sourceName,code:TEAM_CODE,nameMatchesRequest:sourceName.toLowerCase()===TEAM_NAME.toLowerCase()},route:'I',routeProgressPercent:Math.max(0,Math.round(((reachedCount-1)/(ROUTE.length-1))*100)),reachedCount,currentCheckpoint:checkpoints[reachedCount-1]||checkpoints[0],nextCheckpoint:checkpoints[reachedCount]||null,checkpoints,rawTeamRow:row};
}

async function readExisting(){ if(!existsSync(EXISTING_DATA)) return null; try{return JSON.parse(await readFile(EXISTING_DATA,'utf8'));}catch{return null;} }

async function resolveImage(checkpoint){
  const { lat, lon } = checkpoint.coordinates;
  const params = new URLSearchParams({ action:'query', generator:'geosearch', ggscoord:`${lat}|${lon}`, ggsradius:'6000', ggslimit:'8', prop:'pageimages|info', pithumbsize:'1600', inprop:'url', format:'json', origin:'*' });
  const r=await fetchWithRetry(`https://commons.wikimedia.org/w/api.php?${params}`);
  const j=await r.json(); const pages=Object.values(j?.query?.pages||{}); const p=pages.find((x)=>x?.thumbnail?.source);
  if(!p?.thumbnail?.source) throw new Error('No thumbnail candidate');
  return { imageUrl:p.thumbnail.source, imageSource:p.fullurl||'wikimedia', imageTitle:p.title||checkpoint.name };
}

async function saveAsWebp(tmpIn, outFile){
  try { await execFile('magick', [tmpIn, '-resize', '720x720>', '-quality', '76', outFile]); return true; } catch { return false; }
}

async function cacheImage(cp){
  const filename=`${slug(cp.name)}.webp`; const outPath=path.join(IMAGE_OUTPUT_DIR,filename); const publicPath=`${IMAGE_PUBLIC_PATH}/${filename}`;
  const img=await resolveImage(cp); const res=await fetchWithRetry(img.imageUrl);
  const buf=Buffer.from(await res.arrayBuffer());
  await mkdir(IMAGE_OUTPUT_DIR,{recursive:true});
  const tmpIn=path.join(IMAGE_OUTPUT_DIR,`${slug(cp.name)}.tmp`); await writeFile(tmpIn,buf);
  let wrote=false;
  try { wrote = await saveAsWebp(tmpIn, outPath); } finally { /* ignore temp cleanup */ }
  if(!wrote) await writeFile(outPath, buf);
  return { ...img, localImageUrl: publicPath };
}

const existing=await readExisting();
let parsed;
try {
  const response=await fetchWithRetry(SOURCE_URL,{headers:{'user-agent':'github-actions-ten-tors-dashboard/2.0'}});
  parsed=parse(await response.text());
} catch (error) {
  if (!existing) throw error;
  console.warn(`Source fetch failed, preserving existing data: ${error.message || error}`);
  parsed = { ...existing, generatedAt: new Date().toISOString(), sourceError: String(error.message || error) };
}

const existingByName=new Map((existing?.checkpoints||[]).map((c)=>[c.name,c]));
let preserved=0,resolved=0,downloaded=0,fallbacks=0;

const checkpoints=[];
for (const cp of parsed.checkpoints){
  const old=existingByName.get(cp.name)||{};
  let merged={...cp};
  const hasLocal=typeof old.localImageUrl==='string'&&old.localImageUrl.trim();
  if(!FORCE_IMAGE_REFRESH && hasLocal){
    merged={...merged, localImageUrl:old.localImageUrl, imageUrl:old.imageUrl??null, imageSource:old.imageSource??null, imageTitle:old.imageTitle??null, imageError:old.imageError}; preserved++;
  } else {
    try { const fresh=await cacheImage(cp); merged={...merged,...fresh}; resolved++; downloaded++; }
    catch(err){ merged={...merged, localImageUrl:old.localImageUrl||null, imageUrl:old.imageUrl||null, imageSource:old.imageSource||null, imageTitle:old.imageTitle||null, imageError:String(err.message||err)}; fallbacks++; }
  }
  checkpoints.push(merged);
}

const byName=new Map(checkpoints.map((c)=>[c.name,c]));
const out={...parsed,checkpoints,currentCheckpoint:byName.get(parsed.currentCheckpoint.name)||parsed.currentCheckpoint,nextCheckpoint:parsed.nextCheckpoint?byName.get(parsed.nextCheckpoint.name)||parsed.nextCheckpoint:null,imagePolicy:{forceImageRefresh:FORCE_IMAGE_REFRESH,preserved,resolved,downloaded,fallbacks}};
await mkdir(path.dirname(OUTPUT),{recursive:true}); await writeFile(OUTPUT,`${JSON.stringify(out,null,2)}\n`,'utf8');
console.log(`Image fields preserved: ${preserved}`);
console.log(`Images resolved: ${resolved}`);
console.log(`Images downloaded: ${downloaded}`);
console.log(`Image fallbacks: ${fallbacks}`);
console.log(`Wrote JSON: ${OUTPUT}`);
