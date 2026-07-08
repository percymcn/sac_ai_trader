# FlxioAI Vision — Higgsfield feature parity map (with our twist)

Goal: match everything Higgsfield does publicly, then beat it on transparency,
teachable presets, and a built-in viral loop. Legend:
✅ shipped · 🔌 SDK-backed, wired in the deploy pass (safe once typechecked
against the real fnf catalog) · 🧭 roadmap (needs its own screen).

Every wired tool inherits the FlxioAI twist automatically: **live per-shot cost
preview**, **transparent editable preset recipe**, **remix**, **boards**, and a
**permanent shareable /r/ page**.

| Higgsfield capability | Status | FlxioAI implementation + our twist |
|---|---|---|
| Image generation (multi-model) | ✅ | GPT Image 2, Nano Banana 2, Seedream 4.5, Soul V2 in one composer with cost preview. |
| Video generation (multi-model) | ✅ | Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, Grok Imagine — per-shot engine choice. |
| Camera-move / motion effects | ✅ | 37 **transparent** director presets (Higgsfield's are black-box buttons; ours are editable recipes you learn from). |
| Image-to-video | ✅ | Reference-image upload drives any image-capable video engine. |
| Batch generation | ✅ | Plan-gated batch mode (4/10 prompts) with per-prompt results — a Higgsfield-parallel feature, made explicit. |
| Public community feed / contests | ✅ | `/explore` gallery + **vote leaderboard** + permanent share pages (our viral loop is deeper than a feed). |
| Upscale / Enhance (2K/4K) | 🔌 | Topaz image/video + Sora-enhance jobs as an **Enhance** studio tool; twist: cost preview + one-click enhance of any past shot from history. |
| Remove background (cutout) | 🔌 | Background-removal job as a one-click action on any image result → transparent PNG export. |
| Outpaint / uncrop | 🔌 | Expand-canvas tool with aspect presets; twist: outpaint straight into a new share-ready ratio. |
| Reframe (aspect-ratio change) | 🔌 | Reframe any video to 9:16 / 1:1 / 16:9; twist: batch-reframe a shot into all social ratios at once. |
| Motion control (recast / motion transfer) | 🔌 | Drive a subject with a reference motion clip; twist: saved as a remixable recipe. |
| Character identity (Soul-style) | 🧭 | "Characters": train/reuse a consistent character across shots (Nano Banana 2 consistency + reference sets); twist: character-scoped boards. |
| Talking-head / lip-sync (Speak) | 🧭 | Portrait + script → lip-synced clip; twist: preset "delivery" styles (news, UGC, cinematic monologue). |
| Voice creation / voiceover | 🧭 | Voice library + generate/clone; twist: attach a voice to a talking-head preset in one flow. |
| Dubbing | 🧭 | Translate + re-voice a clip; twist: keeps the original as a linked remix. |
| Audio / music generation | 🧭 | Score a clip with generated music/SFX; twist: duration auto-matched to the shot. |
| 3D generation (image → GLB) | 🧭 | Turn any image result into a downloadable 3D mesh; twist: 3D exports as a board "asset pack". |
| Explainer / shorts / marketing studio | 🧭 | Multi-shot **Projects**: storyboard → shot list → assembled cut, built on boards. |
| Virality predictor | 🧭 | Score a finished clip for hook strength / retention risk before you post; twist: shown right on the share page. |
| Video analysis | 🧭 | Auto-tag and describe a clip; feeds search across your history. |

## Sequencing
1. **Deploy pass** wires all 🔌 tools into the existing studio as new modes
   (they're documented fnf SDK jobs — the deploy agent typechecks the exact
   export/id against `app/packages/fnf/ai/AGENTS.md` and registers them in
   `lib/fnf.server.ts`). No new architecture — same composer, same cost preview.
2. **Characters + Projects** (🧭) are the two biggest net-new screens; they get
   their own routes and D1 tables (the schema already reserves `boards` /
   `board_items` we extend).
3. **Talking-head, voice, dubbing, audio, 3D, virality, analysis** follow as
   individual studio tools, each shipped with the standard twist bundle.

The point of parity is not to copy the buttons — it's to offer the same
capabilities where *every* one is cheaper to reason about (cost preview), easier
to reproduce (editable recipe), and easier to distribute (share page).
