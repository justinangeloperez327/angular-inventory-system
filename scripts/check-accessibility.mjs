import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const appRoot = join(root, 'src', 'app');
const violations = [];

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function report(file, source, index, message) {
  violations.push(`${file}:${lineNumber(source, index)}: ${message}`);
}

function hasAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:\\[)?${escaped}(?:\\])?\\s*=`, 'i').test(tag);
}

function auditTemplate(file, source) {
  for (const match of source.matchAll(/\btabindex\s*=\s*["']\s*([1-9]\d*)\s*["']/gi)) {
    report(file, source, match.index ?? 0, 'positive tabindex is not allowed; preserve natural DOM focus order.');
  }

  for (const match of source.matchAll(/<button\b[^>]*>/gi)) {
    if (!hasAttribute(match[0], 'type')) {
      report(file, source, match.index ?? 0, '<button> must declare an explicit type.');
    }

    if (/aria-hidden\s*=\s*["']true["']/i.test(match[0])) {
      report(file, source, match.index ?? 0, 'focusable <button> cannot be aria-hidden.');
    }
  }

  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!hasAttribute(match[0], 'alt') && !hasAttribute(match[0], 'attr.alt')) {
      report(file, source, match.index ?? 0, '<img> must declare alt text; use alt="" for decorative images.');
    }
  }

  for (const match of source.matchAll(/<(?:section|aside|div)\b[^>]*\brole\s*=\s*["']dialog["'][^>]*>/gi)) {
    const tag = match[0];

    if (!hasAttribute(tag, 'aria-modal') && !hasAttribute(tag, 'attr.aria-modal')) {
      report(file, source, match.index ?? 0, 'dialog must declare aria-modal.');
    }

    const labelled =
      hasAttribute(tag, 'aria-label') ||
      hasAttribute(tag, 'attr.aria-label') ||
      hasAttribute(tag, 'aria-labelledby') ||
      hasAttribute(tag, 'attr.aria-labelledby');

    if (!labelled) {
      report(file, source, match.index ?? 0, 'dialog must have aria-label or aria-labelledby.');
    }
  }

  for (const match of source.matchAll(/<(?:a|input|select|textarea)\b[^>]*aria-hidden\s*=\s*["']true["'][^>]*>/gi)) {
    report(file, source, match.index ?? 0, 'interactive elements cannot be aria-hidden.');
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const extension = extname(entry.name);
    const file = relative(root, fullPath);

    if (extension === '.html') {
      auditTemplate(file, await readFile(fullPath, 'utf8'));
      continue;
    }

    if (extension === '.ts') {
      const source = await readFile(fullPath, 'utf8');

      for (const match of source.matchAll(/\btemplate\s*:\s*`([\s\S]*?)`/g)) {
        auditTemplate(file, match[1]);
      }
    }
  }
}

await walk(appRoot);

if (violations.length > 0) {
  console.error('Accessibility guard failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log('Accessibility guard passed: baseline template accessibility rules are satisfied.');
}
