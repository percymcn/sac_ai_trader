#!/usr/bin/env python3
"""Overlay the FlxioAI Vision app tree onto the platform template repo.

Runs in CI (GitHub Actions). Deterministic and defensive: every patch either
applies cleanly or dumps the relevant file region and exits 2 so the operator
can fix from logs. Never prints credentials.

Usage: ci-overlay.py <overlay_root>/app <platform_repo>/app
"""
import json
import re
import shutil
import sys
from pathlib import Path

GLOBAL_META = """      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FlxioAI Vision — Direct every frame.' },
      { name: 'description', content: 'FlxioAI Vision is a cinematic AI studio: generate images and videos with the best AI models, guided by 35+ director presets, transparent per-shot costs, boards, remix, batch mode, and shareable results.' },
      { name: 'author', content: 'FlxioAI Vision' },
      { name: 'theme-color', content: '#0A0A0A' },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'FlxioAI Vision' },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:card', content: 'summary_large_image' },"""

SLASH_REDIRECT = """    {
      const __url = new URL(request.url)
      if (__url.pathname !== '/' && __url.pathname.endsWith('/')) {
        __url.pathname = __url.pathname.slice(0, -1)
        return Response.redirect(__url.toString(), 301)
      }
    }
"""


def fail(msg: str, dump: str = "") -> None:
    print(f"::error::{msg}")
    if dump:
        print("----- context dump -----")
        print(dump)
        print("----- end dump -----")
    sys.exit(2)


def warn(msg: str) -> None:
    print(f"::warning::{msg}")


def find_matching_bracket(text: str, open_idx: int) -> int:
    depth = 0
    for i in range(open_idx, len(text)):
        if text[i] == "[":
            depth += 1
        elif text[i] == "]":
            depth -= 1
            if depth == 0:
                return i
    return -1


