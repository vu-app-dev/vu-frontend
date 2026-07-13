# Landing Page Specification

## Goal

Help hiring teams understand, within one scroll, that VU runs structured virtual interviews and turns every candidate interaction into reviewable evidence.

## Primary Journey

```text
Prism hero
  -> product evidence grid
  -> interview evidence flow
  -> recruiter decision room
  -> candidate and team experience
  -> capability index
  -> get started
```

The page has one primary action: `Get started`, linking to `/login`. Anchor navigation remains functional with native URLs and Lenis scrolling.

## Components

### LandingHeader

- Fixed three-part alignment: VU mark, centered section navigation, primary action.
- The center navigation quietly leaves on downward scroll and returns on upward scroll; brand and CTA remain available.
- Mobile uses a real menu button with `aria-expanded`, a labeled navigation panel, and 44px targets.
- Focus is visible on every link and control.

### LandingHero

- Full viewport with the fixed monochrome Prism behind it.
- Headline remains `Your Virtual Interview`.
- Supporting copy explains adaptive interviews, CV context, integrity signals, and evaluation evidence in one sentence.
- Two compact evidence links sit near the lower rail. They are navigation, not fake announcements.
- The hero remains spatially fixed while its content fades beneath a dark veil as the content sheet rises.

### LandingShowcase

- Asymmetric five-card grid with one dominant interview workspace, one resume analysis card, one thin evaluation card, one analytics card, and one pipeline card.
- Opens with the statement `Interview intelligence, connected.` aligned to the same 92rem content rail as the remaining page.
- Every preview uses the same scale, inner border, surface depth, and typography hierarchy.
- Visualizations are purpose-built for marketing and do not import dashboard components.
- The grid grows from 94% to full size as the sheet enters the viewport. It does not loop.

### Section Motion

- Every major section enters as one composed surface using scroll-linked scale, vertical offset, and a light opacity change.
- Product visuals respond on hover with feature-specific motion: waveform emphasis, chart drawing, radar expansion, and active pipeline movement.
- Child content does not use repetitive fade-up entrances.

### EvidenceFlow

- Two-column editorial section: sticky statement on the left, ruled evidence sequence on the right.
- Sequence is meaningful: role context, live answer, transcript and integrity, evaluation.
- Each step exposes one compact sample of the artifact it creates.

### DecisionRoom

- Full-width product moment showing candidate ordering, score dimensions, evidence snippets, and review status.
- The section creates one strong focal point and avoids fake dashboard chrome.

### AudienceSection

- Unequal split for candidate and hiring-team outcomes.
- Uses short ordered checklists and a shared evidence rail, not two matching cards.

### CapabilityIndex

- Ruled two-column list of six product capabilities.
- Each row uses one Lucide icon, a title, and one sentence. No feature-card grid.

### FinalCTA and Footer

- One restrained conversion statement and one `Get started` action.
- Footer provides anchor navigation and a concise product description.

## Responsive Rules

- Desktop: asymmetric grids and sticky narrative columns.
- Tablet: grids collapse to two columns while preserving hierarchy.
- Mobile: every section becomes a single reading column; preview canvases use fixed aspect ratios and never horizontal-scroll.
- Hero content and evidence links become document-flow content on mobile.

## States and Edge Cases

- Reduced motion: native scrolling, static Prism, no reveal or parallax transforms.
- JavaScript disabled: semantic content, anchors, and CTA remain available; only motion is lost.
- Long translations: navigation may wrap only inside the mobile panel; preview labels truncate safely.
- Back and forward navigation: native links and hash destinations retain browser behavior.
- Offline: all landing visuals are local code and do not require network assets.

## Accessibility

- One `h1`; section hierarchy proceeds through `h2` and `h3`.
- Decorative previews are hidden from assistive technology; each section's text communicates the same meaning.
- Menu state uses `aria-expanded` and `aria-controls`.
- Focus indicators use the existing `--focus-ring` token.
- Status never relies on color alone.
- All touch targets are at least 44px.

## Pre-Flight

- Identity lock: passed. One accent, one radius family, one icon family, one type system.
- Anti-slop: passed. No three-equal-card section, fake trust row, gradient text, decorative numbering, or unsupported metric.
- Layout craft: passed. Asymmetric grid, ruled flow, full-width decision room, split audience, capability index.
- Cognitive load: passed. Four navigation items and one primary action.
- Accessibility: passed in specification; implementation requires keyboard, reduced-motion, and responsive verification.

Self-critique: distinctiveness 3, hierarchy 4, consistency 4, accessibility 4, state coverage 3, copy 4, restraint 4, motion motivation 4. Total: 30/32.

## Build Handoff

- Target: `react-vite-tailwind-engineer` equivalent for the existing React/Vite/CSS architecture.
- Design system: bespoke marketing components bound to existing VU semantic tokens.
- Implement exactly this specification. Do not import or recompose dashboard product components for the landing page.
- Acceptance: responsive at 375px, 768px, 1280px, and 1440px; build passes; anchors and mobile navigation work; reduced motion removes smooth scrolling and transforms.

Every screen must read as the same product if placed side by side.
