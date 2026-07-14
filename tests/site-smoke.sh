#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
build_dir="$(mktemp -d)"
trap 'rm -rf "$build_dir"' EXIT

hugo --source "$repo_root" --destination "$build_dir/public" --quiet

echo "PASS: site builds with the installed Hugo version"

assert_contains() {
  local file="$1"
  local expected="$2"
  local message="$3"

  if ! rg --fixed-strings --quiet -- "$expected" "$file"; then
    echo "FAIL: $message" >&2
    return 1
  fi

  echo "PASS: $message"
}

assert_not_contains() {
  local file="$1"
  local unexpected="$2"
  local message="$3"

  if rg --fixed-strings --quiet -- "$unexpected" "$file"; then
    echo "FAIL: $message" >&2
    return 1
  fi

  echo "PASS: $message"
}

assert_appears_before() {
  local file="$1"
  local first="$2"
  local second="$3"
  local message="$4"
  local first_line
  local second_line

  first_line="$(rg --line-number --fixed-strings --max-count 1 -- "$first" "$file" | cut -d: -f1)"
  second_line="$(rg --line-number --fixed-strings --max-count 1 -- "$second" "$file" | cut -d: -f1)"

  if [[ -z "$first_line" || -z "$second_line" || "$first_line" -ge "$second_line" ]]; then
    echo "FAIL: $message" >&2
    return 1
  fi

  echo "PASS: $message"
}

about_page="$build_dir/public/about/index.html"
cv_page="$build_dir/public/cv/index.html"

assert_contains "$about_page" "About Josh Gray" "About page uses the personal profile title"
assert_contains "$about_page" "software engineering manager in Dublin" "About page introduces Josh's current focus"
assert_contains "$about_page" 'href="/cv/"' "About page links to the dedicated CV"
assert_contains "$about_page" 'Building AI-Ready Repositories' "About page features representative writing"
assert_not_contains "$about_page" 'class="cv-controls"' "About page does not render the CV explorer"
assert_not_contains "$about_page" 'share About Josh Gray' "About page does not render article sharing controls"
assert_not_contains "$about_page" 'July 14, 2026' "About page does not render article publication metadata"

assert_contains "$cv_page" "Engineering CV" "CV page is generated at /cv/"
assert_contains "$cv_page" 'class="cv-controls"' "CV page retains the interactive explorer"
assert_contains "$cv_page" 'data-filter-value="leadership"' "CV page can filter leadership roles"
assert_contains "$cv_page" "Open PDF" "CV exposes a browser-compatible PDF action"
assert_contains "$cv_page" 'href="/cv/josh-gray-engineering-cv.pdf"' "CV PDF action links to a real PDF asset"
assert_not_contains "$repo_root/assets/js/cv-interactive.js" "window.print()" "CV PDF action does not depend on native print support"
assert_not_contains "$cv_page" "(6 months)" "Current-role duration cannot become stale"
assert_contains "$cv_page" "AI-Enabled Engineering" "CV foregrounds AI-enabled engineering skills"
assert_contains "$cv_page" "Claude Code" "CV includes current AI development tooling"
assert_contains "$cv_page" "OpenAI Codex" "CV includes agentic development tooling"
assert_contains "$cv_page" "AI software development lifecycle (SDLC) strategy" "CV includes current-role AI strategy work"
assert_contains "$cv_page" "AI-powered Slack and Jira integrations" "CV includes current-role AI workflow delivery"
assert_contains "$cv_page" "Education &amp; Professional Development" "CV includes education and professional development"
assert_appears_before "$cv_page" '<h2>Experience</h2>' '<h2>Skills</h2>' "CV presents experience before skills"
assert_appears_before "$cv_page" '<h2>Experience</h2>' '<h2>Education &amp; Professional Development</h2>' "CV presents experience before professional development"
assert_contains "$cv_page" "National Diploma in Information Systems" "CV includes relevant tertiary education"
assert_contains "$cv_page" "DevOps Mastery Specialization" "CV includes selective professional certification"
assert_contains "$cv_page" "Certified SAFe® 6 Scrum Master" "CV includes the SAFe certification"
assert_contains "$cv_page" "Expired Oct 2024" "CV shows the SAFe certification status transparently"
assert_contains "$cv_page" "UiPath Level 1 – Foundation Training" "CV includes foundational UiPath training"
assert_contains "$cv_page" "UiPath Level 2 – Orchestrator" "CV includes UiPath orchestration training"
assert_contains "$cv_page" "UiPath Level 3 – Advanced" "CV includes advanced UiPath training"
assert_not_contains "$cv_page" "Willow Developer Portal" "CV omits LinkedIn project entries"
assert_contains "$cv_page" "Open to conversations" "CV uses neutral availability wording"
assert_not_contains "$cv_page" "DotNet Core" "CV uses current .NET terminology"
assert_not_contains "$repo_root/assets/js/cv-interactive.js" 'item.style.opacity = "0"' "CV content is not hidden until scroll"

assert_contains "$about_page" 'rel="canonical" href="https://joshwgray.github.io/about/"' "About canonical URL uses HTTPS"
assert_contains "$cv_page" 'rel="canonical" href="https://joshwgray.github.io/cv/"' "CV canonical URL uses HTTPS"
assert_contains "$about_page" '"ProfilePage"' "About page emits ProfilePage structured data"
assert_not_contains "$about_page" '"BlogPosting"' "About page is not represented as a blog post"
assert_contains "$about_page" 'property="og:image" content="https://joshwgray.github.io/og-image.png"' "About page exposes a valid social image URL"
assert_contains "$about_page" 'rel="icon" href="https://joshwgray.github.io/favicon.svg"' "About page exposes an HTTPS favicon URL"

test -s "$build_dir/public/og-image.png"
echo "PASS: social image is included in the generated site"

test -s "$build_dir/public/favicon.svg"
echo "PASS: favicon is included in the generated site"

cv_pdf="$build_dir/public/cv/josh-gray-engineering-cv.pdf"
test -s "$cv_pdf"
echo "PASS: generated CV PDF is included in the site"

test "$(LC_ALL=C head -c 5 "$cv_pdf")" = "%PDF-"
echo "PASS: generated CV PDF has a valid file signature"

assert_not_contains "$repo_root/.github/workflows/hugo.yaml" '--baseURL' "deployment cannot override HTTPS with an environment URL"
assert_contains "$repo_root/assets/css/extended/cv-styles.css" '.top-link' "CV print styles hide the floating page control"
assert_not_contains "$repo_root/assets/css/extended/cv-styles.css" 'min-width: max-content' "tablet CV filters do not force intrinsic-width overflow"
assert_contains "$repo_root/assets/css/extended/cv-styles.css" 'flex: 1 1 100%;' "tablet CV filter groups can shrink to the controls panel"
assert_contains "$repo_root/assets/css/extended/cv-styles.css" 'flex: 1 0 100%;' "tablet CV filter labels occupy a stable row"
assert_contains "$repo_root/assets/css/extended/cv-styles.css" 'flex: 1 1 120px;' "tablet CV filter buttons distribute across available width"
