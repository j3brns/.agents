import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_URL = 'https://www.tentors.org.uk/eventdata/routei.html';
const TEAM_CODE = 'IF';
const TEAM_NAME = 'Polar Explorer Scouts';
const OUTPUT = process.env.OUTPUT || 'ten-tors-route-i/data.json';
const FALLBACK_IMAGE_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dartmoor%20view%20from%20Haytor.jpg?width=900';

const ROUTE = [
  'START', 'HIGHER TOR', 'COSDON HILL', 'SHILSTONE TOR', 'STEEPERTON TOR',
  'WATERN TOR', 'SITTAFORD TOR', 'STANNON TOR', 'POSTBRIDGE',
  'HIGHER WHITE TOR', 'HOLMING BEAM', 'WHITE BARROW', 'STANDON FARM',
  'WILLSWORTHY', 'HARE TOR', 'KITTY TOR', 'EAST MILL TOR', 'FINISH',
];

const COORDS = {
  START: [50.7379, -4.0068],
  'HIGHER TOR': [50.7167, -4.0032],
  'COSDON HILL': [50.6928, -3.9414],
  'SHILSTONE TOR': [50.6705, -3.9126],
  'STEEPERTON TOR': [50.6729, -3.9744],
  'WATERN TOR': [50.6657, -3.9647],
  'SITTAFORD TOR': [50.6597, -3.9308],
  'STANNON TOR': [50.6467, -3.9348],
  POSTBRIDGE: [50.5958, -3.9185],
  'HIGHER WHITE TOR': [50.5891, -3.9794],
  'HOLMING BEAM': [50.5723, -4.0115],
  'WHITE BARROW': [50.5757, -4.0459],
  'STANDON FARM': [50.6167, -4.0525],
  WILLSWORTHY: [50.6281, -4.0712],
  'HARE TOR': [50.6269, -4.0318],
  'KITTY TOR': [50.6574, -4.0221],
  'EAST MILL TOR': [50.6903, -4.0105],
  FINISH: [50.7379, -4.0068],
};

function minutes(value) {
  if (!/^\d{1,2}:\d{2}$/.test(value || '')) return null;
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

function elapsed(start, current) {
  const a = minutes(start);
  const b = minutes(current);
  if (a == null || b == null) return null;
  const diff = Math.max(0, b - a);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return { minutes: diff, label: h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m` };
}

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

async function resolveCheckpointImage(checkpoint) {
  const { lat, lon } = checkpoint.coordinates;
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${lat}|${lon}`,
    ggsradius: '6000',
    ggslimit: '8',
    prop: 'pageimages|info',
    pithumbsize: '900',
    inprop: 'url',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'user-agent': 'github-actions-ten-tors-dashboard/1.0' },
    });
    if (!response.ok) throw new Error(`Wikimedia HTTP ${response.status}`);
    const json = await response.json();
    const pages = Object.values(json?.query?.pages || {});
    const page = pages.find((candidate) => candidate?.thumbnail?.source);
    return {
      imageUrl: page?.thumbnail?.source || FALLBACK_IMAGE_URL,
      imageSource: page?.fullurl || 'fallback',
      imageTitle: page?.title || 'Dartmoor landscape fallback',
    };
  } catch (error) {
    return {
      imageUrl: FALLBACK_IMAGE_URL,
      imageSource: 'fallback',
      imageTitle: 'Dartmoor landscape fallback',
      imageError: error.message,
    };
  }
}

async function addImages(data) {
  const enriched = await Promise.all(
    data.checkpoints.map(async (checkpoint) => ({
      ...checkpoint,
      ...(await resolveCheckpointImage(checkpoint)),
    })),
  );
  const byName = new Map(enriched.map((checkpoint) => [checkpoint.name, checkpoint]));
  return {
    ...data,
    checkpoints: enriched,
    currentCheckpoint: byName.get(data.currentCheckpoint.name) || data.currentCheckpoint,
    nextCheckpoint: data.nextCheckpoint ? byName.get(data.nextCheckpoint.name) || data.nextCheckpoint : null,
  };
}

function parse(html) {
  const lines = cleanText(html)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const sourceLastUpdated = (lines.find((line) => /^LAST UPDATED:/i.test(line)) || 'LAST UPDATED: unknown')
    .replace(/^LAST UPDATED:\s*/i, '');

  const row = lines.find((line) => new RegExp(`\\b${TEAM_CODE}\\b`).test(line) && /\b\d{1,2}:\d{2}\b/.test(line));
  if (!row) throw new Error(`Could not find team code ${TEAM_CODE}`);

  const firstTime = row.search(/\b\d{1,2}:\d{2}\b/);
  const sourceName = row.slice(0, firstTime).replace(new RegExp(`\\b${TEAM_CODE}\\s*$`), '').trim() || TEAM_NAME;
  const times = row.match(/\b\d{1,2}:\d{2}\b/g) || [];

  const checkpoints = ROUTE.map((name, index) => {
    const arrivalTime = times[index] || null;
    const reached = Boolean(arrivalTime);
    return {
      name,
      arrivalTime,
      reached,
      elapsed: reached ? elapsed(times[0], arrivalTime) : null,
      progressPercent: Math.round((index / (ROUTE.length - 1)) * 100),
      coordinates: { lat: COORDS[name][0], lon: COORDS[name][1] },
    };
  });

  const reachedCount = checkpoints.filter((checkpoint) => checkpoint.reached).length;
  const currentCheckpoint = checkpoints[reachedCount - 1] || checkpoints[0];
  const nextCheckpoint = checkpoints[reachedCount] || null;

  return {
    sourceUrl: SOURCE_URL,
    generatedAt: new Date().toISOString(),
    sourceLastUpdated,
    imageResolution: {
      provider: 'Wikimedia Commons geosearch',
      radiusMetres: 6000,
      fallbackImageUrl: FALLBACK_IMAGE_URL,
    },
    team: {
      requestedName: TEAM_NAME,
      sourceName,
      code: TEAM_CODE,
      nameMatchesRequest: sourceName.toLowerCase() === TEAM_NAME.toLowerCase(),
    },
    route: 'I',
    routeProgressPercent: Math.max(0, Math.round(((reachedCount - 1) / (ROUTE.length - 1)) * 100)),
    reachedCount,
    currentCheckpoint,
    nextCheckpoint,
    checkpoints,
    rawTeamRow: row,
  };
}

const response = await fetch(SOURCE_URL, {
  headers: { 'user-agent': 'github-actions-ten-tors-dashboard/1.0' },
});

if (!response.ok) {
  throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
}

const html = await response.text();
const data = await addImages(parse(html));
await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUTPUT}`);
console.log(`${data.team.sourceName} ${data.team.code}: ${data.reachedCount}/${data.checkpoints.length} checkpoints`);
console.log(`Resolved ${data.checkpoints.filter((checkpoint) => checkpoint.imageUrl).length} checkpoint image URLs`);
