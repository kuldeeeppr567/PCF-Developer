---
name: create-pcf-from-image
description: Create a PCF control from a user-provided screenshot, mockup, or design image. Analyzes the visual design to generate accurate HTML/CSS/TypeScript that replicates the UI. USE FOR building PCF controls from images, screenshots, mockups, wireframes, Figma exports, or any visual reference.
---

# Create PCF Control from Image Skill

## Purpose
Analyze a user-provided image (screenshot, mockup, wireframe, or design) and generate a complete PCF control that visually replicates the design. This skill combines vision/image analysis with PCF code generation to turn visual designs into working controls.

## When to Use
- User attaches an image and says "create a PCF control that looks like this"
- User provides a screenshot of a UI component and wants it implemented as a PCF control
- User shares a mockup or wireframe for a custom control
- User says "here's a design, build this as a PCF"
- User wants to replicate an existing UI element they found online

## Required Tools
- `view_image` — To analyze the attached image
- `run_in_terminal` — To scaffold the project
- `create_file` — To generate control files
- `vscode_askQuestions` — To clarify ambiguous designs

## Execution Steps

### Step 1: Analyze the Image

Use the `view_image` tool to examine the attached image. Extract the following details:

#### Visual Analysis Checklist
- [ ] **Layout**: Flexbox vs grid, horizontal vs vertical, alignment, spacing
- [ ] **Colors**: Background, foreground, borders, accents (extract as hex values)
- [ ] **Typography**: Font family hints, sizes (approximate px/rem), weights, line heights
- [ ] **Spacing**: Padding, margins, gaps between elements (approximate in px/rem)
- [ ] **Borders**: Border width, style, color, border-radius
- [ ] **Shadows**: Box shadows, text shadows
- [ ] **Interactive elements**: Buttons, inputs, toggles, sliders, checkboxes
- [ ] **States**: Hover, focus, active, disabled states (if visible)
- [ ] **Icons/Graphics**: Any icons, SVGs, or decorative elements
- [ ] **Data**: What kind of data does this control display/edit?
- [ ] **Responsiveness**: Does it appear to be fixed-width or fluid?

### Step 2: Determine Control Type

Based on the image analysis, determine:

| Visual Pattern | Control Type |
|----------------|-------------|
| Single input/display element | Field control (`standard`) |
| Table, list, or grid of records | Dataset control |
| Complex interactive widget with React UI | React virtual control |
| Simple value display/edit | Field control (`standard`) |

### Step 3: Discovery Phase — Confirm Before Building

After analyzing the image, assess what you CAN determine visually versus what remains unclear. Then ask clarifying questions **before** writing any code.

#### How Many Questions to Ask

