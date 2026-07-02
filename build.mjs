import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseDir = new URL('.', import.meta.url).pathname;
const srcDir = path.join(baseDir, 'src');
const pagesDir = path.join(srcDir, 'pages');
const partialsDir = path.join(srcDir, 'partials');

const partialNames = ['head', 'header', 'footer', 'bottom-nav', 'modals', 'scripts'];
const partials = Object.fromEntries(
  await Promise.all(
    partialNames.map(async (name) => [
      name,
      await readFile(path.join(partialsDir, `${name}.html`), 'utf8'),
    ]),
  ),
);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(fullPath) : fullPath;
    }),
  );
  return files.flat().filter((file) => file.endsWith('.html'));
};

const parsePage = (source) => {
  const match = source.match(/^<!--\s*({[\s\S]*?})\s*-->\s*/);
  if (!match) {
    throw new Error('Page template is missing JSON metadata comment.');
  }
  return {
    meta: JSON.parse(match[1]),
    body: source.slice(match[0].length),
  };
};

const applyVars = (source, vars) =>
  source.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');

const render = (source, vars) => {
  let output = source.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!partials[name]) {
      throw new Error(`Unknown partial: ${name}`);
    }
    return partials[name];
  });
  output = applyVars(output, vars);
  return `${output.trim()}\n`;
};

const pageFiles = await walk(pagesDir);

for (const pageFile of pageFiles) {
  const { meta, body } = parsePage(await readFile(pageFile, 'utf8'));
  const vars = {
    title: meta.title,
    mainClass: meta.mainClass ?? '',
    homeHref: meta.homeHref,
    eventHref: meta.eventHref,
    conceptHref: meta.conceptHref ?? 'concept.html',
    technologyHref: meta.technologyHref ?? 'technology.html',
    workHref: meta.workHref ?? 'work.html',
    columnHref: meta.columnHref ?? 'column.html',
  };
  const html = render(body, vars);
  const outPath = path.join(baseDir, meta.out);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log(`built ${path.relative(baseDir, outPath)}`);
}
