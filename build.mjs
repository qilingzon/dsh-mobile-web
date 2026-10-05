#!/usr/bin/env node
/**
 * Build `lib/client.js` from `src/mobile.css` + `src/mobile.js`.
 *
 * Why a build step at all: DSH loads a client plugin as a single bundle file
 * (`exports["./client"]`) whose content is served to the browser, so the
 * stylesheet has to travel inside it. Keeping the CSS and JS in `src/` as
 * ordinary readable files means they can be linted, diffed and unit-tested
 * directly; this script only concatenates and escapes them.
 *
 * The CSS is emitted with JSON.stringify, which sidesteps every backtick and
 * `${}` escaping hazard a template literal would introduce.
 *
 * Usage: node build.mjs [--check]
 *   --check  exit 1 if lib/client.js is out of date (for CI / tests)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const check = process.argv.includes('--check')

const css = readFileSync(join(root, 'src/mobile.css'), 'utf8')
const js = readFileSync(join(root, 'src/mobile.js'), 'utf8')

// The bundle format DSH's client module loader expects: a lazy-CJS factory
// registered on window.__ModuleLoader__. See @deepseek-ai/dsh-client-modules.
const banner = `/*
 * dsh-mobile-web — GENERATED FILE, do not edit.
 * Source: src/mobile.css + src/mobile.js   Regenerate: node build.mjs
 */
window.__ModuleLoader__.load({
\tid: "dsh-mobile-web",
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

\t\t/* The stylesheet, handed to the behaviour half for injection. */
\t\twindow.__DSH_MW_CSS__ = ${JSON.stringify(css)};

/* ==== src/mobile.js ================================================== */
${js}
/* ==== end src/mobile.js ============================================== */

\t\t/*
\t\t * The work already happened when this factory ran, which is as early as
\t\t * the loader allows. apply() therefore has nothing left to do; it is
\t\t * exported only because a client plugin must present a cordis shape.
\t\t */
\t\texports.apply = function apply() {};
\t\texports.inject = [];
\t\texports.name = "mobile-web";
\t\treturn module.exports;
\t}
});
`

const outPath = join(root, 'lib/client.js')

if (check) {
	if (!existsSync(outPath)) {
		console.error('build:check: lib/client.js is missing — run `node build.mjs`')
		process.exit(1)
	}
	if (readFileSync(outPath, 'utf8') !== banner) {
		console.error('build:check: lib/client.js is out of date — run `node build.mjs`')
		process.exit(1)
	}
	console.log('build:check: lib/client.js is up to date')
	process.exit(0)
}

writeFileSync(outPath, banner)
console.log(`built lib/client.js (${banner.length} bytes: ${css.length} css + ${js.length} js)`)
