# Contributing

Thank you for your interest in improving the PCF Developer Agent. This guide explains how to add new skills, templates, or improve existing functionality.

## What You Can Contribute

| Contribution | Where | Impact |
|-------------|-------|--------|
| New skill | `.github/skills/<name>/SKILL.md` | Adds new agent capability |
| New template | `templates/<name>/template.md` | Adds reusable code pattern |
| Agent improvements | `.github/agents/pcf-developer.agent.md` | Changes agent behavior |
| Global instructions | `.github/copilot-instructions.md` | Affects all interactions |
| Documentation | `docs/` or `README.md` | Helps users |

## Adding a New Skill

1. Create a folder under `.github/skills/`:
   ```
   .github/skills/your-skill-name/SKILL.md
   ```

2. Add YAML frontmatter with a descriptive `description`:
   ```yaml
   ---
   name: your-skill-name
   description: "Brief description with trigger keywords. USE FOR: keyword1, keyword2, keyword3."
   ---
   ```

3. Write the skill body with:
   - **Purpose** — What this skill does
   - **When to Use** — Trigger conditions
   - **Execution Steps** — Numbered steps the agent follows
   - **Output** — What the user gets

4. Test by selecting the PCF Developer agent and typing a prompt that should trigger your skill.

### Skill Description Best Practices

The `description` field is how Copilot discovers your skill. Include:
- Action verbs matching user intent ("create", "fix", "deploy")
- Object nouns ("PCF control", "manifest", "solution")
- A `USE FOR:` suffix with explicit trigger phrases

**Good:** `"Fix common PCF build errors and TypeScript compilation issues. USE FOR: build errors, TypeScript errors, compilation failures, npm build fails."`

**Bad:** `"A helpful skill for fixing things."`

## Adding a New Template

1. Create a folder under `templates/`:
   ```
   templates/your-template/template.md
   ```

2. Use `{{PLACEHOLDER}}` variables for values that change per control:
   - `{{CONTROL_NAME}}` — PascalCase control name
   - `{{CONTROL_NAME_LOWER}}` — lowercase for CSS classes
   - `{{NAMESPACE}}` — Control namespace
   - `{{DESCRIPTION}}` — Control description
   - `{{PROPERTY_TYPE}}` — Bound property data type

3. Include complete, working code for:
   - `ControlManifest.Input.xml`
   - `index.ts`
   - CSS file
   - React components (if applicable)

## Modifying the Agent

Edit `.github/agents/pcf-developer.agent.md`:

- **Frontmatter** — Change tools, description, or model
- **Body** — Change persona, behavior rules, response style

**Be careful:** Changes to the agent affect ALL interactions. Test thoroughly.

## Testing Your Changes

1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Open Copilot Chat → Select "PCF Developer" mode
3. Type a prompt that should trigger your new/modified skill
4. Verify the agent follows your instructions correctly

## Code Style

- Use clear, concise markdown
- Include code blocks with language identifiers (```typescript, ```xml, etc.)
- Use tables for structured information
- Keep SKILL.md files focused on one task

## Submitting Changes

1. Fork this repository
2. Create a feature branch: `git checkout -b feat/your-skill-name`
3. Make your changes
4. Test with the PCF Developer agent
5. Submit a pull request with:
   - What you added/changed
   - How to test it (example prompt)
   - Any known limitations
