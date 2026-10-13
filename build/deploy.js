// Publish the built site to the gh-pages branch (GitHub Pages serves that branch).
// Only public files go out: src/, build/, _raw/ and repo docs stay on main.
// Usage: node build/build.js && node build/verify.js && node build/deploy.js
const fs = require('fs'), path = require('path'), os = require('os');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['.git', '.github', 'src', 'build', '_raw', 'node_modules', 'README.md', '.gitignore', '__harness.html']);
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

const remote = run('git remote get-url origin', ROOT);
const name = run('git config user.name', ROOT), email = run('git config user.email', ROOT);
const rev = run('git rev-parse --short HEAD', ROOT);
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tint-pages-'));
for (const f of fs.readdirSync(ROOT)) if (!SKIP.has(f)) fs.cpSync(path.join(ROOT, f), path.join(out, f), { recursive: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');
run('git init -q -b gh-pages', out);
run(`git -c user.name="${name}" -c user.email="${email}" add -A`, out);
run(`git -c user.name="${name}" -c user.email="${email}" -c core.autocrlf=false commit -q -m "Deploy ${rev}"`, out);
run(`git push -q -f "${remote}" gh-pages`, out);
fs.rmSync(out, { recursive: true, force: true });
console.log('Deployed', rev, 'to gh-pages');
