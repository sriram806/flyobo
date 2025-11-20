const fs = require('fs');
const path = require('path');

const IGNORES = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'venv']);
const MAX_PREVIEW_LINES = 10;

function isIgnored(name) {
  return IGNORES.has(name);
}

async function walk(dir, results = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (isIgnored(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await walk(full, results);
    } else if (ent.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function detectLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!ext) return 'unknown';
  const map = {
    '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript',
    '.jsx': 'javascript',
    '.json': 'json', '.md': 'markdown', '.html': 'html', '.css': 'css',
    '.py': 'python', '.java': 'java', '.cs': 'csharp', '.go': 'go',
    '.rs': 'rust', '.sql': 'sql', '.xml': 'xml', '.yml': 'yaml', '.yaml': 'yaml',
    '.ejs': 'ejs'
  };
  return map[ext] || ext.replace('.', '');
}

async function summarizeFile(filePath) {
  const rel = path.relative(process.cwd(), filePath);
  try {
    const stat = await fs.promises.stat(filePath);
    const size = stat.size;
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const totalLines = lines.length;
    const preview = lines.slice(0, MAX_PREVIEW_LINES);
    const todoMatches = content.match(/TODO|FIXME/gi) || [];
    const nul = content.indexOf('\0');
    const binary = nul !== -1;
    return {
      path: rel,
      size,
      language: detectLanguage(filePath),
      totalLines: binary ? null : totalLines,
      previewLines: binary ? [] : preview,
      todoCount: todoMatches.length,
      isBinary: binary
    };
  } catch (err) {
    return { path: rel, error: String(err) };
  }
}

(async function main() {
  try {
    const root = process.cwd();
    console.log('Scanning', root);
    const files = await walk(root, []);
    const summaries = [];
    for (const f of files) {
      // skip the output file if it exists
      if (path.basename(f) === 'repo-scan.json') continue;
      const s = await summarizeFile(f);
      summaries.push(s);
    }
    const outPath = path.join(root, 'repo-scan.json');
    await fs.promises.writeFile(outPath, JSON.stringify(summaries, null, 2), 'utf8');
    console.log('Wrote', outPath, 'with', summaries.length, 'entries');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
})();
