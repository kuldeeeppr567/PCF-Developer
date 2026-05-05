---
name: create-pcf
description: Scaffold a new PCF (Power Apps Component Framework) control project. Supports field controls, dataset controls, and React-based virtual controls. Generates manifest, index.ts, CSS, and all boilerplate files. USE FOR creating new PCF controls, initializing PCF projects, scaffolding components.
---

# Create PCF Control Skill

## Purpose
Scaffold a complete, working PCF control project from scratch. This skill handles the full lifecycle from understanding requirements through to preview and deployment.

## When to Use
- User says "create a new PCF control", "scaffold a PCF", "init a PCF project"
- User names a control and wants it built from scratch
- User specifies a control type (field, dataset, React)

---

## ⚠️ MANDATORY EXECUTION SEQUENCE

**Follow these phases IN ORDER. Do NOT skip or rearrange phases.**

```
Phase 1: CHECK PREREQUISITES     → Verify tools exist
Phase 2: UNDERSTAND REQUIREMENTS  → Read prompt, ask questions if needed
Phase 3: BUILD THE CONTROL        → Scaffold, install, write code, compile
Phase 4: SHOW CONTROL INFO        → Display what was built + CRM setup guide
Phase 5: OFFER PREVIEW            → Ask user if they want to see it running
Phase 6: OFFER DEPLOYMENT         → Ask user if they want to deploy to CRM
```

**CRITICAL RULES:**
- Do NOT start Phase 3 until Phase 2 is complete (all questions answered)
- Do NOT skip Phase 4 — ALWAYS show the control info after build succeeds
- Do NOT skip Phase 5 — ALWAYS ask about preview after showing info
- Do NOT skip Phase 6 — ALWAYS ask about deployment after preview is done/declined
- Do NOT run `npm install` more than ONCE
- Do NOT use `context.accessibility.assignedTabIndex` — it does not exist in PCF typings. Use `tabIndex = 0` instead.
- **ALWAYS use `vscode_askQuestions` tool for Phase 5 and Phase 6 — NEVER write yes/no questions as plain chat text. The user MUST see clickable option buttons.**

---

## Phase 1: Check Prerequisites

Verify the developer environment has ALL required tools. Run each command:

```bash
node --version      # Required: 18.x or higher
npm --version       # Required: comes with Node.js
dotnet --version    # Required: 6.0 or higher
pac --version       # Required: Power Platform CLI
```

**ALL FOUR must succeed.** If any fails, tell the user EXACTLY what to install and stop:

| Tool | Minimum Version | Install Instructions |
|------|----------------|---------------------|
| `node` | 18.x+ | Install from https://nodejs.org (LTS recommended) |
| `npm` | (any) | Comes with Node.js — reinstall Node.js if missing |
| `dotnet` | 6.0+ | Install from https://dotnet.microsoft.com/download |
| `pac` | (any) | Run: `dotnet tool install --global Microsoft.PowerApps.CLI.Tool` |

**Why each is needed:**
- `node` + `npm` → Install dependencies, build control, run preview
- `dotnet` → Export solution packages (`dotnet build`), required by `pac solution`
- `pac` → Scaffold control (`pac pcf init`), push to environment, create solutions

**Do NOT proceed to Phase 2 until ALL four checks pass.**
If a tool is missing, show the install command and STOP. Do not attempt to create the control without all prerequisites.

Only proceed to Phase 2 after ALL prerequisites pass.

---

## Phase 2: Understand Requirements (Discovery)

### Assess the user's prompt

Read the user's request carefully. Determine what you KNOW vs what's UNCLEAR.

### When to Ask Questions
- **Skip questions** if the user's prompt is very specific (e.g., "Create a toggle switch that binds to a Yes/No field with a blue theme")
- **Ask 1-2 questions** for moderately clear requests (e.g., "Create a rating control")
- **Ask 2-4 questions** for vague or complex requests (e.g., "Create a control for managing tags")

### How to Ask
- Ask **one question at a time** — wait for the answer before asking the next
- Provide **hints or examples** in each question
- Keep questions conversational, not like a form
- Stop asking as soon as you have enough to build confidently

### What to Discover

1. **Purpose & Usage** (ask if the user only gave a name, no context):
   > "How will this control be used? For example: replacing a text field on a form, displaying data in a custom way, capturing user input like signatures/ratings/selections, etc."

