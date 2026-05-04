# Architecture

## How the PCF Developer Agent Works

This repository is a **file-based AI agent** — there are no servers, no APIs, no runtime processes. It works entirely through VS Code's GitHub Copilot extension, which reads local markdown files to configure its behavior.

## Components

```
┌─────────────────────────────────────────────────────────────────────┐
│  VS Code Workspace                                                   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  GitHub Copilot Extension                                        │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐    ┌──────────────────────────────────────┐ │ │
│  │  │ PCF Developer   │    │ Skills (loaded on-demand)             │ │ │
│  │  │ Agent Mode      │───►│                                      │ │ │
│  │  │                 │    │  create-pcf       → Scaffold new      │ │ │
│  │  │ (.agent.md)     │    │  create-from-image → Image analysis   │ │ │
│  │  │                 │    │  edit-pcf         → Modify existing   │ │ │
│  │  │                 │    │  deploy-pcf       → Build & deploy    │ │ │
│  │  └────────┬────────┘    └──────────────────────────────────────┘ │ │
│  │           │                                                       │ │
│  │  ┌────────▼────────────────────────────────────────────────────┐ │ │
│  │  │ Global Instructions (.github/copilot-instructions.md)       │ │ │
│  │  │ • PCF lifecycle methods, property types, best practices     │ │ │
│  │  │ • Automatically included in EVERY Copilot interaction       │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ Templates            │  │ Tools Available       │                  │
│  │ • field-control      │  │ • Terminal (execute)  │                  │
│  │ • dataset-control    │  │ • File read/edit      │                  │
│  │ • react-control      │  │ • Search              │                  │
│  └──────────────────────┘  │ • Web fetch           │                  │
│                             │ • Image analysis      │                  │
│                             └──────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## File Roles

| File | Role | Loaded When |
|------|------|-------------|
| `.github/copilot-instructions.md` | Global context — PCF patterns, lifecycle, APIs | **Always** (every interaction) |
| `.github/agents/pcf-developer.agent.md` | Agent persona — tools, behavior, mode definition | When user selects "PCF Developer" mode |
| `.github/skills/*/SKILL.md` | Task-specific workflows with step-by-step instructions | On-demand, matched by description |
| `templates/*/template.md` | Boilerplate code referenced by skills | When skills need them |

## How Copilot Discovers Files

```
User opens workspace
       │
       ▼
Copilot scans .github/ folder
       │
       ├── copilot-instructions.md  → Loaded into every prompt (global context)
       │
       ├── agents/*.agent.md        → Registered as selectable modes in chat
       │
       └── skills/*/SKILL.md        → Indexed by description for on-demand matching
```

## Request Flow

When a user types a prompt like "Create a PCF field control called RatingStars":

```
1. User prompt
       │
       ▼
2. Copilot loads:
   • Global instructions (copilot-instructions.md)
   • Agent persona (pcf-developer.agent.md)
       │
       ▼
3. Copilot matches prompt to skill:
   • "create" + "PCF" + "field control" → create-pcf/SKILL.md
       │
       ▼
4. Agent follows skill steps:
   • mkdir RatingStars
   • pac pcf init --namespace ... --name RatingStars --template field
   • npm install
   • Edit manifest, index.ts, CSS
   • npm run build
       │
       ▼
5. Output: Complete, building PCF control in workspace
```

## Skill Matching

Skills are discovered via their `description` field in YAML frontmatter. The description contains trigger keywords:

| Skill | Trigger Phrases |
|-------|-----------------|
| `create-pcf` | "create", "scaffold", "new PCF", "init" |
| `create-pcf-from-image` | "image", "screenshot", "mockup", "looks like this" |
| `edit-pcf` | "edit", "modify", "add property", "change style", "update" |
| `deploy-pcf` | "deploy", "push", "build solution", "package" |

## Tool Permissions

The agent declares tool aliases that grant specific capabilities:

| Alias | Capabilities |
|-------|-------------|
| `execute` | Run terminal commands (pac, npm, dotnet) |
| `read` | Read file contents |
| `edit` | Create and modify files |
| `search` | Search workspace files and text |
| `web` | Fetch URLs for documentation |
| `todo` | Track multi-step tasks |
| `agent` | Invoke subagents for complex subtasks |

## Where Generated Controls Live

Controls are created as **sibling folders** at the workspace root:

```
pcf-developer-agent/           ← this repo (workspace root)
├── .github/                   ← agent tooling
├── templates/                 ← reference boilerplate
├── RatingStars/              ← generated control
│   ├── RatingStars/
│   │   ├── ControlManifest.Input.xml
│   │   ├── index.ts
│   │   └── css/
│   ├── package.json
│   └── tsconfig.json
└── AnotherControl/           ← another generated control
```

These generated folders are git-ignored (`node_modules/`, `out/`, etc.) so they don't pollute the agent repo.
