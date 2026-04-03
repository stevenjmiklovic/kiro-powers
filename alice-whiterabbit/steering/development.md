# ALICE CLI — Development Guide

## Project Structure

```
alice-cli/
├── pyproject.toml              # Poetry config, dependencies, tool settings
├── poetry.lock
└── src/alice_cli/
    ├── cli.py                  # Click group, global options, command registration
    ├── commands/               # One file per verb (20+ commands)
    ├── auth.py                 # JHED detection from STS
    ├── secrets.py              # Secrets Manager retrieval
    ├── config.py               # Configuration resolution and precedence
    ├── store.py                # Persistent credential storage (~/.alice/)
    ├── locker.py               # CloudLocker (S3 + local session storage)
    ├── session_record.py       # Session serialization
    ├── error_handler.py        # AWS error extraction and user-friendly messages
    ├── retry.py                # Tenacity retry decorators for AWS calls
    ├── logging.py              # Structlog configuration (--debug mode)
    ├── console.py              # Rich stderr helpers
    ├── personality.py          # All user-facing text and messaging
    ├── models.py               # Dataclasses, enums, model aliases
    ├── errors.py               # Error hierarchy
    ├── formatting.py           # Output formatters (export, eval, dotenv, json)
    ├── validators.py           # Dependency checks
    ├── pricing.py              # Model pricing table
    ├── agentcore_config.py     # AgentCore runtime config persistence
    └── tui/                    # Optional Textual TUI
        ├── app.py
        └── theme.py
```

## Development Setup

```bash
cd alice-cli
poetry install --extras tui
poetry install --extras agentcore
```

## Testing

```bash
# Run all tests
poetry run pytest

# With coverage
poetry run pytest --cov=alice_cli --cov-report=term-missing

# Run specific test file
poetry run pytest tests/test_auth.py

# Run tests matching a pattern
poetry run pytest -k "test_invoke"

# Run benchmarks
poetry run pytest tests/benchmarks/ --benchmark-only
```

Tests use pytest, hypothesis (property-based testing), pytest-mock, and moto (AWS service mocking).

## Linting and Formatting

```bash
# Ruff lint check
poetry run ruff check src/ tests/

# Ruff auto-fix
poetry run ruff check --fix src/ tests/

# Ruff format
poetry run ruff format src/ tests/
```

Ruff config: Python 3.12 target, 100-char line length. Rules: E, F, I, N, UP, B, SIM, TCH.

## Type Checking

```bash
poetry run mypy src/alice_cli/
```

Strict mode enabled. Some modules with optional extras have `ignore_errors = true`.

## Security Scanning

```bash
poetry run bandit -r src/alice_cli/
poetry run detect-secrets scan
```

## Changelog Management

Uses towncrier for changelog entries:

```bash
# Create a changelog fragment
echo "Added new feature" > changes/123.feature

# Build changelog
poetry run towncrier build --version 0.3.0
```

Fragment types: `feature`, `bugfix`, `deprecation`, `breaking`, `doc`, `misc`.

## Adding a New Command

1. Create `src/alice_cli/commands/your_command.py`
2. Define a Click command function
3. Register it in `src/alice_cli/cli.py`
4. Add tests in `tests/test_your_command.py`
5. Add a changelog fragment in `changes/`

## Key Conventions

- All user-facing text lives in `personality.py`
- Status messages go to stderr (via `console.py`), data to stdout
- AWS calls use retry decorators from `retry.py`
- Errors use the hierarchy in `errors.py` and are formatted by `error_handler.py`
- Configuration follows precedence: CLI flag > env var > stored credentials > default
- Model aliases are defined in `models.py`
