export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      // npm only refreshes the package README on publish
      { releaseRules: [{ type: "docs", scope: "readme", release: "patch" }] },
    ],
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    ["@semantic-release/github", { labels: false }],
  ],
};
