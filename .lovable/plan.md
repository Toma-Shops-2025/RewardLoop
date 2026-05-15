## Reward Wheel — Neon Arcade Redesign

Refresh `src/routes/app.spin.tsx` only (visual + label layout). No business logic, RPC, or reward values change.

### The look (Neon Arcade)

- **Backdrop**: dark navy radial gradient panel behind the wheel (only on this screen, doesn't change app theme), subtle starfield/dot grid for depth.
- **Wheel body**: deep near-black segments separated by **thin neon dividers** alternating brand orange (`--brand`) and cyan accents.
- **Outer ring**: double ring — outer thin metallic stroke + inner glowing neon halo (animated soft pulse using existing `--shadow-brand` token plus a new cyan glow).
- **Pointer**: chunky neon triangle at top with drop-shadow glow; gentle bob animation on idle.
- **Center hub**: dark glass disc with a glowing `Sparkles` icon and a hairline neon ring; subtle rotating conic shimmer behind it while spinning.
- **Won banner**: keep existing `reward-pop` but restyle as a neon pill ("+50 PTS") with glow.
- **Spin button**: keep functionality; restyle as a neon pill — gradient brand→cyan, inner highlight, glow on hover/active.

All colors via tokens in `src/styles.css` (add `--neon-cyan`, `--wheel-bg`, `--wheel-segment`, `--shadow-neon`). No raw hex in the component.

### Labels — Wheel of Fortune style (no clipping, ever)

Replace the current absolutely-positioned divs with an **SVG overlay** sized to the wheel. For each segment:

- Render the number as SVG `<text>` rotated to the wedge's mid-angle, **oriented radially** (reading from center outward), placed on a chord well inside the rim.
- Use SVG `textLength` + a measured safe radius so the glyphs always fit inside their wedge regardless of digit count (5 vs 100).
- Drop the "PTS" sub-label off the wheel — show it once in the legend ("All values in points") under the wheel, freeing room and making numbers larger and crisper.
- White fill with neon outer stroke for contrast against dark segments — guaranteed legible.

Because the labels live in an SVG that rotates with the wheel (same transform), they spin together like the show. Geometry math guarantees they never cross the rim.

### Technical notes

- File touched: `src/routes/app.spin.tsx` (markup + small helper for SVG label geometry).
- Tokens added to `src/styles.css`: `--neon-cyan`, `--wheel-bg`, `--wheel-segment-a`, `--wheel-segment-b`, `--shadow-neon`, plus a `.neon-pulse` keyframe.
- Keep `SEGMENTS`, `claim_spin_reward` RPC, cooldown, ad gating, confetti, toast — all unchanged.
- After implement: regenerate `03-spin.png` Play Store screenshot from a fresh capture of the new wheel.

### What stays the same

- Reward values, odds, cooldown, ad flow, header, balance display, navigation.
- Overall page layout (header → wheel → win readout → button → fine print).

### Out of scope

- No changes to other screens, theme, or app-wide colors.
- No new dependencies.
