# Design System Specification: The Ethereal Ledger

## 1. Overview & Creative North Star
### Creative North Star: "The Intelligent Atmosphere"
This design system moves away from the "industrial" aesthetic of traditional finance and the "cluttered" nature of typical Web3 interfaces. Instead, we embrace **The Intelligent Atmosphere**. This is an editorial-first approach where the UI feels like a living, breathing digital environment rather than a static tool. 

We break the "template" look by prioritizing **Negative Space as a Component**. We use intentional asymmetry—placing core actions slightly off-center or using varied column widths—to guide the eye through the narrative of the transaction. The goal is to make the user feel like they are floating through a clean, automated sky, where only the most vital information crystallizes into view.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
Our palette is rooted in deep space (`#070d1f`) and accented by bioluminescent purples and blues.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. 
In this design system, boundaries are created through **background shifts**.
*   **The Transition:** Use `surface` for the base layer. Transition to `surface-container-low` for secondary content areas. 
*   **Contrast as Border:** Let the meeting point of two different surface tokens create the "line."

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of frosted glass.
*   **Base:** `surface` (#070d1f)
*   **Sectioning:** `surface-container-low` (#0c1326)
*   **Interactive Cards:** `surface-container-highest` (#1c253e)
*   **Floating Elements:** Use `surface-bright` with a backdrop blur of 20px–40px.

### The Glass & Gradient Rule
To provide "soul," use subtle, directional gradients. 
*   **Primary CTA:** Transition from `primary` (#a3a6ff) to `primary-dim` (#6063ee) at a 135-degree angle.
*   **Accent Glows:** Use `secondary` (#c180ff) and `tertiary` (#61c2ff) as blurred background "blobs" (300px+ blur) behind main containers to create a sense of depth and intelligence.

---

## 3. Typography: The Editorial Voice
We use a dual-sans approach to balance high-end editorial feel with technical clarity.

*   **Display & Headlines (Manrope):** This is our "Brand Voice." Use `display-lg` and `headline-lg` for portfolio balances and welcoming headers. The wider aperture of Manrope feels modern and authoritative.
*   **Body & Labels (Inter):** This is our "Utility Voice." Inter provides maximum legibility for transaction details, wallet addresses, and data points.
*   **Visual Hierarchy:** Leverage the extreme scale difference. A `display-lg` balance should sit confidently above a `label-md` descriptive tag to create a sense of "Information Architecture as Art."

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too heavy for a futuristic DeFi experience. We use **Tonal Layering**.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-highest` card inside a `surface-container-low` parent. This creates a "natural lift" through value contrast alone.
*   **Ambient Shadows:** For floating modals, use a shadow with a 64px blur, 0px spread, and 6% opacity using the `primary` color token. This mimics the glow of a screen in a dark room.
*   **The Ghost Border:** If a boundary is required for accessibility in input fields, use the `outline-variant` token at **15% opacity**. It should be a suggestion of a border, not a hard stop.
*   **Glassmorphism:** Apply a `backdrop-filter: blur(24px)` to any element using the `surface-bright` or `primary_container` tokens when they overlap other content.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (Primary to Primary-Dim), `roundness-full`, Inter Bold. No border.
*   **Secondary:** `surface-container-highest` background, Inter Medium, `roundness-md`.
*   **Tertiary:** Ghost style. Transparent background, `on-surface` text. Focus state uses a `primary` ghost border (20% opacity).

### Cards & Lists
*   **Forbidden:** Divider lines between list items.
*   **The Alternative:** Use 12px–16px of vertical whitespace between items. For lists, use alternating background tints (e.g., every second item uses `surface-container-low`) to create rhythm.
*   **Cards:** Use `roundness-xl` (1.5rem) for main dashboard cards to evoke a friendly, "Apple-esque" softness.

### Input Fields
*   **Style:** `surface-container-lowest` (pure black) backgrounds to create a "recessed" look. 
*   **Focus State:** A subtle outer glow using `primary` (10% opacity) rather than a thick border.
*   **Typography:** Labels use `label-md` in `on-surface-variant` for a muted, sophisticated feel.

### DeFi Specific: The "Fluid Swap" Component
Instead of two separate boxes for "From" and "To," create a single unified glass container (`surface-variant`) with a centered, floating `secondary` action icon. Use `roundness-xl` to make the complex math of DeFi feel approachable.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but let the main action button float to the right within a container to create visual tension.
*   **Use Subtle Animation:** When a user hovers over a `surface-container`, transition the background color to `surface-bright` over 300ms.
*   **Prioritize Breathing Room:** If a screen feels crowded, remove a decorative element or increase the padding. Space is a luxury.

### Don't:
*   **No Pure Greys:** Never use `#333` or `#666`. Always use our tinted neutrals (e.g., `outline` or `surface-variant`) to maintain the deep-sea blue/purple atmosphere.
*   **No Technical Clutter:** Avoid showing long transaction hashes by default. Use "Short-form" (0x12...34) and high-quality icons to represent tokens.
*   **No High-Contrast Borders:** Solid white or high-opacity borders will break the "Glassmorphism" illusion. Keep them "Ghostly" or non-existent.