- **0 questions** — The image is crystal clear (e.g., a simple toggle switch) AND the user's prompt fully explains the behavior and data binding. Proceed directly.
- **1-2 questions** — You understand the visual design well but need to confirm behavior or data binding (e.g., image shows a card layout but unclear if it's read-only or editable).
- **2-4 questions** — The image shows a complex or ambiguous control (e.g., a multi-step form, a dashboard widget, a drag-and-drop interface) where interactions aren't obvious from visuals alone.

#### How to Ask

- Ask **one question at a time** — wait for the response before asking the next
- Start each question by briefly stating what you understood from the image, then ask what's unclear
- Provide **concrete examples or options** so the user doesn't start from scratch
- Stop asking once you have enough confidence to build

#### What to Discover (pick only what's unclear from the image + prompt)

1. **Interaction behavior** (ask when the image shows interactive elements but actions aren't obvious):
   > "I can see [describe what you see, e.g., 'a row of 5 stars with 3 filled']. What should happen when the user clicks? For example: clicking the 4th star sets rating to 4, or clicking a filled star clears it, or stars fill on hover before click?"

2. **Data binding** (ask when it's unclear what field type this maps to):
   > "This looks like it displays [describe the data, e.g., 'a percentage value']. Should it bind to a whole number (0-100), a decimal (0.0-1.0), or a text field that you format yourself?"

3. **States and transitions** (ask when the image shows only one state):
   > "I can see the [active/default] state. How should it look when [disabled/empty/error/hover]? For example: grayed out when disabled, red border on error, placeholder text when empty?"

4. **Scope and boundaries** (ask for complex images showing multiple components):
   > "The image shows [describe full picture]. Should the PCF control include all of this, or just the [specific part]? For example, should I include the header/label or just the interactive widget itself?"

5. **Editable vs read-only** (ask when the image could be either):
   > "Should the user be able to change the value through this control, or is it display-only? If editable, should changes save immediately or require confirmation?"

#### Do NOT Ask If:
- The control type is obvious from the image (a slider is a slider)
- The user already explained the behavior in their prompt
- The interaction is standard for that UI pattern (e.g., a checkbox toggles)
- It's a purely cosmetic question you can decide yourself (exact shade of gray, font choice)

#### After Discovery — Summarize and Proceed

Before building, briefly confirm your understanding:
> "Got it. I'll create a [control type] that [brief description of behavior]. It will bind to [data type] and [key interactions]. Let me build this now."

Then proceed to Step 4.

### Step 4: Map Visual Elements to HTML Structure

Convert the visual design into a semantic HTML structure:

```
Image shows:
┌─────────────────────────────────┐
│ [Label]          [Value: ★★★☆☆] │
│                                 │
│  ○ ○ ○ ● ●  (5 circles/stars)  │
└─────────────────────────────────┘

Maps to:
<div class="rating-container">
  <div class="rating-label" aria-label="Rating">
    <span class="rating-stars" role="radiogroup">
      <button role="radio" aria-checked="true|false" />
      ...
    </span>
  </div>
</div>
```

### Step 5: Extract CSS Properties

From the image, generate accurate CSS:

```css
/* Colors - extracted from image */
--primary-color: #0078d4;        /* From the accent elements */
--background-color: #ffffff;      /* From the background */
--border-color: #e1e1e1;         /* From visible borders */
--text-color: #323130;           /* From text elements */
--hover-color: #106ebe;          /* Estimated hover state */

/* Spacing - approximated from image proportions */
--padding: 8px 12px;
--gap: 8px;
--border-radius: 4px;

/* Typography */
--font-size: 14px;
--font-weight: 400;
--font-family: "Segoe UI", system-ui, sans-serif;
```

### Step 6: Generate the Complete PCF Control

Follow the `create-pcf` skill steps but with the design-specific implementation:

1. **Manifest** — Configure with appropriate property types based on what data the control handles
2. **index.ts** — Implement rendering that creates the HTML structure identified in Step 4
3. **CSS** — Apply the styles extracted in Step 5
4. **React components** (if React) — Build component hierarchy matching the visual structure

### Step 7: Handle Design Variations

**Exact replication mode** ("make it look exactly like this"):
- Match colors, spacing, and layout as precisely as possible
- Use pixel-level accuracy for spacing and sizing
- Replicate visual details like shadows, gradients, rounded corners

**Inspired creation mode** ("make something like this but with changes"):
- Use the image as a starting reference
- Apply the user's requested modifications
- Maintain the overall design language while adapting specific elements
- Document what was changed from the original design

### Step 8: Verify Visual Accuracy

After generating the code, provide a summary:
- List the key visual elements identified and how they were implemented
- Note any assumptions made about interactive behavior

### Step 9: Show Control Info (MANDATORY)

Display a structured summary to the user (same format as `create-pcf` Phase 4):
- What the control does
- Control details table (location, type, namespace, binding)
- How to add to a model-driven app
- Key features list

### Step 10: Offer Preview (MANDATORY)

Use `vscode_askQuestions` to ask:
```
Question: "Would you like to preview the control in the test harness?"
Message: "I'll run `npm start watch` in `controls/<controlName>/` — this opens the control at http://localhost:8181 in your browser."
Options:
  - "Yes, start preview" (recommended)
  - "No, skip preview"
```

**If "Yes, start preview":**
1. Run `npm start watch` using `run_in_terminal` with `mode=async`
2. Store the terminal ID for later cleanup
3. Tell user: "Preview server is running at http://localhost:8181."
4. When user comes back, ask via `vscode_askQuestions`:
   ```
   Question: "Would you like to stop the preview server?"
   Options:
     - "Stop preview" (recommended)
     - "Keep it running"
   ```
5. If "Stop preview" → kill terminal with `kill_terminal`, then proceed to Step 11
6. If "Keep it running" → proceed to Step 11

**If "No, skip preview":** Proceed to Step 11.

### Step 11: Offer Deployment (MANDATORY)

Use `vscode_askQuestions`:
```
Question: "Would you like to deploy this control to your Power Platform environment?"
Options:
  - "Yes, deploy now"
  - "No, maybe later"
```

**If "Yes, deploy now":** Ask for environment URL and publisher prefix, then invoke `deploy-pcf` skill.
**If "No, maybe later":** End with: "You can deploy anytime later by saying *'Deploy <controlName>'*."

## Image Analysis Patterns

### Common UI Patterns and Their PCF Implementations

| Image Shows | Implementation |
|-------------|---------------|
| Star rating | Buttons with filled/empty star icons, bound to `Whole.None` |
| Toggle switch | Custom checkbox with CSS transition, bound to `TwoOptions` |
| Color picker | Canvas/input type=color, bound to `SingleLine.Text` (hex value) |
| Slider/range | Input range with custom styling, bound to `Decimal` or `Whole.None` |
| Progress bar | Div with percentage width, bound to `Decimal` |
| Tag/chip input | Multi-value display, bound to `MultiSelectOptionSet` or `SingleLine.Text` (JSON) |
| Date calendar | Custom calendar grid, bound to `DateAndTime.DateOnly` |
| Rich text editor | ContentEditable div, bound to `Multiple` |
| File upload display | File info display with Device API, bound to `SingleLine.Text` |
| Card/tile grid | Dataset control with card layout |
| Data table | Dataset control with table layout |
| Timeline | Dataset control with vertical layout |
| Kanban board | Dataset control with column grouping |

### Color Extraction Guidelines
- Background colors: Look at the largest solid areas
- Primary/accent: Look at buttons, links, active elements
- Text colors: Usually 2-3 shades (heading, body, secondary)
- Border colors: Usually lighter than text, darker than background
- If unsure about exact hex, use closest Fluent UI color token

### Spacing Extraction Guidelines
- Use 4px grid system (4, 8, 12, 16, 20, 24, 32, 40, 48)
- Estimate based on proportions in the image
- Inner padding is typically 8-16px
- Gaps between elements are typically 4-12px
- Border radius is typically 2-8px for controls

## Example Prompts and Responses

**User:** "Here's a screenshot of a slider control with a gradient track. Create a PCF field control."

**Agent response pattern:**
1. Analyze image → identify: horizontal slider, gradient track (blue to purple), circular thumb, value label
2. Determine: field control, bound to `Decimal` or `Whole.None`
3. Generate manifest with min/max/step input properties
4. Build index.ts with range input + custom gradient overlay
5. Create CSS with gradient background, custom thumb styling
6. Verify build

**User:** "Look at this image of a tag input. Build something similar but support comma-separated values."

**Agent response pattern:**
1. Analyze image → identify: pill/chip tags, input field, remove buttons on tags
2. Determine: field control (inspired mode), bound to `SingleLine.Text`
3. Store value as comma-separated string
4. Build interactive tag UI with add/remove functionality
5. Style chips/pills matching the image's visual style
6. Add keyboard support (Enter to add, Backspace to remove)

## Quality Checklist

Before delivering the control, verify:
- [ ] Visual output closely matches the source image
- [ ] All interactive elements are functional
- [ ] Accessibility attributes are present (aria-labels, roles, keyboard nav)
- [ ] CSS is scoped and won't leak to parent app
- [ ] Control handles empty/null values gracefully
- [ ] Control respects `isControlDisabled` state
- [ ] Build succeeds without errors
- [ ] Code is clean, well-structured TypeScript