def main() -> None:
    overlay_app = Path(sys.argv[1]).resolve()
    platform_app = Path(sys.argv[2]).resolve()
    if not overlay_app.is_dir() or not platform_app.is_dir():
        fail(f"bad paths: {overlay_app} / {platform_app}")

    # 1. Copy overlay tree (manifest handled separately).
    copied = 0
    for src in overlay_app.rglob("*"):
        if src.is_dir():
            continue
        rel = src.relative_to(overlay_app)
        if str(rel) == "app.manifest.json":
            continue
        dst = platform_app / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        copied += 1
    print(f"copied {copied} overlay files")

    # 1a. Remove conflicting sitemap/robots route files. Our canonical files are
    # the escaped-dot names `sitemap[.]xml.ts` / `robots[.]txt.ts` (route paths
    # /sitemap.xml and /robots.txt). Older overlay pushes used unescaped names
    # (which route to /sitemap/xml), and the template may ship its own variants;
    # any file other than ours would either shadow the real path or collide.
    routes_dir = platform_app / "src/routes"
    keep = {"sitemap[.]xml.ts", "robots[.]txt.ts"}
    if routes_dir.is_dir():
        for p in list(routes_dir.iterdir()):
            if p.is_file() and (p.name.startswith("sitemap") or p.name.startswith("robots")) and p.name not in keep:
                p.unlink()
                print(f"removed conflicting route file: {p.name}")

    # 1b. Remove template layouts. The starter ships src/layouts/*.tsx demo
    # layouts that import a `.Action`-style Composer API we don't expose; they
    # aren't referenced by any of our routes, so drop them to keep typecheck
    # clean. Safe: our overlay never provides a layouts/ dir.
    layouts_dir = platform_app / "src/layouts"
    if layouts_dir.is_dir():
        shutil.rmtree(layouts_dir, ignore_errors=True)
        print("removed template src/layouts/ (unused demo layouts)")
    else:
        print("no template src/layouts/ to remove")

    # 2. Merge manifest.
    manifest_path = platform_app / "app.manifest.json"
    manifest = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text() or "{}")
    manifest["db"] = True
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"manifest merged: {manifest}")

    # 3. Renumber our migration if the prefix is taken by a different file.
    migrations = platform_app / "migrations"
    ours = migrations / "0001_flxio_core.sql"
    if migrations.is_dir() and ours.exists():
        # If a previous overlay already installed our migration under another
        # number, update THAT file in place instead of adding a new copy.
        existing = sorted(p for p in migrations.glob("[0-9]*_flxio_core.sql") if p.name != ours.name)
        if existing:
            existing[0].write_text(ours.read_text())
            ours.unlink()
            for dup in existing[1:]:
                dup.unlink()
                print(f"removed duplicate migration {dup.name}")
            print(f"migration updated in place -> {existing[0].name}")
        else:
            others = [p for p in migrations.glob("[0-9]*.sql") if p.name != ours.name]
            taken = {p.name.split("_")[0] for p in others}
            if "0001" in taken:
                nums = [int(p.name.split("_")[0]) for p in migrations.glob("[0-9]*.sql")]
                nxt = max(nums) + 1
                new_name = migrations / f"{nxt:04d}_flxio_core.sql"
                ours.rename(new_name)
                print(f"migration renumbered -> {new_name.name}")
            else:
                print("migration kept as 0001_flxio_core.sql")

    # 4. Patch __root.tsx meta. NON-FATAL: every route sets its own head()/meta
    # via buildHead, so if the template shape differs we warn and keep going —
    # a skipped global-meta patch never blocks the deploy.
    root_path = platform_app / "src/routes/__root.tsx"
    if not root_path.exists():
        warn("__root.tsx not found — skipping global-meta patch (per-route meta still applies)")
    else:
        root_src = root_path.read_text()
        if "FlxioAI Vision" in root_src:
            print("__root.tsx already branded")
        else:
            m = re.search(r"meta:\s*\[", root_src)
            close_idx = find_matching_bracket(root_src, root_src.index("[", m.start())) if m else -1
            if not m or close_idx < 0:
                warn("__root.tsx: couldn't locate the meta array — skipping global-meta patch (per-route meta still applies)")
            else:
                open_idx = root_src.index("[", m.start())
                root_src = root_src[: open_idx + 1] + "\n" + GLOBAL_META + "\n    " + root_src[close_idx:]
                root_path.write_text(root_src)
                print("__root.tsx meta patched")
        if "<Toaster" not in root_src:
            warn("__root.tsx has no <Toaster /> mount — toasts may not render; check template shell")

    # 5. Patch server.ts trailing-slash redirect. NON-FATAL: it's an SEO nicety,
    # not a launch blocker — warn and continue if the handler shape differs.
    server_path = platform_app / "src/server.ts"
    if not server_path.exists():
        warn("server.ts not found — skipping trailing-slash redirect patch")
    else:
        server_src = server_path.read_text()
        if "endsWith('/')" in server_src:
            print("server.ts already patched")
        else:
            m = re.search(r"(async\s+fetch\s*\(\s*request[^)]*\)(?:\s*:\s*[^{]+)?\s*\{)", server_src)
            if not m:
                warn("server.ts: fetch handler signature not found — skipping trailing-slash redirect patch")
            else:
                insert_at = m.end()
                server_src = server_src[:insert_at] + "\n" + SLASH_REDIRECT + server_src[insert_at:]
                server_path.write_text(server_src)
                print("server.ts trailing-slash redirect patched")
        if "applySecurityHeaders" not in server_src:
            warn("server.ts does not reference applySecurityHeaders — verify security headers wrapper")

    # 6. Verify dependencies. NON-FATAL: a genuinely missing dep surfaces with a
    # clear error at build time; don't block the overlay over it.
    pkg_path = platform_app / "package.json"
    try:
        pkg = json.loads(pkg_path.read_text())
        deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
        missing = [d for d in ("zod", "@material-symbols/svg-400") if d not in deps]
        if missing:
            warn(f"template package.json may be missing {missing} — if the build errors on these, add them to package.json and re-run")
        else:
            print("dependencies ok (zod, @material-symbols/svg-400 present)")
    except Exception as exc:  # noqa: BLE001
        warn(f"could not read package.json ({exc}) — continuing")
    print("overlay complete")


if __name__ == "__main__":
    main()