2. **Visual Behavior** (ask if the UI isn't obvious from the description):
   > "What should it look like or behave like? For example: a slider with min/max labels, a star rating with hover effects, a tag input with autocomplete, etc."

3. **Data Binding** (ask if unclear what data type it should bind to):
   > "What kind of data will this control work with? For example: a single text value, a number (integer/decimal/currency), a yes/no toggle, a date, an option set, or a dataset/grid of records?"

4. **Special Requirements** (ask only for complex controls):
   > "Any specific requirements? For example: must work offline, needs WebAPI access, should support dark mode, needs to call an external API, etc."

### Target Folder (Optional Question)

Controls are created in `controls/` by default. **Only ask** if:
- The user explicitly mentions a different folder
- The workspace has no `controls/` folder

If the user hasn't specified a folder, use `controls/` without asking. If you need to ask:
> "Where should I create this control? Default is `controls/` — press Enter to accept, or specify a different folder path."

### After Discovery — Map to Technical Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `controlName` | PascalCase name for the control | (required) |
| `namespace` | Namespace for the control | `PCFControls` |
| `controlType` | `field`, `dataset`, or `react` | `field` |
| `boundPropertyType` | For field controls: the data type to bind to | `SingleLine.Text` |
| `targetFolder` | Parent folder for the control | `controls` |
| `description` | Short description of the control | `A custom PCF control` |

> **Note:** Infer technical params from context. If user says "rating 1-5 stars", you know it's `Whole.None`. Don't ask the user for namespace or property type directly.

---

## Phase 3: Build the Control

### Step 1: Create Project Directory

**IMPORTANT:** Create the directory FIRST, then cd into it, then run `pac pcf init`. Do NOT run pac pcf init from the parent folder directly.

```bash
cd "<repo-root>/<targetFolder>"
mkdir <controlName>
cd <controlName>
```

> Use `controls` as `<targetFolder>` unless the user specified a different folder in Phase 2.

### Step 2: Initialize PCF Project

```bash
# Field control:
pac pcf init --namespace <namespace> --name <controlName> --template field

# Dataset control:
pac pcf init --namespace <namespace> --name <controlName> --template dataset

# React control:
pac pcf init --namespace <namespace> --name <controlName> --template field --framework react
```

### Step 3: Install Dependencies

Run **inside** the control folder (e.g., `controls/Slider/`):

```bash
npm install
```

> **Run ONLY ONCE.** If the build fails later, the issue is code/manifest, NOT dependencies.

### Step 4: Write the Manifest

Replace the generated `ControlManifest.Input.xml`. Use clean XML — do NOT leave stray comment tags (`-->`) from the template.

**Field Control:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{namespace}}" constructor="{{controlName}}" version="0.0.1"
           display-name-key="{{controlName}}" description-key="{{description}}"
           control-type="standard">
    <property name="value" display-name-key="Value" description-key="The bound field value"
              of-type="{{boundPropertyType}}" usage="bound" required="true" />
    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/{{controlName}}.css" order="1" />
    </resources>
  </control>
</manifest>
```

**Dataset Control:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{namespace}}" constructor="{{controlName}}" version="0.0.1"
           display-name-key="{{controlName}}" description-key="{{description}}"
           control-type="standard">
    <data-set name="dataSet" display-name-key="DataSet" description-key="The dataset to display">
    </data-set>
    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/{{controlName}}.css" order="1" />
    </resources>
  </control>
</manifest>
```

**React Virtual Control:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{namespace}}" constructor="{{controlName}}" version="0.0.1"
           display-name-key="{{controlName}}" description-key="{{description}}"
           control-type="virtual">
    <property name="value" display-name-key="Value" description-key="The bound field value"
              of-type="{{boundPropertyType}}" usage="bound" required="true" />
    <resources>
      <code path="index.ts" order="1"/>
      <platform-library name="React" version="16.8.6" />
      <platform-library name="Fluent" version="9.46.2" />
    </resources>
  </control>
</manifest>
```

### Step 5: Write index.ts

Implement the full control logic. Use ONLY APIs that exist in PCF typings:

**SAFE to use:**
- `context.parameters.<name>.raw`
- `context.mode.isControlDisabled`
- `context.mode.isVisible`
- `context.updatedProperties`
- `context.formatting`
- `context.webAPI` (if declared in manifest)
- `context.navigation`
- `context.device` (if declared in manifest)

**DO NOT use (they don't exist or cause build errors):**
- ~~`context.accessibility.assignedTabIndex`~~ — Use `tabIndex = 0` directly
- ~~`context.theming`~~ — Use `context.fluentDesignLanguage` if available

### Step 6: Write CSS

Create `css/{{controlName}}.css` with scoped styles.

### Step 7: Build

```bash
npm run build
```

If the build fails, fix the TypeScript/manifest error and rebuild. Do NOT run `npm install` again.

### Timing

**Record the time** when Phase 3 starts (before creating the directory) and when the build succeeds. Calculate the total duration. You will display this in Phase 4.

---

## Phase 4: Show Control Information (MANDATORY)

**IMMEDIATELY after a successful build**, display this information to the user. Do NOT skip this phase.

Show a structured summary:

```
## ✅ <controlName> — PCF Control Created Successfully (⏱️ <duration> seconds)

### What This Control Does
<One paragraph explaining the control's purpose, behavior, and how it looks>

