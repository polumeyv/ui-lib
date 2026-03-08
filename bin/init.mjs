#!/usr/bin/env node
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();
const assetsDir = resolve(__dirname, '..', 'src', 'lib', 'assets');
const fontFamilies = ['Geist', 'Inter'];

// --- Helpers ---

function isSvelteKitApp(dir) {
	return (
		existsSync(join(dir, 'src/routes')) &&
		(existsSync(join(dir, 'svelte.config.js')) || existsSync(join(dir, 'svelte.config.ts')))
	);
}

function copyFonts(destBase) {
	const created = [];
	const skipped = [];

	for (const family of fontFamilies) {
		const srcDir = join(assetsDir, 'fonts', family);
		const destDir = join(destBase, family);

		if (!existsSync(destDir)) {
			mkdirSync(destDir, { recursive: true });
		}

		for (const file of readdirSync(srcDir)) {
			const dest = join(destDir, file);
			const relPath = `${basename(destBase)}/${family}/${file}`;
			if (existsSync(dest)) {
				skipped.push(relPath);
			} else {
				copyFileSync(join(srcDir, file), dest);
				created.push(relPath);
			}
		}
	}

	return { created, skipped };
}

function readJson(filePath) {
	return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
	writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n');
}

function printSummary(created, skipped) {
	console.log();
	if (created.length) {
		console.log('Created:');
		for (const f of created) console.log(`  + ${f}`);
	}
	if (skipped.length) {
		console.log('Already exists, skipping:');
		for (const f of skipped) console.log(`  - ${f}`);
	}
	console.log();
}

// --- Single-app mode (no flags) ---

function runSingleApp() {
	const hasRoutes = existsSync(join(cwd, 'src/routes'));
	const hasStatic = existsSync(join(cwd, 'static'));
	const hasSvelteConfig =
		existsSync(join(cwd, 'svelte.config.js')) || existsSync(join(cwd, 'svelte.config.ts'));

	if (!hasRoutes || (!hasStatic && !hasSvelteConfig)) {
		console.error(
			'Not a SvelteKit app directory. If in a monorepo, cd into the individual app first.'
		);
		process.exit(1);
	}

	const { created, skipped } = copyFonts(join(cwd, 'static', 'fonts'));

	// Copy layout.css → src/routes/layout.css
	const layoutSrc = join(assetsDir, 'layout.css');
	const layoutDest = join(cwd, 'src', 'routes', 'layout.css');

	if (existsSync(layoutDest)) {
		skipped.push('src/routes/layout.css');
	} else {
		copyFileSync(layoutSrc, layoutDest);
		created.push('src/routes/layout.css');
	}

	printSummary(created, skipped);

	if (created.length) {
		console.log('Import layout.css from your root +layout.svelte:');
		console.log("  import './layout.css';");
		console.log();
	}
}

// --- Workspace mode (-w / --workspace) ---

function parseArgs() {
	const args = process.argv.slice(2);
	const opts = { workspace: false, packagesDir: null, themeName: null, force: false };

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case '-w':
			case '--workspace':
				opts.workspace = true;
				break;
			case '--packages-dir':
				opts.packagesDir = args[++i];
				break;
			case '--theme-name':
				opts.themeName = args[++i];
				break;
			case '--force':
				opts.force = true;
				break;
		}
	}

	return opts;
}

