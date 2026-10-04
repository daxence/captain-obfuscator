// Syncs package.json's version and CHANGELOG.md with a published GitHub
// release. Used by the release-sync workflow since main is rule-protected
// and semantic-release can no longer push this commit directly.
import { readFileSync, writeFileSync } from "node:fs";

const tagName = process.env.TAG_NAME;
const releaseBody = process.env.RELEASE_BODY ?? "";
const releaseDate = (process.env.RELEASE_DATE ?? new Date().toISOString()).slice(0, 10);

if (!tagName) {
  throw new Error("TAG_NAME env var is required");
}

const version = tagName.replace(/^v/, "");

const pkgPath = "package.json";
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
if (pkg.version === version) {
  console.warn(`package.json already at ${version}, skipping`);
} else {
  pkg.version = version;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.warn(`package.json version set to ${version}`);
}

const changelogPath = "CHANGELOG.md";
const changelog = readFileSync(changelogPath, "utf8");
const heading = `## [${version}] - ${releaseDate}`;

if (changelog.includes(heading)) {
  console.warn(`CHANGELOG.md already has an entry for ${version}, skipping`);
} else {
  const [intro, ...rest] = changelog.split(/\n(?=## \[)/);
  const entry = `${heading}\n\n${releaseBody.trim()}\n`;
  const updated = [intro.trimEnd(), entry, ...rest].join("\n\n");
  writeFileSync(changelogPath, `${updated.trimEnd()}\n`);
  console.warn(`CHANGELOG.md updated with ${version} entry`);
}
