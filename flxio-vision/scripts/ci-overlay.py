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

    # 4. Patch __root.tsx meta.
    root_path = platform_app / "src/routes/__root.tsx"
    if not root_path.exists():
        fail("__root.tsx not found", "\n".join(str(p) for p in (platform_app / "src/routes").glob("*")))
    root_src = root_path.read_text()
    if "FlxioAI Vision" not in root_src:
        m = re.search(r"meta:\s*\[", root_src)
        if not m:
            fail("__root.tsx: no `meta: [` found", root_src[:4000])
        open_idx = root_src.index("[", m.start())
        close_idx = find_matching_bracket(root_src, open_idx)
        if close_idx < 0:
            fail("__root.tsx: unbalanced meta array", root_src[m.start():m.start() + 2000])
        root_src = root_src[: open_idx + 1] + "\n" + GLOBAL_META + "\n    " + root_src[close_idx:]
        root_path.write_text(root_src)
        print("__root.tsx meta patched")
    else:
        print("__root.tsx already branded")
    if "<Toaster" not in root_src:
        print("::warning::__root.tsx has no <Toaster /> mount — toasts will not render; check template shell")

    # 5. Patch server.ts trailing-slash redirect.
    server_path = platform_app / "src/server.ts"
    if not server_path.exists():
        fail("server.ts not found", "\n".join(str(p) for p in (platform_app / "src").glob("*")))
    server_src = server_path.read_text()
    if "endsWith('/')" not in server_src:
        m = re.search(r"(async\s+fetch\s*\(\s*request[^)]*\)(?:\s*:\s*[^{]+)?\s*\{)", server_src)
        if not m:
            fail("server.ts: fetch handler signature not found", server_src[:4000])
        insert_at = m.end()
        server_src = server_src[:insert_at] + "\n" + SLASH_REDIRECT + server_src[insert_at:]
        server_path.write_text(server_src)
        print("server.ts trailing-slash redirect patched")
    else:
        print("server.ts already patched")
    if "applySecurityHeaders" not in server_src:
        print("::warning::server.ts does not reference applySecurityHeaders — verify security headers wrapper")

    # 6. Verify dependencies.
    pkg_path = platform_app / "package.json"
    pkg = json.loads(pkg_path.read_text())
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    missing = [d for d in ("zod", "@material-symbols/svg-400") if d not in deps]
    if missing:
        fail(
            f"template package.json missing {missing} — decide versions from this dump",
            json.dumps({"dependencies": pkg.get("dependencies", {}), "devDependencies": pkg.get("devDependencies", {})}, indent=1),
        )
    print("dependencies ok (zod, @material-symbols/svg-400 present)")
    print("overlay complete")


if __name__ == "__main__":
    main()
