---
name: "alice-whiterabbit"
displayName: "JHU White Rabbit"
description: "Guide to ALICE (AWS Language Intelligence and Cognitive Exploration) — manage Bedrock credentials, invoke LLMs, and use AI research utilities at Johns Hopkins"
keywords: ["alice-cli", "bedrock", "llm-research", "jhu", "alice"]
author: "Steven J Miklovic, Johns Hopkins DRCC"
---

# White Rabbit

## Overview

ALICE (AWS Language Intelligence and Cognitive Exploration) is a Python CLI tool for GenAI research at Johns Hopkins. It manages AWS Bedrock credentials, invokes foundation models (Claude, Nova, Mistral, DeepSeek), and provides multi-model comparison, batch processing, session history, and cost tracking.

Built with Click, boto3, Rich, and Textual. Packaged with Poetry. Requires Python 3.12+ and an AWS SSO profile.

## Available Steering Files

- **research-prompts** — Prompt recipes for academic tasks: summarization, literature reviews, metadata generation, citation management, and batch processing
- **model-selection** — Choosing the right Bedrock model for research tasks, cost-aware patterns, and a task-to-model quick reference
- **development** — Developer workflows: testing, linting, type checking, project structure, and contribution patterns

## Onboarding

### Prerequisites

- Python 3.12+
- AWS CLI configured with an SSO profile (e.g. `drcc-ai`)
- Active SSO session: `aws sso login --profile <PROFILE>`
- Poetry (for development installs)

### Installation

```bash
cd alice-cli

# Standard install
poetry install

# With TUI support (full-screen terminal UI)
poetry install --extras tui

# With AgentCore support
poetry install --extras agentcore

# Isolated install via pipx
pipx install .
pipx install ".[tui]"
```

One-off use without installing:

```bash
uvx --from ./alice-cli alice env --profile myprofile
```

### First-Time Setup

```bash
# 1. Authenticate — fetches Bedrock API key, stores credentials to ~/.alice/
alice auth --profile <PROFILE>

# 2. Verify — shows SSO state, identity, region, namespace
alice status

# 3. Export credentials into your shell
eval $(alice env --eval)
```

After the first `alice auth`, most commands work without `--profile`.

### Shell Completion

```bash
alice install-completion
```

Installs tab completion for bash, zsh, fish, or PowerShell. Restart your shell afterward.

## Common Workflows

### Authentication and Credentials

```bash
# Standard auth (detects JHED from SSO, fetches API key, saves to ~/.alice/)
alice auth --profile <PROFILE>

# API key mode (skip SSO entirely)
alice auth --api-key <SECRET_KEY>

# Export credentials
eval $(alice env --eval)       # shell variables
alice env --env-file           # .env format
alice env --json               # raw JSON
```

### Invoking Models

```bash
# Single prompt
alice invoke "Explain the Krebs cycle"

# Specify model
alice invoke --model-id opus "Summarize this paper"

# Multi-turn chat
alice chat
alice chat --model-id nova-pro
```

Default model: `sonnet` → `us.anthropic.claude-sonnet-4-6`. Use `alice list-aliases` to see all aliases.

### Multi-Model Operations

```bash
# Compare responses across models
alice compare "What is entropy?" --models sonnet,nova-pro,mistral-large

# Two-model debate
alice dialog "Best programming language?" --models sonnet,nova-pro

# Batch prompts from CSV
alice batch prompts.csv

# Summarize a file or stdin
alice summarize paper.pdf
cat notes.txt | alice summarize -
```

### Session History and Costs

```bash
alice recall                   # browse all sessions
alice recall --type chat       # filter by type
alice recall --model sonnet    # filter by model
alice appraise                 # view token usage and costs
```

Sessions are stored in S3 (CloudLocker) with local fallback under `~/.alice/locker/`.

### Secrets Management

```bash
alice get-secret               # your own Bedrock API key
alice get-secret myapp-config  # short name (auto-prefixes namespace/environment)
alice list-secrets             # list all secrets under namespace/environment
```

### Quota

```bash
alice quota                    # your token usage and remaining quota
alice quota --jhed someuser    # check another user
```

### Claude Code Integration

```bash
# One-step: auth + launch Claude Code with Bedrock credentials
alice auth --profile <PROFILE> --claude

# After first run, just:
alice auth --claude
```

### AWS CLI Passthrough

```bash
alice run s3 ls
alice run secretsmanager list-secrets
```

Injects `--region` and `--profile` from alice context automatically.

### TUI Mode

```bash
alice --tui
```

Full-screen terminal UI with amber-on-black retro CRT aesthetic. Requires `poetry install --extras tui`. Recommended font: Source Code Pro or Fira Code.