### Control Details
| Property | Value |
|----------|-------|
| Location | `controls/<controlName>/` |
| Type | Field / Dataset / React Virtual |
| Namespace | <namespace> |
| Bound To | <boundPropertyType description> |

### How to Add to a Model-Driven App (Dynamics 365 / Power Apps)

1. **Deploy** the control to your environment (I'll help with this next)
2. Open **make.powerapps.com** → navigate to your **Solution**
3. Open the **Table** → **Forms** → select your form
4. Click the **field** you want to replace → **Properties** → **Controls** tab
5. Click **"Add control"** → search for `<controlName>`
6. Select it, choose which clients (Web / Phone / Tablet)
7. Map the control's properties to form fields
8. **Save and Publish** the form

### Key Features
- <feature 1>
- <feature 2>
- <feature 3>
```

---

## Phase 5: Offer Preview (MANDATORY)

**⚠️ CRITICAL: You MUST use the `vscode_askQuestions` tool here. Do NOT just type a question in chat text. The user must see clickable buttons.**

After showing the control info, call `vscode_askQuestions` with exactly this structure:

```json
{
  "questions": [{
    "header": "Preview",
    "question": "Would you like to preview the control in the test harness?",
    "message": "I'll run `npm start watch` — opens at http://localhost:8181 in your browser.",
    "options": [
      { "label": "Yes, start preview", "recommended": true },
      { "label": "No, skip preview" }
    ]
  }]
}
```

**DO NOT combine preview and deploy into one question. They are SEPARATE phases.**
**DO NOT write the question as chat text. ALWAYS use `vscode_askQuestions` tool.**

### If user selects "Yes, start preview":

1. **Run the preview server in async mode** so it stays running:
   ```bash
   cd controls/<controlName>
   npm start watch
   ```
   Use `run_in_terminal` with `mode=async` so the terminal keeps running.

2. **Store the terminal ID** — you will need it to kill the server later.

3. **Tell the user:**
   > "Preview server is running at http://localhost:8181. You can interact with the control in the test harness. Come back here when you're done."

4. **When the user comes back** (sends any message after preview started), offer to stop the preview using `vscode_askQuestions`:
   ```
   Question: "Would you like to stop the preview server?"
   Options:
     - "Stop preview" (recommended)
     - "Keep it running"
   ```

5. **If user selects "Stop preview":**
   - Kill the terminal using `kill_terminal` with the stored terminal ID
   - Confirm: "Preview server stopped."
   - Proceed to Phase 6.

6. **If user selects "Keep it running":**
   - Proceed to Phase 6 (the server stays running in the background).

### If user selects "No, skip preview":

- Proceed directly to Phase 6.

---

## Phase 6: Offer Deployment (MANDATORY)

**⚠️ CRITICAL: You MUST use the `vscode_askQuestions` tool here. Do NOT just type a question in chat text. The user must see clickable buttons.**

After preview is done or declined, call `vscode_askQuestions` with exactly this structure:

```json
{
  "questions": [{
    "header": "Deploy",
    "question": "Would you like to deploy this control to your Power Platform environment?",
    "options": [
      { "label": "Yes, deploy now", "recommended": true },
      { "label": "No, maybe later" }
    ]
  }]
}
```

**DO NOT write the question as chat text. ALWAYS use `vscode_askQuestions` tool.**

### If user selects "Yes, deploy now":

Ask for deployment details:
1. **Environment URL** (e.g., `https://yourorg.crm.dynamics.com`)
2. **Publisher prefix** (e.g., `contoso`)

Then invoke the `deploy-pcf` skill to handle:
- Authentication (`pac auth create --url <env-url>`)
- Quick push (`pac pcf push --publisher-prefix <prefix>`) — this opens login in the terminal/VS Code
- Confirm success

### If user selects "No, maybe later":

End with:
> "You can deploy anytime later by saying *'Deploy <controlName>'* in this chat."

---

## Common Property Type Mappings

| Use Case | Property Type |
|----------|--------------|
| Text input | `SingleLine.Text` |
| Multi-line text | `Multiple` |
| Whole number | `Whole.None` |
| Decimal number | `Decimal` |
| Currency | `Currency` |
| Yes/No toggle | `TwoOptions` |
| Dropdown | `OptionSet` |
| Multi-select | `MultiSelectOptionSet` |
| Date picker | `DateAndTime.DateOnly` |
| Date + time | `DateAndTime.DateAndTime` |
| Email | `SingleLine.Email` |
| Phone | `SingleLine.Phone` |
| URL | `SingleLine.URL` |

## Additional Properties

If the user wants extra input/configuration properties beyond the bound value, add them to the manifest:
```xml
<property name="maxLength" display-name-key="Max Length" description-key="Maximum character length"
          of-type="Whole.None" usage="input" required="false" default-value="100" />
```

Access in code via `context.parameters.maxLength.raw`.
