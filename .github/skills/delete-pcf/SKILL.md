---
name: delete-pcf
description: Delete an existing PCF control from the workspace. Lists available controls and lets the user choose which one to remove. USE FOR deleting PCF controls, removing controls, cleaning up controls, removing unused PCF components.
---

# Delete PCF Control Skill

## Purpose
Safely delete an existing PCF control project from the workspace. Lists available controls, confirms user selection, then removes the folder.

## When to Use
- User says "delete a PCF control", "remove control", "clean up controls"
- User names a specific control to delete (e.g., "delete the Slider control")

---

## ⚠️ MANDATORY EXECUTION SEQUENCE

```
Step 1: FIND CONTROLS          → List all existing controls
Step 2: ASK WHICH TO DELETE    → Show options, let user pick
Step 3: CONFIRM DELETION       → Ask "Are you sure?"
Step 4: DELETE                  → Remove the folder
Step 5: CONFIRM SUCCESS        → Show what was removed
```

---

## Step 1: Find Existing Controls

Scan the workspace for PCF control folders. Check:
1. The default `controls/` folder at workspace root
2. Any other folder the user may have specified during creation

To detect valid PCF controls, look for folders that contain:
- `ControlManifest.Input.xml` (inside a subfolder with the control name), OR
- A `package.json` with `pcf-scripts` in devDependencies

Run:
```bash
Get-ChildItem -Path "<workspace-root>/controls" -Directory | Select-Object Name
```

If **no controls exist**, tell the user:
> "There are no PCF controls in the workspace to delete."

Stop here.

---

## Step 2: Ask Which Control to Delete

If the user **already specified** which control to delete (e.g., "delete Slider"), skip to Step 3 with that control.

If the user did NOT specify, present the available controls as options:

Ask using the question tool with options listing each control name. Example:
> "Which control would you like to delete?"
> Options: `Slider`, `RatingStars`, `ColorPicker`

Wait for the user to select one.

---

## Step 3: Confirm Deletion

**ALWAYS confirm before deleting.** Show what will be removed:

> **⚠️ This will permanently delete the following:**
> - Folder: `controls/<controlName>/`
> - All source files (index.ts, manifest, CSS, etc.)
> - The control's `node_modules/` and build outputs
>
> **Are you sure you want to delete `<controlName>`?**

Wait for explicit confirmation (yes/sure/do it/confirm).

If user says **no/cancel/never mind** → Stop. Say:
> "Deletion cancelled. No changes were made."

---

## Step 4: Delete the Control

Remove the entire control folder:

```powershell
Remove-Item -Path "<workspace-root>/controls/<controlName>" -Recurse -Force
```

---

## Step 5: Confirm Success

After successful deletion, show:

```
## ✅ Control Deleted

**<controlName>** has been removed from `controls/<controlName>/`.

No other controls were affected.
```

If the deletion failed (folder not found, permission error), report the error clearly.

---

## Edge Cases

### User wants to delete multiple controls
- Process one at a time
- After deleting the first, ask: "Would you like to delete another?"

### Control has uncommitted git changes
- Warn the user: "This control has uncommitted changes. Deleting it will lose those changes. Continue?"

### Control folder doesn't exist at expected path
- Search the workspace for the control name
- If found elsewhere, confirm the path with the user before deleting
