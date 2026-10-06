import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const appRoot = join(root, 'src', 'app');
const angularConfigPath = join(root, 'angular.json');
const forbiddenStyleExtensions = new Set(['.css', '.less', '.sass', '.scss']);
const violations = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const extension = extname(entry.name);

    if (forbiddenStyleExtensions.has(extension)) {
      violations.push(
        `${relative(root, fullPath)}: component-level stylesheet files are not allowed; use Tailwind utilities and shared primitives.`,
      );
    }

    if (extension === '.ts') {
      const source = await readFile(fullPath, 'utf8');

      if (/\bstyleUrls?\s*:/.test(source)) {
        violations.push(
          `${relative(root, fullPath)}: styleUrl/styleUrls is not allowed in application components.`,
        );
      }
    }
  }
}

await walk(appRoot);

const angularConfig = JSON.parse(await readFile(angularConfigPath, 'utf8'));
const project = angularConfig.projects?.['angular-inventory-system'];
const componentSchematic = project?.schematics?.['@schematics/angular:component'];

if (componentSchematic?.style !== 'none') {
  violations.push(
    'angular.json: @schematics/angular:component.style must be "none" so generated components do not create legacy stylesheets.',
  );
}

if (project?.architect?.build?.options?.inlineStyleLanguage) {
  violations.push(
    'angular.json: build.options.inlineStyleLanguage should not be configured for this Tailwind-only component model.',
  );
}

if (violations.length > 0) {
  console.error('Design-system guard failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log('Design-system guard passed: application components are Tailwind-only.');
}
