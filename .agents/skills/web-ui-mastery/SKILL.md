---
name: web-ui-mastery
description: >-
  Expert guidelines and design system specifications for modern, responsive, high-end web applications.
  Use when designing or refining UI components, layouts, responsive behavior, tables, micro-animations,
  and visual aesthetics to ensure executive-level polish and flawless dual-zoom resilience.
---

# Web UI Mastery & Executive Design System

This skill enforces enterprise-grade visual standards, responsiveness, and aesthetic excellence across the SOSENLINEA platform.

## 1. Visual Hierarchy & Color System

- **Primary Brand**: Deep Corporate Navy (`#1e3a8a` / `#1e40af`) paired with Slate (`#0f172a`, `#334155`).
- **Functional Accents**:
  - Success / Operativo: Emerald Green (`#10b981`, `#059669`).
  - Warning / Pendiente: Amber / Gold (`#f59e0b`, `#d97706`).
  - Danger / Bloqueo: Coral Red (`#ef4444`, `#dc2626`).
  - Info / Notificación: Sky Blue (`#0284c7`, `#38bdf8`).
- **Backgrounds & Surfaces**: Clean layered contrast (`#f8fafc` base, `#ffffff` cards, subtle 1px border `#e2e8f0`).
- **Typography**:
  - Headings & Interface: `Plus Jakarta Sans`, font-weights `500`, `600`, `700`, `800`.
  - Data, NIT, Codes, Monetary: `JetBrains Mono` or tabular figures.

## 2. Dual-Zoom Responsive Architecture

Any table or data grid must be tested and resilient across extreme zoom levels:
- **Zoom-Out (70% - 90%)**:
  - Container width expands (>1100px).
  - All columns display in natural static flow (`position: static; box-shadow: none;`).
  - Never allow floating/sticky columns to clip or occlude adjacent columns like `Estado Actual`.
- **Zoom-In (110% - 175%)**:
  - Container width contracts (≤1100px).
  - Activate CSS Container Query: `@container table-wrapper (max-width: 1100px)`.
  - Action column smoothly docks to the right (`position: sticky; right: 0;`).
  - Preceding column must include `.table-col-before-sticky` (`min-width: 140px; padding-right: 1.5rem;`) to preserve buffer space.

## 3. Micro-Interactions & Transitions

- Buttons: Smooth `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);` with subtle active scale (`transform: scale(0.98)`).
- Modals & Drawers: Soft backdrop blur (`backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.65)`).
- Form Inputs: Focused states with `box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.15); border-color: var(--primary);`.
- Touch Targets: Minimum 40x40px interactive hit area for mobile and tablet touchscreens.

## 4. Accessibility & Longevity (WCAG AA)

- Text contrast ratio must exceed 4.5:1 against card backgrounds.
- Never use color alone to convey status (always pair badges with icons and readable labels).
- All interactive modals must listen for `Escape` key and trap focus.
- Every modal or popup must lock body scroll (`document.body.style.overflow = "hidden"`) and restore cleanly upon unmount.
