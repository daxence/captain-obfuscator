export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      // npm only refreshes the package README on publish
      { releaseRules: [{ type: "docs", scope: "readme", release: "patch" }] },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    // No @semantic-release/git: main is rule-protected (PRs only), so this
    // plugin's direct "git push" of the version/changelog commit is rejected
    // (GH013). The release-sync workflow opens a PR with those files instead.
    ["@semantic-release/github", { labels: false }],
  ],
};
