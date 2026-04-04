#!/usr/bin/env python3
"""Structural validation for the alice-whiterabbit Kiro Power.

Checks:
- POWER.md frontmatter has required fields and non-empty keywords
- All steering files have valid YAML frontmatter
- fileMatch patterns match at least one file in the consuming workspace

Usage:
    python scripts/validate-power.py [--workspace /path/to/jhu-aws-iac-ALICE]

Exit codes: 0 = all checks pass, 1 = one or more checks failed.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML required. Install: pip install pyyaml", file=sys.stderr)
    sys.exit(2)


@dataclass
class ValidationResult:
    file: str
    check: str
    passed: bool
    detail: str = ""


def extract_frontmatter(md_path: Path) -> dict | None:
    """Extract YAML frontmatter from a markdown file.

    Returns parsed dict if valid frontmatter found, None otherwise.
    No filesystem mutations.
    """
    text = md_path.read_text("utf-8")
    if not text.startswith("---"):
        return None
    end = text.find("---", 3)
    if end == -1:
        return None
    try:
        result = yaml.safe_load(text[3:end])
        return result if isinstance(result, dict) else None
    except yaml.YAMLError:
        return None


def check_required_fields(
    fm: dict | None, fields: list[str], filename: str
) -> ValidationResult:
    """Check that all required fields are present in frontmatter."""
    if fm is None:
        return ValidationResult(filename, "required_fields", False, "no frontmatter")
    missing = [f for f in fields if f not in fm]
    return ValidationResult(
        filename,
        "required_fields",
        len(missing) == 0,
        f"missing: {missing}" if missing else "",
    )


def validate_power(
    power_dir: Path, workspace_dir: Path | None = None
) -> list[ValidationResult]:
    """Validate all structural properties of the power.

    Args:
        power_dir: Path to alice-whiterabbit/ directory.
        workspace_dir: Path to consuming workspace (jhu-aws-iac-ALICE/).
                       If None, fileMatch pattern checks are skipped.

    Returns:
        List of ValidationResult for each check performed.
    """
    results: list[ValidationResult] = []

    # 1. Validate POWER.md frontmatter
    power_md = power_dir / "POWER.md"
    if not power_md.exists():
        results.append(ValidationResult("POWER.md", "exists", False, "file not found"))
        return results

    fm = extract_frontmatter(power_md)
    results.append(
        check_required_fields(
            fm, ["name", "displayName", "description", "keywords", "author"], "POWER.md"
        )
    )

    # Keywords non-empty
    if fm and isinstance(fm.get("keywords"), list):
        results.append(
            ValidationResult(
                "POWER.md",
                "keywords_nonempty",
                len(fm["keywords"]) > 0,
            )
        )
        # Keywords lowercase
        non_lower = [k for k in fm["keywords"] if k != k.lower()]
        results.append(
            ValidationResult(
                "POWER.md",
                "keywords_lowercase",
                len(non_lower) == 0,
                f"not lowercase: {non_lower}" if non_lower else "",
            )
        )
    else:
        results.append(
            ValidationResult("POWER.md", "keywords_nonempty", False, "keywords missing or not a list")
        )

    # 2. Validate each steering file
    steering_dir = power_dir / "steering"
    if not steering_dir.exists():
        results.append(ValidationResult("steering/", "exists", False, "directory not found"))
        return results

    for md_file in sorted(steering_dir.glob("*.md")):
        sfm = extract_frontmatter(md_file)

        results.append(
            ValidationResult(md_file.name, "valid_frontmatter", sfm is not None)
        )

        # If fileMatch, validate pattern matches files
        if sfm and sfm.get("inclusion") == "fileMatch" and workspace_dir:
            pattern = sfm.get("fileMatchPattern", "")
            matches = [m for m in workspace_dir.glob(pattern) if m.is_file()]
            results.append(
                ValidationResult(
                    md_file.name,
                    "filematch_has_targets",
                    len(matches) > 0,
                    f"pattern='{pattern}' matched {len(matches)} files",
                )
            )

    return results


def main() -> int:
    """CLI entry point. Returns 0 on success, 1 on failure."""
    import argparse

    parser = argparse.ArgumentParser(description="Validate alice-whiterabbit power")
    parser.add_argument(
        "--workspace",
        type=Path,
        default=None,
        help="Path to consuming workspace (jhu-aws-iac-ALICE/) for fileMatch validation",
    )
    parser.add_argument(
        "--power-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
        help="Path to alice-whiterabbit/ directory",
    )
    args = parser.parse_args()

    results = validate_power(args.power_dir, args.workspace)

    for r in results:
        status = "\u2713" if r.passed else "\u2717"
        detail = f" {r.detail}" if r.detail else ""
        print(f"  {status} {r.file}: {r.check}{detail}")

    failures = [r for r in results if not r.passed]
    print()
    if failures:
        print(f"{len(failures)} check(s) failed")
        return 1
    else:
        print(f"All {len(results)} checks passed")
        return 0


if __name__ == "__main__":
    sys.exit(main())
