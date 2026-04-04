"""Tests for validate-power.py — unit tests, property tests, and integration test."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
import yaml

# Add scripts dir to path so we can import the module
sys.path.insert(0, str(Path(__file__).resolve().parent))
from importlib import import_module

validate_mod = import_module("validate-power")
extract_frontmatter = validate_mod.extract_frontmatter
check_required_fields = validate_mod.check_required_fields
validate_power = validate_mod.validate_power
ValidationResult = validate_mod.ValidationResult


# ---------------------------------------------------------------------------
# Unit tests: extract_frontmatter
# ---------------------------------------------------------------------------

class TestExtractFrontmatter:
    def test_valid_frontmatter(self, tmp_path: Path):
        f = tmp_path / "test.md"
        f.write_text("---\nname: foo\nvalue: 42\n---\n# Content")
        result = extract_frontmatter(f)
        assert result == {"name": "foo", "value": 42}

    def test_missing_frontmatter(self, tmp_path: Path):
        f = tmp_path / "test.md"
        f.write_text("# No frontmatter here")
        assert extract_frontmatter(f) is None

    def test_invalid_yaml(self, tmp_path: Path):
        f = tmp_path / "test.md"
        f.write_text("---\n: invalid: [yaml\n---\n# Content")
        assert extract_frontmatter(f) is None

    def test_no_closing_delimiter(self, tmp_path: Path):
        f = tmp_path / "test.md"
        f.write_text("---\nname: foo\n# No closing delimiter")
        assert extract_frontmatter(f) is None

    def test_empty_frontmatter(self, tmp_path: Path):
        f = tmp_path / "test.md"
        f.write_text("---\n---\n# Content")
        # yaml.safe_load of empty string returns None
        assert extract_frontmatter(f) is None

    def test_scalar_frontmatter_returns_none(self, tmp_path: Path):
        f = tmp_path / "test.md"
        f.write_text("---\njust a string\n---\n# Content")
        assert extract_frontmatter(f) is None


# ---------------------------------------------------------------------------
# Unit tests: check_required_fields
# ---------------------------------------------------------------------------

class TestCheckRequiredFields:
    def test_all_present(self):
        fm = {"name": "x", "version": "1"}
        result = check_required_fields(fm, ["name", "version"], "test.md")
        assert result.passed is True

    def test_partial(self):
        fm = {"name": "x"}
        result = check_required_fields(fm, ["name", "version"], "test.md")
        assert result.passed is False
        assert "version" in result.detail

    def test_none_input(self):
        result = check_required_fields(None, ["name"], "test.md")
        assert result.passed is False
        assert "no frontmatter" in result.detail

    def test_empty_fields_list(self):
        result = check_required_fields({"a": 1}, [], "test.md")
        assert result.passed is True


# ---------------------------------------------------------------------------
# Unit tests: validate_power (with mock power directory)
# ---------------------------------------------------------------------------

class TestValidatePower:
    def _create_power(self, tmp_path: Path, keywords: list[str] | None = None) -> Path:
        """Create a minimal valid power directory."""
        power_dir = tmp_path / "power"
        steering_dir = power_dir / "steering"
        steering_dir.mkdir(parents=True)

        kw = keywords or ["alice", "bedrock"]
        kw_yaml = "\n".join(f"  - {k}" for k in kw)
        (power_dir / "POWER.md").write_text(
            f"---\nname: test\ndisplayName: Test\ndescription: A test\n"
            f"keywords:\n{kw_yaml}\nauthor: Tester\n---\n# Test"
        )
        (steering_dir / "dev.md").write_text(
            '---\ninclusion: fileMatch\nfileMatchPattern: "src/**"\n---\n# Dev'
        )
        (steering_dir / "manual.md").write_text(
            "---\ninclusion: manual\n---\n# Manual"
        )
        return power_dir

    def test_valid_power_no_workspace(self, tmp_path: Path):
        power_dir = self._create_power(tmp_path)
        results = validate_power(power_dir, workspace_dir=None)
        assert all(r.passed for r in results)

    def test_valid_power_with_workspace(self, tmp_path: Path):
        power_dir = self._create_power(tmp_path)
        # Create workspace with matching files
        ws = tmp_path / "workspace"
        (ws / "src" / "main.py").parent.mkdir(parents=True)
        (ws / "src" / "main.py").write_text("# code")
        results = validate_power(power_dir, workspace_dir=ws)
        assert all(r.passed for r in results)

    def test_filematch_no_matches(self, tmp_path: Path):
        power_dir = self._create_power(tmp_path)
        ws = tmp_path / "empty_workspace"
        ws.mkdir()
        results = validate_power(power_dir, workspace_dir=ws)
        filematch_results = [r for r in results if r.check == "filematch_has_targets"]
        assert any(not r.passed for r in filematch_results)

    def test_missing_power_md(self, tmp_path: Path):
        power_dir = tmp_path / "power"
        power_dir.mkdir()
        results = validate_power(power_dir)
        assert any(not r.passed for r in results)

    def test_invalid_steering_frontmatter(self, tmp_path: Path):
        power_dir = self._create_power(tmp_path)
        (power_dir / "steering" / "bad.md").write_text("# No frontmatter")
        results = validate_power(power_dir)
        bad_results = [r for r in results if r.file == "bad.md"]
        assert any(not r.passed for r in bad_results)

    def test_non_lowercase_keywords(self, tmp_path: Path):
        power_dir = self._create_power(tmp_path, keywords=["Alice", "BEDROCK"])
        results = validate_power(power_dir)
        kw_results = [r for r in results if r.check == "keywords_lowercase"]
        assert any(not r.passed for r in kw_results)


# ---------------------------------------------------------------------------
# Property tests (hypothesis)
# ---------------------------------------------------------------------------

try:
    from hypothesis import given, settings, strategies as st

    @given(data=st.dictionaries(
        keys=st.text(min_size=1, max_size=20, alphabet="abcdefghijklmnopqrstuvwxyz_"),
        values=st.one_of(st.text(max_size=50), st.integers(), st.booleans()),
        min_size=1,
        max_size=5,
    ))
    @settings(max_examples=50)
    def test_prop_frontmatter_roundtrip(tmp_path_factory, data: dict):
        """Property 1: Frontmatter extraction round-trip."""
        tmp_path = tmp_path_factory.mktemp("prop")
        yaml_str = yaml.dump(data, default_flow_style=False)
        f = tmp_path / "test.md"
        f.write_text(f"---\n{yaml_str}---\n# Content")
        result = extract_frontmatter(f)
        assert result is not None
        for key in data:
            assert key in result
            assert result[key] == data[key]

    @given(
        fm_keys=st.lists(st.text(min_size=1, max_size=10, alphabet="abcdefghij"), min_size=1, max_size=5, unique=True),
        required=st.lists(st.text(min_size=1, max_size=10, alphabet="abcdefghij"), min_size=1, max_size=5, unique=True),
    )
    @settings(max_examples=50)
    def test_prop_required_fields_detection(fm_keys: list[str], required: list[str]):
        """Property 2: check_required_fields returns passed=True iff all required fields present."""
        fm = {k: "v" for k in fm_keys}
        result = check_required_fields(fm, required, "test.md")
        all_present = all(r in fm for r in required)
        assert result.passed == all_present

    def test_prop_keywords_lowercase():
        """Property 4: All keywords in POWER.md are lowercase."""
        power_md = Path(__file__).resolve().parent.parent / "POWER.md"
        if not power_md.exists():
            pytest.skip("POWER.md not found")
        fm = extract_frontmatter(power_md)
        assert fm is not None
        keywords = fm.get("keywords", [])
        for kw in keywords:
            assert kw == kw.lower(), f"Keyword not lowercase: {kw}"

except ImportError:
    pass  # hypothesis not available, skip property tests


# ---------------------------------------------------------------------------
# Token efficiency: steering file length limits
# ---------------------------------------------------------------------------

STEERING_MAX_LINES = 200
POWER_MD_MAX_LINES = 500


class TestSteeringFileLengths:
    """Ensure steering files stay short enough for agent token efficiency."""

    STEERING_DIR = Path(__file__).resolve().parent.parent / "steering"

    def test_steering_files_under_limit(self):
        for md in sorted(self.STEERING_DIR.glob("*.md")):
            lines = md.read_text("utf-8").splitlines()
            assert len(lines) <= STEERING_MAX_LINES, (
                f"{md.name} is {len(lines)} lines (max {STEERING_MAX_LINES})"
            )

    def test_power_md_under_limit(self):
        power_md = self.STEERING_DIR.parent / "POWER.md"
        lines = power_md.read_text("utf-8").splitlines()
        assert len(lines) <= POWER_MD_MAX_LINES, (
            f"POWER.md is {len(lines)} lines (max {POWER_MD_MAX_LINES})"
        )


# ---------------------------------------------------------------------------
# Integration test against real workspace
# ---------------------------------------------------------------------------

POWER_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = Path("/Users/stevenm/jhu.edu/jhu-aws-iac-ALICE")


@pytest.mark.skipif(
    not WORKSPACE_DIR.exists(),
    reason="Consuming workspace not found at expected path",
)
def test_integration_real_workspace():
    """Integration: validate_power against actual power and workspace."""
    results = validate_power(POWER_DIR, WORKSPACE_DIR)
    failures = [r for r in results if not r.passed]
    assert not failures, f"Validation failures: {failures}"
    assert len(results) >= 10, f"Expected at least 10 checks, got {len(results)}"
