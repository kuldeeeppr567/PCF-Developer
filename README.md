# PCF Developer Agent — Setup & Usage Guide

> **Last updated:** May 4, 2026

The PCF Developer Agent is a custom GitHub Copilot Agent Mode for Power Apps Component Framework (PCF) control development. It embeds PCF expertise directly into your VS Code workflow — scaffold, code, style, and deploy controls using natural language, including creating controls from screenshots and design mockups.

This guide provides **step-by-step installation**, **usage examples**, and **troubleshooting** for the complete PCF Developer Agent toolkit.

> There is nothing you can break. Everything in this guide is local, reversible, and safe.

## Quick Links

- [Security Posture](docs/SECURITY.md) — Architecture and security boundaries
- [Architecture](docs/ARCHITECTURE.md) — How the agent, skills, and tools work together
- [Prompt Guide](docs/PROMPT-GUIDE.md) — Ready-to-use prompts for all PCF tasks
- [Contributing](CONTRIBUTING.md) — How to add skills, templates, or improve the agent

---

## Table of Contents

1. [Security Posture](#1-security-posture)
2. [Prerequisites](#2-prerequisites)
3. [Installation (Local)](#3-installation)
4. [Using from Any Device (Codespaces)](#35-using-from-any-device-github-codespaces)
5. [Understanding the Agent](#4-understanding-the-agent)
6. [Usage — Creating Controls](#5-usage--creating-controls)
7. [Usage — Image-Based Creation](#6-usage--image-based-creation)
8. [Usage — Editing Controls](#7-usage--editing-controls)
9. [Usage — Deploying Controls](#8-usage--deploying-controls)
10. [Usage — Deleting Controls](#85-usage--deleting-controls)
11. [Where Controls Are Created](#9-where-controls-are-created)
12. [Troubleshooting](#10-troubleshooting)
13. [Best Practices](#11-best-practices)

---

## 1. Security Posture

> **Local-First** — All AI-assisted work stays on your machine (or in your private Codespace).

| # | Principle | Description |
|---|-----------|-------------|
| 1 | All code stays local | Generated controls remain on your filesystem until you explicitly deploy |
| 2 | Copilot does not retain context | Prompts are processed and discarded — no learning from your code |
| 3 | Authentication is separate | `pac auth` manages credentials independently; agent never touches tokens |
| 4 | Deployment requires confirmation | The agent always asks before pushing to any environment |
| 5 | Generated code is secure | No `innerHTML`, no `eval()`, CSP-compatible patterns, XSS-safe |

Full details: [docs/SECURITY.md](docs/SECURITY.md)

---

## 2. Prerequisites

| Requirement | Version | How to Install |
|-------------|---------|----------------|
| VS Code | 1.99+ | [Download](https://code.visualstudio.com/) |
| GitHub Copilot Extension | Latest | VS Code Extensions → Search "GitHub Copilot" |
| GitHub Copilot Subscription | Active | [GitHub Copilot Plans](https://github.com/features/copilot) |
| Node.js | 18+ | [Download](https://nodejs.org/) |
| .NET SDK | 6.0+ | [Download](https://dotnet.microsoft.com/download) |
| Power Platform CLI | Latest | `dotnet tool install --global Microsoft.PowerApps.CLI.Tool` |

### Verify Prerequisites

```powershell
# Check each tool
node --version        # Should show v18+
dotnet --version      # Should show 6.0+
pac --version         # Should show version number
```

---

## 3. Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/pcf-developer-agent.git
```

### Step 2: Open in VS Code

```bash
cd pcf-developer-agent
code .
```

### Step 3: You're Ready!

No root `npm install` is needed. Each PCF control installs its own dependencies when created by the agent.

### Step 4: Accept Recommended Extensions

VS Code will prompt to install recommended extensions (GitHub Copilot, Power Platform Tools). Click **Install All**.

### Step 5: Select the Agent

1. Open **Copilot Chat** (`Ctrl+Shift+I`)
2. Click the **mode dropdown** (where it says "Agent" / "Ask" / "Plan")
3. Select **"PCF Developer"**

That's it. You're ready to build PCF controls with natural language.

---

## 3.5. Using from Any Device (GitHub Codespaces)

You can use this agent from **any device with a browser** — mobile phone, tablet, or any computer without setup.

### Requirements
- GitHub account (free plan works)
- GitHub Copilot subscription ($10/month or included with your org)

### How to Start a Codespace

1. Go to the repo on GitHub: `github.com/your-org/pcf-developer-agent`
2. Click the green **"Code"** button
3. Select the **"Codespaces"** tab
4. Click **"Create codespace on main"**
5. Wait ~2 minutes (first time only — installs Node.js, .NET, pac CLI automatically)
6. VS Code opens in your browser — select **"PCF Developer"** agent mode
7. Start chatting: *"Create a slider control with range 0 to 100"*

### What's Pre-Installed in Codespaces
| Tool | Version | Installed By |
|------|---------|---|
| Node.js | 18.x | Base image |
| npm | (bundled) | Base image |
| .NET SDK | 8.0 | devcontainer feature |
| pac CLI | Latest | postCreateCommand |
| GitHub Copilot | Latest | VS Code extension |

### Port Forwarding (Preview)
When you run `npm start watch`, port **8181** is automatically forwarded. The browser opens the test harness — works the same as local development.

### Codespace Lifecycle
- **Auto-sleeps** after 30 min of inactivity (saves your free hours)
- **Resumes instantly** when you reopen it (no reinstall needed)
- **Free tier:** 120 core-hours/month (≈ 60 hours on a 2-core machine — more than enough)

### Deploy from Codespace
`pac auth create` and `pac pcf push` work identically — the login flow opens in a new browser tab.

---

## 4. Understanding the Agent

### What Gets Loaded Automatically

| File | Purpose | Loaded When |
|------|---------|-------------|
| `.github/copilot-instructions.md` | PCF patterns, APIs, best practices | Every Copilot interaction |
| `.github/agents/pcf-developer.agent.md` | Agent persona and tool permissions | When you select "PCF Developer" mode |
| `.github/skills/*/SKILL.md` | Task-specific step-by-step workflows | On-demand (matched to your prompt) |

### Available Skills

| Skill | Triggers On |
|-------|------------|
| **create-pcf** | "create", "scaffold", "new PCF control" |
| **create-pcf-from-image** | "screenshot", "image", "looks like this", "mockup" |
| **edit-pcf** | "edit", "add property", "change style", "update" |
| **delete-pcf** | "delete", "remove", "clean up", "delete control" |
| **deploy-pcf** | "deploy", "push", "build solution", "package" |

### Tools the Agent Can Use

| Tool | Purpose |
|------|---------|
| Terminal | Run `pac`, `npm`, `dotnet` commands |
| File read/edit | Create and modify control files |
| Search | Find code patterns across workspace |
| Web fetch | Look up documentation |
| Image analysis | Analyze attached screenshots/mockups |

---

## 5. Usage — Creating Controls

Select "PCF Developer" mode, then type:

### Field Control
```
Create a new PCF field control called RatingStars.
It should display 1-5 clickable stars and bind to a Whole.None field.
```

### Dataset Control
```
Create a dataset PCF control called CustomerCards that displays
records as cards instead of a table.
```

### React Virtual Control
```
Create a React-based PCF field control called ColorPicker.
Bind to SingleLine.Text and store hex color values.
```

The agent will:
1. Check prerequisites (node, npm, pac)
2. Ask clarifying questions if needed (optionally: which folder)
3. Create the project folder (default: `controls/`)
4. Run `pac pcf init` and `npm install`
5. Generate the manifest, TypeScript, and CSS
6. Build and verify
7. Show a summary + CRM setup guide
8. Offer to preview in the test harness
9. Offer to deploy to your environment

---

## 6. Usage — Image-Based Creation

Attach a screenshot or mockup to your message:

### Exact Replication
```
Here is a screenshot of a slider control.
Create a PCF field control that looks exactly like this.
[attach image]
```

### Inspired Creation
```
I'm attaching an image of a color picker.
Build a PCF field control based on this design but add support
for both RGB and HEX input.
[attach image]
```

### What the Agent Extracts from Images
- Layout structure (flex/grid, alignment)
- Colors (extracted as hex values)
- Typography (font sizes, weights)
- Spacing (padding, margins, gaps)
- Interactive elements (buttons, inputs, toggles)
- Border radius, shadows, transitions

### Supported Image Sources
| Source | Works Well For |
|--------|---------------|
| UI screenshots | Replicating existing controls |
| Figma/Sketch exports | Implementing design mockups |
| Wireframes | Quick prototyping |
| Web component screenshots | Bringing patterns to Power Apps |

---

## 7. Usage — Editing Controls

### Add a Property
```
Add a "maxRating" input property (Whole.None, default 5) to my RatingStars control.
```

### Update Styling
```
Update my control's CSS to use rounded corners, box-shadow, and a blue accent color.
```

### Update from Image
```
Look at this image and update my existing control to match this new design.
[attach image]
```

### Integrate a Library
```
Add Chart.js to my control and display a bar chart of the dataset values.
```

---

## 8. Usage — Deploying Controls

### Quick Push (Development)
```
Deploy my RatingStars control to my dev environment.
Publisher prefix: contoso
```

### Solution Package (Production)
```
Create a managed solution package for my RatingStars control.
Publisher: Contoso, prefix: contoso
```

### The Deployment Flow
```
npm run build → pac pcf push (dev)
                   OR
npm run build → pac solution init → dotnet build → pac solution import (production)
```

---

## 8.5. Usage — Deleting Controls

### Delete by Name
```
Delete the Slider control.
```

### Browse and Delete
```
Delete a PCF control.
```

The agent will:
1. List all existing controls in the workspace
2. Show them as options for you to pick
3. Confirm before deleting (shows what will be removed)
4. Remove the entire control folder

---

## 9. Where Controls Are Created

By default, controls are generated inside the `controls/` folder. Each control is **fully self-contained** — it has its own `node_modules/`, `package.json`, and builds independently.

You can specify a different folder when creating a control, but `controls/` is the default.

```
pcf-developer-agent/              ← repository root
├── .github/                      ← agent tooling (committed)
├── docs/                         ← documentation (committed)
├── templates/                    ← reference templates (committed)
├── package.json                  ← repo metadata only
├── controls/
│   ├── RatingStars/              ← YOUR generated control
│   │   ├── RatingStars/
│   │   │   ├── ControlManifest.Input.xml
│   │   │   ├── index.ts
│   │   │   ├── css/RatingStars.css
│   │   │   └── generated/
│   │   ├── node_modules/         ← control's own dependencies
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ColorPicker/              ← another generated control
└── solutions/                    ← solution packages (for deployment)
```

### Standalone Per-Control Architecture

Each control is independent:
- `npm install` runs inside the control folder (e.g., `controls/Slider/`)
- No shared dependencies between controls
- Delete a control folder without affecting others
- Each control can have different dependency versions if needed

### Working with Controls

```bash
# Build a control
cd controls/YourControl
npm run build

# Preview in test harness
npm start watch

# Delete a control (or use the agent: "delete the Slider control")
Remove-Item controls/YourControl -Recurse -Force
```

> **Note:** Build outputs (`out/`) and `generated/` folders are git-ignored. Commit your control source code if you want to version it.

---

## 10. Troubleshooting

### Agent Doesn't Appear in Mode Picker

| Cause | Fix |
|-------|-----|
| VS Code version too old | Update to 1.99+ |
| Copilot extension outdated | Update GitHub Copilot extension |
| Files not in correct location | Verify `.github/agents/pcf-developer.agent.md` exists |
| Cache issue | `Ctrl+Shift+P` → "Developer: Reload Window" |

### `pac` Command Not Found

```powershell
dotnet tool install --global Microsoft.PowerApps.CLI.Tool
```

Then restart your terminal.

### Build Fails After Scaffolding

```powershell
# Regenerate types
npm run build

# If missing dependencies
npm install

# If manifest XML is invalid
# Check for unclosed tags or typos in ControlManifest.Input.xml
```

### Skills Not Triggering

- Ensure you've selected **"PCF Developer"** mode (not default Agent)
- Use keywords that match skill descriptions ("create", "deploy", "image")
- Reload the window if you recently added/modified skill files

### Authentication Errors on Deploy

```powershell
# List existing auth profiles
pac auth list

# Create new profile
pac auth create --url https://yourorg.crm.dynamics.com

# Select a profile
pac auth select --index 1
```

---

## 11. Best Practices

### For Best Agent Results
- **Be specific** — "Bind to Whole.None (1-5)" beats "bind to a number"
- **One task per prompt** — Create first, then edit/style separately
- **Attach images** — Even rough sketches produce better results than words alone
- **State your namespace** — Avoid defaults by specifying upfront

### For Generated Controls
- Always test in the harness (`npm start watch`) before deploying
- Run `npm audit` to check for vulnerable dependencies
- Increment the version in manifest before re-deploying
- Test accessibility with keyboard navigation and screen readers

### For Deployment
- Always test in a dev environment first
- Use managed solutions for production
- Increment control version for updates
- Verify `pac auth` targets the correct environment before pushing

