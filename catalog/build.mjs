#!/usr/bin/env node

/**
 * Kiro Powers Catalog Builder
 *
 * Scans all power directories, extracts metadata from POWER.md frontmatter
 * and mcp.json files, then generates a static HTML catalog site.
 */

import { readdir, readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "_site");

const MAX_SUMMARY_LENGTH = 300;
const POWER_TYPE_MCP = "Guided MCP Power";
const POWER_TYPE_KB = "Knowledge Base Power";

// Directories to skip (not powers)
const SKIP_DIRS = new Set([
  ".git",
  ".github",
  ".kiro",
  "catalog",
  "_site",
  "node_modules",
]);

/**
 * Parse YAML frontmatter from a markdown file's content.
 * Handles simple scalar values, quoted strings, and arrays.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yaml = match[1];
  const meta = {};

  for (const line of yaml.split("\n")) {
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!kvMatch) continue;

    const [, key, rawValue] = kvMatch;
    let value = rawValue.trim();

    // Handle quoted strings
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Handle inline arrays: ["a", "b", "c"]
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }

    meta[key] = value;
  }

  return meta;
}

/**
 * Extract the first meaningful paragraph from the POWER.md body (after frontmatter).
 */
function extractSummary(content) {
  const body = content.replace(/^---[\s\S]*?---\s*/, "");
  // Find first non-heading, non-empty paragraph
  const lines = body.split("\n");
  let summary = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```"))
      continue;
    summary = trimmed;
    break;
  }
  return summary.slice(0, MAX_SUMMARY_LENGTH);
}

/**
 * Determine the MCP connection type from an mcp.json server entry.
 */
function getMcpConnectionType(serverConfig) {
  if (serverConfig.url) {
    if (serverConfig.url.includes("/sse")) return "SSE";
    return "HTTPS";
  }
  if (serverConfig.command === "docker") return "Docker";
  if (serverConfig.command === "npx") return "NPX";
  if (serverConfig.command === "uvx") return "UVX";
  if (serverConfig.command) return "Command";
  return "Unknown";
}

/**
 * Count files in a directory recursively.
 */
async function countFiles(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (entry.isFile()) count++;
      else if (entry.isDirectory()) {
        count += await countFiles(join(dirPath, entry.name));
      }
    }
    return count;
  } catch {
    return 0;
  }
}

/**
 * Scan a single power directory and extract all metadata.
 */
async function scanPower(dirPath, dirName) {
  const powerMdPath = join(dirPath, "POWER.md");
  const mcpJsonPath = join(dirPath, "mcp.json");
  const steeringPath = join(dirPath, "steering");

  let powerMdContent;
  try {
    powerMdContent = await readFile(powerMdPath, "utf-8");
  } catch {
    return null; // No POWER.md = not a power directory
  }

  const frontmatter = parseFrontmatter(powerMdContent);
  const summary = extractSummary(powerMdContent);
  const powerMdLines = powerMdContent.split("\n").length;

  // Parse mcp.json
  let mcpServers = [];
  let hasMcp = false;
  try {
    const mcpContent = await readFile(mcpJsonPath, "utf-8");
    const mcpJson = JSON.parse(mcpContent);
    hasMcp = true;
    if (mcpJson.mcpServers) {
      for (const [name, config] of Object.entries(mcpJson.mcpServers)) {
        mcpServers.push({
          name,
          type: getMcpConnectionType(config),
          hasEnvVars: !!(config.env && Object.keys(config.env).length > 0),
        });
      }
    }
  } catch {
    // No mcp.json
  }

  // Check steering directory
  let steeringFiles = [];
  try {
    const steeringStat = await stat(steeringPath);
    if (steeringStat.isDirectory()) {
      const files = await readdir(steeringPath);
      steeringFiles = files.filter((f) => f.endsWith(".md"));
    }
  } catch {
    // No steering directory
  }

  const powerType = hasMcp ? POWER_TYPE_MCP : POWER_TYPE_KB;

  return {
    id: dirName,
    name: frontmatter.displayName || frontmatter.name || dirName,
    description: frontmatter.description || summary || "",
    author: frontmatter.author || "Community",
    keywords: Array.isArray(frontmatter.keywords)
      ? frontmatter.keywords
      : frontmatter.keywords
        ? [frontmatter.keywords]
        : [],
    type: powerType,
    mcpServers,
    steeringCount: steeringFiles.length,
    docLines: powerMdLines,
  };
}

/**
 * Scan all power directories in the repository root.
 */
async function scanAllPowers() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const powers = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    // Skip hidden directories
    if (entry.name.startsWith(".")) continue;

    const power = await scanPower(join(ROOT, entry.name), entry.name);
    if (power) powers.push(power);
  }

  powers.sort((a, b) => a.name.localeCompare(b.name));
  return powers;
}

/**
 * Generate the static HTML catalog page.
 */
function generateHTML(powers) {
  const powersJSON = JSON.stringify(powers);

  // Collect all unique keywords and authors for filters
  const allKeywords = [
    ...new Set(powers.flatMap((p) => p.keywords)),
  ].sort();
  const allAuthors = [...new Set(powers.map((p) => p.author))].sort();
  const allTypes = [...new Set(powers.map((p) => p.type))].sort();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kiro Powers Catalog</title>
  <style>
    :root {
      --color-bg: #0d1117;
      --color-surface: #161b22;
      --color-surface-hover: #1c2129;
      --color-border: #30363d;
      --color-text: #e6edf3;
      --color-text-secondary: #8b949e;
      --color-accent: #58a6ff;
      --color-accent-subtle: #1f6feb33;
      --color-green: #3fb950;
      --color-purple: #bc8cff;
      --color-orange: #d29922;
      --radius: 8px;
      --shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.5;
      min-height: 100vh;
    }

    .header {
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      padding: 20px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--color-text);
      flex-shrink: 0;
    }

    .logo svg {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .logo-text span {
      color: var(--color-accent);
    }

    .search-box {
      flex: 1;
      min-width: 200px;
      max-width: 480px;
    }

    .search-box input {
      width: 100%;
      padding: 8px 14px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      color: var(--color-text);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-subtle);
    }

    .search-box input::placeholder {
      color: var(--color-text-secondary);
    }

    .stats {
      color: var(--color-text-secondary);
      font-size: 14px;
      flex-shrink: 0;
    }

    .stats strong {
      color: var(--color-accent);
    }

    .main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      gap: 24px;
    }

    .sidebar {
      width: 220px;
      flex-shrink: 0;
    }

    .filter-section {
      margin-bottom: 20px;
    }

    .filter-section h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .filter-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 6px 10px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .filter-btn:hover {
      background: var(--color-surface);
      color: var(--color-text);
    }

    .filter-btn.active {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
      font-weight: 600;
    }

    .filter-btn .count {
      float: right;
      font-size: 11px;
      opacity: 0.7;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: 20px;
      transition: all 0.2s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .card:hover {
      border-color: var(--color-accent);
      background: var(--color-surface-hover);
      box-shadow: var(--shadow);
      transform: translateY(-1px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
    }

    .card-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .badge-mcp {
      background: rgba(56, 132, 255, 0.15);
      color: var(--color-accent);
    }

    .badge-kb {
      background: rgba(188, 140, 255, 0.15);
      color: var(--color-purple);
    }

    .card-author {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-bottom: 10px;
    }

    .card-description {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      flex: 1;
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .meta-item {
      font-size: 11px;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-item svg {
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }

    .card-keywords {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .keyword {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      color: var(--color-text-secondary);
    }

    /* Modal overlay */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 200;
      justify-content: center;
      align-items: flex-start;
      padding: 60px 24px;
      overflow-y: auto;
    }

    .modal-overlay.open {
      display: flex;
    }

    .modal {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      width: 100%;
      max-width: 640px;
      padding: 32px;
      position: relative;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 20px;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .modal-close:hover {
      background: var(--color-bg);
      color: var(--color-text);
    }

    .modal h2 {
      font-size: 22px;
      margin-bottom: 4px;
    }

    .modal-author {
      color: var(--color-text-secondary);
      font-size: 14px;
      margin-bottom: 16px;
    }

    .modal-description {
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.7;
      margin-bottom: 20px;
    }

    .modal-section {
      margin-bottom: 16px;
    }

    .modal-section h3 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .server-list {
      list-style: none;
    }

    .server-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      font-size: 14px;
      border-bottom: 1px solid var(--color-border);
    }

    .server-list li:last-child {
      border-bottom: none;
    }

    .server-type {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(63, 185, 80, 0.15);
      color: var(--color-green);
      font-weight: 600;
    }

    .modal-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--color-accent);
      color: #fff;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      margin-top: 8px;
      transition: opacity 0.2s;
    }

    .modal-link:hover {
      opacity: 0.9;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-secondary);
    }

    .empty-state svg {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.4;
    }

    .empty-state p {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .main {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
      }
      .grid {
        grid-template-columns: 1fr;
      }
      .header-inner {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        max-width: none;
      }
    }
  </style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <a href="#" class="logo">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#58a6ff" fill-opacity="0.15"/>
        <path d="M16 6L22 10V22L16 26L10 22V10L16 6Z" stroke="#58a6ff" stroke-width="1.5" fill="none"/>
        <path d="M16 6V26M10 10L22 22M22 10L10 22" stroke="#58a6ff" stroke-width="1" opacity="0.4"/>
        <circle cx="16" cy="16" r="3" fill="#58a6ff"/>
      </svg>
      <span class="logo-text">Kiro <span>Powers</span></span>
    </a>
    <div class="search-box">
      <input type="text" id="search" placeholder="Search powers by name, keyword, or author..." autocomplete="off">
    </div>
    <div class="stats" id="stats"></div>
  </div>
</header>

<div class="main">
  <aside class="sidebar" id="sidebar"></aside>
  <section class="content">
    <div class="grid" id="grid"></div>
    <div class="empty-state" id="empty" style="display:none;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <p>No powers match your search.</p>
    </div>
  </section>
</div>

<div class="modal-overlay" id="modal-overlay">
  <div class="modal" id="modal"></div>
</div>

<script>
const POWERS = ${powersJSON};
const REPO_URL = "https://github.com/kirodotdev/kiro-powers";

let activeFilters = { type: null, author: null };

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  const types = {};
  const authors = {};

  POWERS.forEach(p => {
    types[p.type] = (types[p.type] || 0) + 1;
    authors[p.author] = (authors[p.author] || 0) + 1;
  });

  let html = '<div class="filter-section"><h3>Type</h3>';
  html += '<button class="filter-btn' + (!activeFilters.type ? ' active' : '') + '" data-filter-type="type" data-filter-value="">All<span class="count">' + POWERS.length + '</span></button>';
  for (const [type, count] of Object.entries(types).sort()) {
    html += '<button class="filter-btn' + (activeFilters.type === type ? ' active' : '') + '" data-filter-type="type" data-filter-value="' + escapeHTML(type) + '">' + escapeHTML(type) + '<span class="count">' + count + '</span></button>';
  }
  html += '</div>';

  html += '<div class="filter-section"><h3>Author</h3>';
  html += '<button class="filter-btn' + (!activeFilters.author ? ' active' : '') + '" data-filter-type="author" data-filter-value="">All<span class="count">' + POWERS.length + '</span></button>';
  for (const [author, count] of Object.entries(authors).sort()) {
    html += '<button class="filter-btn' + (activeFilters.author === author ? ' active' : '') + '" data-filter-type="author" data-filter-value="' + escapeHTML(author) + '">' + escapeHTML(author) + '<span class="count">' + count + '</span></button>';
  }
  html += '</div>';

  sidebar.innerHTML = html;

  sidebar.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const filterType = btn.dataset.filterType;
      const filterValue = btn.dataset.filterValue;
      activeFilters[filterType] = filterValue || null;
      renderSidebar();
      renderGrid();
    });
  });
}

function getFilteredPowers() {
  const query = document.getElementById("search").value.toLowerCase().trim();
  return POWERS.filter(p => {
    if (activeFilters.type && p.type !== activeFilters.type) return false;
    if (activeFilters.author && p.author !== activeFilters.author) return false;
    if (query) {
      const searchable = [
        p.name, p.id, p.description, p.author, ...p.keywords
      ].join(" ").toLowerCase();
      return searchable.includes(query);
    }
    return true;
  });
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const statsEl = document.getElementById("stats");
  const filtered = getFilteredPowers();

  statsEl.innerHTML = "Showing <strong>" + filtered.length + "</strong> of " + POWERS.length + " powers";

  if (filtered.length === 0) {
    grid.style.display = "none";
    empty.style.display = "block";
    return;
  }

  grid.style.display = "grid";
  empty.style.display = "none";

  grid.innerHTML = filtered.map(p => {
    const badgeClass = p.type === "${POWER_TYPE_MCP}" ? "badge-mcp" : "badge-kb";
    const badgeLabel = p.type === "${POWER_TYPE_MCP}" ? "MCP" : "KB";
    const keywordsHTML = p.keywords.slice(0, 4).map(k =>
      '<span class="keyword">' + escapeHTML(k) + '</span>'
    ).join("");

    return '<div class="card" data-power-id="' + escapeHTML(p.id) + '">'
      + '<div class="card-header">'
      + '<span class="card-title">' + escapeHTML(p.name) + '</span>'
      + '<span class="card-badge ' + badgeClass + '">' + badgeLabel + '</span>'
      + '</div>'
      + '<div class="card-author">by ' + escapeHTML(p.author) + '</div>'
      + '<div class="card-description">' + escapeHTML(p.description) + '</div>'
      + '<div class="card-meta">'
      + (p.mcpServers.length > 0 ? '<span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' + p.mcpServers.length + ' server' + (p.mcpServers.length > 1 ? 's' : '') + '</span>' : '')
      + (p.steeringCount > 0 ? '<span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' + p.steeringCount + ' guide' + (p.steeringCount > 1 ? 's' : '') + '</span>' : '')
      + '<span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' + p.docLines + ' lines</span>'
      + '</div>'
      + (keywordsHTML ? '<div class="card-keywords">' + keywordsHTML + '</div>' : '')
      + '</div>';
  }).join("");

  grid.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.powerId;
      openModal(POWERS.find(p => p.id === id));
    });
  });
}

function openModal(power) {
  if (!power) return;
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("modal");

  const badgeClass = power.type === "${POWER_TYPE_MCP}" ? "badge-mcp" : "badge-kb";

  let serversHTML = "";
  if (power.mcpServers.length > 0) {
    serversHTML = '<div class="modal-section"><h3>MCP Servers</h3><ul class="server-list">'
      + power.mcpServers.map(s =>
        '<li><strong>' + escapeHTML(s.name) + '</strong><span class="server-type">' + escapeHTML(s.type) + '</span>'
        + (s.hasEnvVars ? '<span class="meta-item">🔑 Env vars required</span>' : '')
        + '</li>'
      ).join("")
      + '</ul></div>';
  }

  let keywordsHTML = "";
  if (power.keywords.length > 0) {
    keywordsHTML = '<div class="modal-section"><h3>Keywords</h3><div class="card-keywords">'
      + power.keywords.map(k => '<span class="keyword">' + escapeHTML(k) + '</span>').join("")
      + '</div></div>';
  }

  modal.innerHTML =
    '<button class="modal-close" id="modal-close">&times;</button>'
    + '<h2>' + escapeHTML(power.name) + '</h2>'
    + '<div class="modal-author">by ' + escapeHTML(power.author) + ' &middot; <span class="card-badge ' + badgeClass + '">' + escapeHTML(power.type) + '</span></div>'
    + '<div class="modal-description">' + escapeHTML(power.description) + '</div>'
    + '<div class="modal-section"><h3>Documentation</h3>'
    + '<p class="meta-item" style="font-size:14px">' + power.docLines + ' lines of documentation'
    + (power.steeringCount > 0 ? ' &middot; ' + power.steeringCount + ' steering guide' + (power.steeringCount > 1 ? 's' : '') : '')
    + '</p></div>'
    + serversHTML
    + keywordsHTML
    + '<a class="modal-link" href="' + REPO_URL + '/tree/main/' + encodeURIComponent(power.id) + '" target="_blank" rel="noopener">'
    + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
    + 'View on GitHub</a>';

  overlay.classList.add("open");
  document.getElementById("modal-close").addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

document.getElementById("search").addEventListener("input", renderGrid);

renderSidebar();
renderGrid();
</script>

</body>
</html>`;
}

// Main
async function main() {
  console.log("🔍 Scanning powers...");
  const powers = await scanAllPowers();
  console.log(`📦 Found ${powers.length} powers`);

  await mkdir(OUT_DIR, { recursive: true });

  const html = generateHTML(powers);
  const outPath = join(OUT_DIR, "index.html");
  await writeFile(outPath, html, "utf-8");

  console.log(`✅ Catalog written to ${outPath}`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
