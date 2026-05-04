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

### Step 3: Ask Clarifying Questions (if needed)

If the image is ambiguous, ask the user using `vscode_askQuestions`:

**Questions to consider:**
- "Is this a field control (binds to one value) or a dataset control (displays multiple records)?"
- "What data type should this bind to? (text, number, date, option set)"
- "What should happen when the user interacts with [specific element]?"
- "Should this be read-only, editable, or both?"
- "Are there hover/focus states that aren't visible in the image?"
- "What namespace and control name would you like?"
- "Should this use React or standard DOM manipulation?"

**Do NOT ask if:**
- The control type is obvious from the image
- The user already specified details in their message
- The behavior is standard/expected for that type of UI element

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
- Suggest running `npm start watch` to see the control in the test harness
- Offer to adjust colors, spacing, or behavior based on user feedback

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