function findWorkspaceRoot(startDir) {
	let dir = startDir;
	while (true) {
		const pkgPath = join(dir, 'package.json');
		if (existsSync(pkgPath)) {
			const pkg = readJson(pkgPath);
			if (pkg.workspaces) {
				return { root: dir, pkg, pkgPath };
			}
		}
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}

function resolvePackagesDir(workspacePkg, overrideDir) {
	if (overrideDir) return overrideDir;

	const workspaces = workspacePkg.workspaces;
	const globs = Array.isArray(workspaces) ? workspaces : workspaces.packages || [];

	for (const glob of globs) {
		// Extract the top-level directory from glob patterns like "packages/*" or "apps/*"
		const topDir = glob.split('/')[0];
		if (topDir && topDir !== '*' && topDir !== '**') {
			return topDir;
		}
	}

	return 'packages';
}

function detectScope(rootPkg, rootDir, packagesDir) {
	// Try root package.json name first
	if (rootPkg.name && rootPkg.name.startsWith('@')) {
		return rootPkg.name.split('/')[0];
	}

	// Try existing packages
	const pkgsPath = join(rootDir, packagesDir);
	if (existsSync(pkgsPath)) {
		for (const entry of readdirSync(pkgsPath)) {
			const pkgPath = join(pkgsPath, entry, 'package.json');
			if (existsSync(pkgPath)) {
				const pkg = readJson(pkgPath);
				if (pkg.name && pkg.name.startsWith('@')) {
					return pkg.name.split('/')[0];
				}
			}
		}
	}

	return null;
}

function findSvelteKitApps(rootDir, workspacePkg) {
	const workspaces = workspacePkg.workspaces;
	const globs = Array.isArray(workspaces) ? workspaces : workspaces.packages || [];
	const apps = [];

	for (const glob of globs) {
		const dir = glob.replace(/\/\*$/, '');
		const fullDir = join(rootDir, dir);
		if (!existsSync(fullDir)) continue;

		for (const entry of readdirSync(fullDir)) {
			const appDir = join(fullDir, entry);
			if (isSvelteKitApp(appDir)) {
				apps.push({ dir: appDir, name: entry, pkgDir: `${dir}/${entry}` });
			}
		}
	}

	return apps;
}

function runWorkspace(opts) {
	const ws = findWorkspaceRoot(cwd);
	if (!ws) {
		console.error('Could not find a workspace root (no package.json with "workspaces" field).');
		console.error('Run this from within a workspace, or use without -w for a single app.');
		process.exit(1);
	}

	const { root, pkg: rootPkg, pkgPath: rootPkgPath } = ws;
	console.log(`Workspace root: ${root}`);

	const packagesDir = resolvePackagesDir(rootPkg, opts.packagesDir);
	const themeName = opts.themeName || 'theme';
	const scope = detectScope(rootPkg, root, packagesDir);
	const themePkgName = scope ? `${scope}/${themeName}` : themeName;
	const themeDir = join(root, packagesDir, themeName);

	// Check if theme package already exists
	if (existsSync(themeDir) && !opts.force) {
		console.error(`Theme package already exists at ${packagesDir}/${themeName}/`);
		console.error('Use --force to overwrite.');
		process.exit(1);
	}

	const created = [];
	const skipped = [];

	// Create theme package directory
	mkdirSync(themeDir, { recursive: true });

	// Create theme package.json
	const themePkg = {
		name: themePkgName,
		version: '0.0.0',
		private: true,
		type: 'module',
		exports: {
			'./styles': './styles.css'
		}
	};
	writeJson(join(themeDir, 'package.json'), themePkg);
	created.push(`${packagesDir}/${themeName}/package.json`);

	// Create styles.css with relative font paths
	const layoutCss = readFileSync(join(assetsDir, 'layout.css'), 'utf-8');
	const stylesCss = layoutCss.replace(/url\('\/fonts\//g, "url('./fonts/");
	writeFileSync(join(themeDir, 'styles.css'), stylesCss);
	created.push(`${packagesDir}/${themeName}/styles.css`);

	// Copy fonts
	const fontResult = copyFonts(join(themeDir, 'fonts'));
	for (const f of fontResult.created) created.push(`${packagesDir}/${themeName}/${f}`);
	for (const f of fontResult.skipped) skipped.push(`${packagesDir}/${themeName}/${f}`);

	// Find SvelteKit apps and add dependency
	const apps = findSvelteKitApps(root, rootPkg);
	const updatedApps = [];

	for (const app of apps) {
		const appPkgPath = join(app.dir, 'package.json');
		const appPkg = readJson(appPkgPath);

		if (!appPkg.dependencies) appPkg.dependencies = {};

		if (appPkg.dependencies[themePkgName]) {
			skipped.push(`${app.pkgDir}/package.json (already has ${themePkgName})`);
			continue;
		}

		appPkg.dependencies[themePkgName] = 'workspace:*';

		// Sort dependencies alphabetically
		appPkg.dependencies = Object.fromEntries(
			Object.entries(appPkg.dependencies).sort(([a], [b]) => a.localeCompare(b))
		);

		writeJson(appPkgPath, appPkg);
		created.push(`${app.pkgDir}/package.json (added ${themePkgName})`);
		updatedApps.push(app);
	}

	printSummary(created, skipped);

	// Print instructions
	if (apps.length === 0) {
		console.log('No SvelteKit apps found in the workspace.');
		console.log('The theme package was created — add it as a dependency manually when ready.');
	} else {
		console.log('Next steps:');
		console.log();
		console.log('  1. Install dependencies:');
		console.log('     bun install');
		console.log();
		console.log(`  2. Import the theme in each app's root +layout.svelte:`);
		console.log(`     import '${themePkgName}/styles';`);
	}

	console.log();
}

// --- Entry point ---

const opts = parseArgs();

if (opts.workspace) {
	runWorkspace(opts);
} else {
	runSingleApp();
}
