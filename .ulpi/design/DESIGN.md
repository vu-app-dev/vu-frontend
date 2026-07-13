---
project: VU
register: brand
aesthetic_direction: technical / utilitarian
color_strategy: restrained
design_system: bespoke
design_variance: 6
motion_intensity: 4
visual_density: 7
---

# VU Design Language

## Design Read

Calm interview intelligence with the precision of an evidence workspace and the confidence of a live control room.

## Signature

The fixed monochrome Prism field is VU's only ambient gesture. A dense, near-black content sheet rises over it and turns the abstract signal into structured interview evidence. Everything below the hero is quiet, ruled, and product-specific.

## Inspiration

- Bequant: took the disciplined navigation, full-viewport atmosphere, asymmetric editorial grid, and restrained technical labels. Rejected its networking imagery, content, bright secondary colors, and exact card compositions.
- Existing VU product: took the warm red-orange accent, compact enterprise typography, dark surface hierarchy, evidence-led UI, and small-radius controls. Rejected direct dashboard component reuse on the marketing page.
- Synthesis: a VU-specific hiring narrative that moves from ambient signal to structured evidence without imitating a dashboard or another company's site.

## Color (Locked)

Landing components must consume the existing semantic tokens. The values below document the dark landing expression.

| Role | Value | Use | Accessibility note |
| --- | --- | --- | --- |
| Background | `--bg-outer` / `#121212` | Prism fallback and page exterior | White primary text exceeds AA |
| Sheet | `#101112` | Landing content sheet | White primary text exceeds AA |
| Surface | `--bg-base` / `#181818` | Section bands and preview frames | Maintains subtle separation from sheet |
| Card | `--bg-surface` / `#232323` | Product showcase cards | Distinct from both sheet and inner preview |
| Preview | `--bg-oncard` / `#212121` | Product visualization canvas | Paired with structure borders |
| Primary text | `--text-primary` | Headlines and key values | Existing token passes AA on landing surfaces |
| Secondary text | `--text-secondary` | Supporting copy | Existing token passes AA on landing surfaces |
| Tertiary text | `--text-tertiary` | Labels and metadata | Used at 13px or larger where possible |
| Accent | `--brand-default` / `#ff5d31` | CTA, focus, active evidence | The only decorative accent |
| Border | `--border-default` | Structural separation | Reinforced on hover and focus |
| Success | `--status-success-text` | Verified and ready states | Always paired with text, never color alone |

No gradients, colored glows, or additional accent families are permitted. The Prism shader is monochrome.

## Type (Locked)

| Role | Family | Use | Notes |
| --- | --- | --- | --- |
| Display | `--font-sans` | Hero and section statements | Existing VU family, light-to-medium weights, tight line height |
| Body | `--font-sans` | Explanations and navigation | Existing product continuity wins over introducing a marketing-only family |
| Utility | `--font-mono` | Eyebrows, states, labels, data | Uppercase only for short labels |

Hero copy is concise. Body measure stays below 68 characters. Visible copy uses plain verbs and avoids unsupported performance claims.

## Scales (Locked)

- Spacing: existing `--size-*`, `--gap-*`, and `--padding-*` tokens only.
- Radius: `--radius-xs`, `--radius-sm`, and `--radius-md`; product previews do not exceed `--radius-md`.
- Motion: 150ms interaction, 300ms section response, 500ms emphasized reveal with `cubic-bezier(0.22, 1, 0.36, 1)`.
- Motion is limited to the Prism, the sheet entrance, section reveal, nav visibility, and hover feedback. Reduced motion removes transforms and scripted smooth scrolling.
- Icons: Lucide only, except for the VU wordmark.

## Voice

- Register: direct, calm, technical, evidence-led.
- Action vocabulary: `Get started`, `See the workflow`, `Review evidence`.
- Avoid buzzwords, inflated promises, fake statistics, and decorative labels.

Every screen must read as the same product if placed side by side.
