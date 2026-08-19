# CXGRD Blast Radius Check

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-CXGRD%20Blast%20Radius%20Check-blue?logo=github)](https://github.com/marketplace)

Run [CXGRD](https://www.cxgrd.com) in GitHub Actions to analyze a repository's dependency graph, calculate blast radius, and publish the result as a pull request comment.

CXGRD is designed for teams using AI-assisted development. It makes the likely impact of a change visible during review so maintainers can investigate high-risk changes before merging.

## What the action does

The action performs these steps in the repository workspace:

1. Installs the repository's npm dependencies with `npm ci`.
2. Installs the CXGRD CLI globally.
3. Builds or refreshes the dependency graph with `cxgrd scan`.
4. Runs `cxgrd check --json`.
5. Creates or updates a pull request comment with the risk level and affected files.

The comment is updated on subsequent workflow runs instead of creating a new comment each time.

## Quick start

Create `.github/workflows/cxgrd.yml`:

```yaml
name: CXGRD

on:
	pull_request:

permissions:
	contents: read
	issues: write
	pull-requests: write

jobs:
	cxgrd:
		name: Analyze blast radius
		runs-on: ubuntu-latest
		steps:
			- name: Check out repository
				uses: actions/checkout@v4

			- name: Run CXGRD
				uses: cxgrd/cxgrd-action@main
				with:
					fail-on: critical
```

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `token` | No | None | CXGRD API token. Required only for authenticated Team-plan CI enforcement. |
| `fail-on` | No | `critical` | Risk level intended to fail CI: `low`, `medium`, `high`, or `critical`. |
| `working-directory` | No | `.` | Repository directory to analyze, relative to the GitHub workspace. |

The action runs the standard `cxgrd check --json` command. The `token` and `fail-on` inputs are exposed for CI enforcement support. 

> The CI enforcement requires [CXGRD Team](https://www.cxgrd.com/pricing)

## Authentication

Authentication is optional for the local structural and compiler checks. For Team-plan CI enforcement, provide the token from a repository or organization secret:

```yaml
- name: Run CXGRD
	uses: cxgrd/cxgrd-action@main
	with:
		token: ${{ secrets.CXGRD_TOKEN }}
		fail-on: high
```

Do not hard-code tokens in workflow files. Create `CXGRD_TOKEN` under **Settings > Secrets and variables > Actions**.

> Read more about Team CI [here](https://docs.cxgrd.com/team)

## Repository requirements

- The analyzed directory must contain a valid `package-lock.json`, because the action runs `npm ci` there.
- `working-directory` must contain the repository's `package.json` and `package-lock.json` when analyzing a repository fixture or checkout in a subdirectory.
- The checkout should include full history (`fetch-depth: 0`) because the current CLI compares changes with `origin/main`.
- The runner must have Node.js and npm available. `ubuntu-latest` provides both.
- The workflow must check out the repository before invoking the action.
- Pull request comment permissions are required for the reporting step. If the repository uses restricted fork permissions, configure the workflow permissions and event policy accordingly.

## Pull request permissions

The included reporting step uses the GitHub API to list, update, and create issue comments. These permissions are sufficient for the standard pull request workflow:

```yaml
permissions:
	contents: read
	issues: write
	pull-requests: write
```

For workflows running on `pull_request` from forks, GitHub may reduce the available write permissions. Review your repository's fork and security settings before enabling comment updates for untrusted code.

## Local troubleshooting

If the action fails with a missing graph error, verify that the repository can be scanned locally:

```bash
npm ci
npm install --global cxgrd
cxgrd scan
cxgrd check --json
```

## Testing the action

The action repository includes a small fixture at `test/fixture`. The test workflow checks out the action and fixture together, creates a separate Git baseline inside the fixture, changes one source file, and runs the local action against it:

```yaml
- uses: ./
	with:
		working-directory: test/fixture
```

For a separate test repository, check it out into a subdirectory and pass that directory to `working-directory`:

```yaml
- uses: actions/checkout@v4
	with:
		repository: OWNER/REPOSITORY
		path: test-repo

- uses: cxgrd/cxgrd-action@main
	with:
		working-directory: test-repo
```

The action writes the JSON check result to `result.json` in the workspace before the comment is generated. Inspect the workflow logs and that file when diagnosing a failed run.

## Related documentation

- [CXGRD CLI documentation](https://docs.cxgrd.com)
- [CXGRD website](https://www.cxgrd.com)
- [GitHub Actions workflow syntax](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)

## License

This action is released under the [MIT License](LICENSE).
