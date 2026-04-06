# Design System Document: The Luminescent Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Luminescent Curator."** 

In an enterprise environment, data density often leads to cognitive overload. This system rejects the traditional "dashboard-of-widgets" approach in favor of a high-end editorial experience. We treat course management not as a spreadsheet, but as a gallery. By utilizing deep charcoal foundations and piercing neon accents, we create a "darkroom" effect where the content—the educational material—is the only thing that glows.

We break the "template" look through **intentional asymmetry** and **tonal depth**. Instead of rigid, centered grids, we use generous, sweeping whitespace (using the `20` and `24` spacing tokens) to let elements breathe. Layers overlap with organic fluidity, and the extreme roundedness of the components (`xl` and `lg` radii) softens the "enterprise" coldness, making the sophisticated tech feel approachable and human.

---

## 2. Colors & Surface Philosophy
This system is built on high-contrast foundations and vibrant, electric energy. 

### The Palette
- **Background (`#0e0e0e`):** A deep, true charcoal that serves as our infinite canvas.
- **Primary (`#3fff8b`):** "Electric Emerald." Used sparingly for high-impact actions and status.
- **Tertiary (`#7ae6ff`):** "Oxygen Blue." Used for secondary data visualizations and interactive highlights.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Traditional "boxed" layouts look cheap and dated. Boundaries must be defined solely through background color shifts. 
- A `surface-container-low` section sitting on a `background` provides all the separation the eye needs. 
- Use the `surface-container` tiers to create a "nested" hierarchy.

### The Glass & Gradient Rule
To move beyond a "standard" dark mode, use **Glassmorphism** for floating elements (e.g., Modals, Dropdowns). 
- Use a semi-transparent `surface-variant` with a `backdrop-blur` of 20px. 
- **Signature Textures:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` to `primary-container` at a 135-degree angle to give buttons a "liquid light" feel.

---

## 3. Typography
We utilize a dual-typeface system to balance editorial authority with functional clarity.

- **Display & Headlines (Manrope):** We use Manrope for all headers (`display-lg` through `headline-sm`). Its geometric yet slightly condensed nature feels premium and modern. Use `display-lg` (3.5rem) for hero stats or course titles to create an "Editorial" impact.
- **Body & Labels (Inter):** Inter is our functional workhorse. Use `body-lg` for primary course descriptions and `label-sm` for metadata. 
- **The Hierarchy:** By pairing a massive `display-md` headline with a tiny, uppercase `label-md` tracking at 0.05em, we create a sophisticated tension that signals high-end design.

---

## 4. Elevation & Depth
In this design system, depth is not "fake height"; it is **Tonal Layering.**

- **The Layering Principle:** Stacking is our primary tool. 
    - Base: `surface` (#0e0e0e)
    - Section: `surface-container-low` (#131313)
    - Card: `surface-container` (#1a1a1a)
    - Active Element: `surface-container-highest` (#262626)
- **Ambient Shadows:** For "floating" elements like popovers, use a shadow with a 40px blur and only 6% opacity, tinted with `primary` to simulate the green glow of the UI hitting the surface.
- **The "Ghost Border" Fallback:** If accessibility requirements demand a container edge, use the **Ghost Border**: the `outline-variant` token at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), `full` rounded corners (9999px), and `title-sm` typography. 
- **Secondary:** `surface-container-highest` fill with `on-surface` text. No border.
- **Ghost:** No fill, `on-surface` text. On hover, transition to `surface-container-low`.

### Cards (The "Curved" Container)
- **Radius:** Always use `lg` (2rem) or `xl` (3rem) for containers.
- **Spacing:** Minimum padding of `6` (2rem) inside cards. 
- **Rule:** Never use dividers between card content. Use spacing `3` (1rem) to separate text from actions.

### Input Fields
- **Aesthetic:** A "well" effect. Use `surface-container-lowest` (#000000) for the field background with a `md` (1.5rem) corner radius.
- **Active State:** Change the ghost border from 15% opacity to 100% `primary`.

### Navigation Rails
- Avoid a standard sidebar. Use a slim, floating rail using Glassmorphism anchored to the left, with `2.5` spacing between icons.

### Progress Gauges
- For course completion, use thick, `lg` rounded stroke tracks in `surface-variant` with a `primary` glow.

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetry:** Place a large headline on the left and a small "floating" card on the right with a large `20` (7rem) gap.
- **Embrace the Curve:** Ensure even the smallest elements like chips use `full` (9999px) or `md` (1.5rem) radii.
- **Prioritize Breathing Room:** If in doubt, add more whitespace. The "Enterprise" feel comes from the scale, not the density.

### Don't:
- **Don't use 1px dividers.** Ever. Use vertical whitespace (`spacing-8` or `spacing-10`) to separate modules.
- **Don't use pure white for body text.** Use `on-surface-variant` (#adaaaa) for long-form reading to prevent eye strain against the black background.
- **Don't use "Drop Shadows."** Use tonal shifts. Only use shadows for elements that physically "hover" over the entire layout (Modals, Tooltips).

---

## 7. Scaling & Spacing
Consistency is maintained through a rigid adherence to the spacing scale.
- **Module Spacing:** `10` (3.5rem) or `12` (4rem).
- **Internal Component Spacing:** `3` (1rem) or `4` (1.4rem).
- **Touch Targets:** Minimum height of `8` (2.75rem) for all interactive chips and buttons.