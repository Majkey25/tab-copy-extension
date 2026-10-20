import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('release workflow preserves existing assets and publishes new assets with their tag', async (t) => {
  const workflow = await readFile('.github/workflows/release.yml', 'utf8');
  const publish = workflow.slice(workflow.indexOf('      - name: Create release when missing'));
  const scripts = [...publish.matchAll(/        run: \|\r?\n((?:          [^\r\n]*\r?\n|\r?\n)*)/g)]
    .map((match) => match[1].replace(/^ {10}/gm, ''))
    .join('\n');
  assert.ok(scripts.includes('gh release create'), 'Execute the actual publication step.');
  const bash = process.platform === 'win32'
    ? resolve(execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim(), '../../..', 'bin/bash.exe')
    : 'bash';
  const temporary = resolve('.reference/tmp');
  await mkdir(temporary, { recursive: true });
  const directory = await mkdtemp(resolve(temporary, 'release-'));
  try {
    const script = resolve(directory, 'publish.sh');
    const log = resolve(directory, 'calls.txt');
    await writeFile(script, `gh() {
  printf '%s\\n' "$*" >> "$CALL_LOG"
  if [ "$1 $2" = "release view" ]; then return "$VIEW_STATUS"; fi
}
${scripts}`);
    for (const exists of [true, false]) await t.test(exists ? 'existing release' : 'new release', async () => {
      await writeFile(log, '');
      execFileSync(bash, ['-e', script], {
        env: { ...process.env, TAG: 'v1.1.0', GITHUB_SHA: 'tested-commit', VIEW_STATUS: exists ? '0' : '1', CALL_LOG: log },
        encoding: 'utf8',
      });
      const calls = (await readFile(log, 'utf8')).trim().split(/\r?\n/);
      assert.equal(calls[0], 'release view v1.1.0');
      if (exists) assert.deepEqual(calls, ['release view v1.1.0']);
      else {
        assert.equal(calls.length, 2);
        assert.match(calls[1], /^release create v1\.1\.0 /);
        assert.ok(calls[1].includes('dist/tab-copy-extension.zip'));
        assert.ok(calls[1].includes('dist/tab-copy-extension-v1.1.0.zip'));
        assert.ok(calls[1].includes('--target tested-commit'));
      }
    });
  } finally {
    assert.ok(directory.startsWith(temporary));
    await rm(directory, { recursive: true, force: true });
  }
});