### Configuration

```bash
alice config    # show resolved config and sources
```

Precedence: CLI flag > environment variable > stored credentials > default.

| Setting | Default | Env var | CLI flag |
|---|---|---|---|
| Profile | — | `AWS_PROFILE` | `--profile` |
| Region | `us-east-1` | — | `--region` |
| Namespace | `drcc` | `ALICE_NAMESPACE` | `--namespace` |
| Environment | `ai` | `ALICE_ENVIRONMENT` | `--environment` |
| API key | — | `BEDROCK_SECRET_KEY` | `--api-key` |

## Global Options

| Option | Default | Description |
|---|---|---|
| `--profile` | `$AWS_PROFILE` | AWS CLI profile |
| `--region` | `us-east-1` | AWS region |
| `--namespace` | `drcc` | Resource namespace |
| `--environment` | `ai` | Deployment environment |
| `--api-key` | `$BEDROCK_SECRET_KEY` | Bedrock API key (skips SSO) |
| `--quiet` | off | Suppress banner and status messages |
| `--debug` | off | Enable structured debug logging to stderr |
| `--personality` | `alice` | Voice personality (`alice`, `mr_rogers`, `shodan`) |
| `--tui` | off | Launch interactive TUI |
| `--version` | — | Print version and exit |

## Command Reference

| Command | Description |
|---|---|
| `alice auth` | Authenticate and store credentials |
| `alice auth --claude` | Authenticate and launch Claude Code |
| `alice env` | Export Bedrock credentials for shell use |
| `alice invoke <prompt>` | Invoke a Bedrock model |
| `alice chat` | Multi-turn conversation |
| `alice batch <file>` | Batch prompts from CSV |
| `alice compare <prompt>` | Compare responses across models |
| `alice dialog <prompt>` | Two-model conversation |
| `alice summarize [file]` | Summarize file or stdin |
| `alice appraise` | View token usage and session costs |
| `alice recall` | Browse session history |
| `alice quota` | View token quota |
| `alice compose` | AgentCore agent wizard |
| `alice get-secret [name]` | Retrieve a secret |
| `alice list-secrets` | List secrets in namespace |
| `alice list-aliases` | Show model alias mappings |
| `alice list-models` | List Bedrock foundation models |
| `alice run <args>` | AWS CLI passthrough |
| `alice config` | Show configuration |
| `alice status` | Health check |
| `alice diagnose` | Diagnostic checks |
| `alice install-completion` | Install shell tab completion |

## Troubleshooting

### Error: "SSO session expired"

**Cause:** AWS SSO token has expired.
**Solution:**
```bash
aws sso login --profile <PROFILE>
alice auth --profile <PROFILE>
```

### Error: "Command not found: alice"

**Cause:** CLI not on PATH after install.
**Solution:**
1. If using Poetry: `poetry shell` or prefix with `poetry run alice`
2. If using pipx: ensure `~/.local/bin` is in your PATH
3. Verify: `which alice`

### Error: "No credentials found"

**Cause:** Haven't run `alice auth` yet, or credentials expired.
**Solution:**
```bash
alice auth --profile <PROFILE>
alice status   # verify
```

### Error: "Access denied" on Bedrock calls

**Cause:** Missing permissions or wrong profile/region.
**Solution:**
1. Verify profile: `alice config`
2. Check region matches your Bedrock setup (default: `us-east-1`)
3. Re-authenticate: `alice auth --profile <PROFILE>`

### Diagnostic Check

```bash
alice diagnose
```

Runs comprehensive checks on SSO session, credentials, connectivity, and configuration.

## Complementary Powers

These Kiro Powers pair well with ALICE but are installed separately:

- **aws-cost-optimization** — Deeper Bedrock spend analysis, pricing lookups, and budget forecasting beyond what `alice appraise` and `alice quota` provide. Useful for teams managing research budgets.
- **aws-observability** — Monitor Bedrock API call patterns, track error rates and latency via CloudWatch. Audit secret access and Bedrock usage via CloudTrail.
- **aws-agentcore** — Direct tool access for deploying and managing AgentCore agents, complementing the `alice compose` wizard.

Install any of these from the Kiro Powers panel to use alongside ALICE.

## Best Practices

- Always run `alice auth` before starting a session to ensure fresh credentials
- Use `alice status` to verify your setup before invoking models
- Use `--quiet` flag when piping output to other commands
- Use `eval $(alice env --eval)` to load credentials into your shell for other tools
- Use `alice appraise` regularly to monitor token usage and costs
- Prefer model aliases (`sonnet`, `opus`, `haiku`) over full model IDs
- Use `alice compare` to evaluate model quality before committing to one