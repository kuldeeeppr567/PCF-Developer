---
name: deploy-pcf
description: Build, package, and deploy PCF controls to Power Platform environments. Handles npm build, pac pcf push, solution packaging with pac solution init/add-reference, and dotnet build. USE FOR deploying PCF controls, building solutions, pushing to environments, packaging controls, creating managed/unmanaged solutions.
---

# Deploy PCF Control Skill

## Purpose
Build, package, and deploy PCF controls to Power Platform environments. This skill handles the full deployment pipeline from local build verification through solution packaging to environment deployment.

## When to Use
- User says "deploy my control", "push this to my environment"
- User says "build the solution", "package this control"
- User says "create a solution for this control"
- User wants to test the control in a real Power Platform environment
- User needs to create a managed solution for distribution

## Required Tools
- `run_in_terminal` — To execute build and deployment commands
- `read_file` — To verify configuration files
- `vscode_askQuestions` — To confirm environment and deployment settings
- `get_terminal_output` — To check command results

## Prerequisites

Before deployment, verify ALL required tools by running:

```bash
node --version      # Required: for npm build
npm --version       # Required: for npm build
pac --version       # Required: for push/solution commands
dotnet --version    # Required: for solution packaging (dotnet build)
```

**ALL must succeed.** If any fails:
| Tool | Fix |
|------|-----|
| `node`/`npm` | Install from https://nodejs.org |
| `pac` | Run: `dotnet tool install --global Microsoft.PowerApps.CLI.Tool` |
| `dotnet` | Install from https://dotnet.microsoft.com/download (6.0+) |

**Do NOT proceed if any tool is missing.** Show the fix and STOP.

## Execution Steps

### Step 1: Verify Build

Always build first to ensure there are no errors:

```bash
cd controls/<ControlName>
npm run build
```

**If build fails:**
- Check TypeScript errors and fix them
- Verify manifest references match actual files
- Ensure dependencies are installed (`npm install` inside the control folder)
- Check for missing imports

**If build succeeds:**
- Proceed to deployment method selection

### Step 2: Choose Deployment Method

Ask the user (if not already specified):

| Method | Use Case | Command |
|--------|----------|---------|
| **Quick Push** | Dev/test — push directly to environment | `pac pcf push` |
| **Solution Package** | Production — proper ALM with solutions | `pac solution` workflow |

### Step 3A: Quick Push (Development)

For rapid development testing:

```bash
# Ensure authenticated
pac auth list
```

**If not authenticated**, create an auth profile. This will open a login window:
```bash
pac auth create --url https://yourorg.crm.dynamics.com
```

> **Login flow:** The `pac auth create` command opens a Microsoft login page. It first attempts to open inside VS Code (embedded browser). If that's not available, it opens in your default web browser. Sign in with your Power Platform credentials. Once authenticated, the terminal will confirm success.

**After authentication, push the control:**
```bash
cd controls/<ControlName>
pac pcf push --publisher-prefix <prefix>
```

**⚠️ IMPORTANT: Wait for command to fully complete.** The `pac pcf push` command is synchronous — it builds, creates a temporary solution, imports it, publishes customizations, and then deletes the temp solution. This takes 30-90 seconds. Do NOT confirm success until the command exits with code 0.

**After the command exits successfully (exit code 0)**, inform the user:

```
## ✅ Control Deployed Successfully (⏱️ <deployment-time> seconds)

Your control **<ControlName>** is now registered in your environment.

### ⚠️ Important: About the Solution History
If you check **Solutions → History** in Power Apps portal, you'll see:
- `PowerAppsToolsTemp_<prefix>` with Operation: **Uninstall/Delete**

**This is NORMAL and expected.** Here's why:
- `pac pcf push` creates a **temporary** solution to transport the control
- After the control is registered, it **deletes** the temp solution (cleanup)
- Your control IS deployed — it's registered directly in the environment
- The control will appear under **Custom Controls** when you add it to a form

### Solution Type
`pac pcf push` deploys as **Unmanaged** (development/testing only).
For production deployment with a persistent, visible solution, use the **Solution Package** method.

### Next Steps
1. Open **make.powerapps.com** → your environment
2. Navigate to your **Table** → **Forms** → select the form
3. Click the **field** → **Properties** → **Controls** tab
4. Click **"Add control"** → search for `<ControlName>`
5. Select it, choose clients (Web / Phone / Tablet)
6. **Save and Publish** the form
```

**Parameters to confirm with user:**
- `--publisher-prefix` — The publisher prefix (e.g., `contoso`, `custom`)
- Target environment URL (if multiple auth profiles exist)

**Common issues:**
- "No auth profiles found" → Run `pac auth create`
- "Publisher prefix not found" → Verify prefix exists in target environment
- "Control version conflict" → Increment version in manifest

### Step 3B: Solution Packaging (Production)

For proper ALM and distribution:

#### 3B.1: Create Solution Project (if not exists)

```bash
# Create a directory for the solution (at repo root, outside controls/)
mkdir solutions/<ControlName>Solution
cd solutions/<ControlName>Solution

# Initialize the solution project
pac solution init --publisher-name <PublisherName> --publisher-prefix <prefix>

# Add reference to the PCF control
pac solution add-reference --path ../../controls/<ControlName>
```

#### 3B.2: Build the Solution

```bash
# Using dotnet (recommended)
dotnet build

# OR using MSBuild
msbuild /t:build /restore
```

**Build output:** The `.zip` solution file will be in `bin/Debug/` or `bin/Release/`.

#### 3B.3: For Managed Solutions (distribution)

```bash
# Build managed solution
dotnet build --configuration Release
# OR
msbuild /t:build /restore /p:Configuration=Release
```

#### 3B.4: Import Solution to Environment

```bash
# Import unmanaged (for development)
pac solution import --path bin/Debug/<SolutionName>.zip

# Import managed (for production)
pac solution import --path bin/Release/<SolutionName>_managed.zip
```

### Step 4: Verify Deployment

After deployment, guide the user:

1. **Navigate to the Power App** where the control will be used
2. **Add the control to a form/view:**
   - For model-driven apps: Form editor → Select field → Change control → Add custom control
   - For canvas apps: Insert → Get more components → Code tab → Import
3. **Test the control** in the live environment

### Step 5: Version Management

For updates to an already-deployed control:

1. **Increment version** in `ControlManifest.Input.xml`:
   ```xml
   <control ... version="0.0.2" ...>
   ```

2. **Rebuild and redeploy:**
   ```bash
   npm run build
   pac pcf push --publisher-prefix <prefix>
   ```
   
   Or for solutions:
   ```bash
   dotnet build
   pac solution import --path bin/Debug/<SolutionName>.zip --force
   ```

## Authentication Reference

### Create a New Auth Profile
```bash
# Interactive browser login
pac auth create --url https://yourorg.crm.dynamics.com

# Service principal (for CI/CD)
pac auth create --url https://yourorg.crm.dynamics.com \
    --applicationId <app-id> \
    --clientSecret <secret> \
    --tenant <tenant-id>
```

### Manage Auth Profiles
```bash
# List all profiles
pac auth list

# Select a specific profile
pac auth select --index <number>

# Delete a profile
pac auth delete --index <number>

# Clear all profiles
pac auth clear
```

## Troubleshooting

### Build Errors

| Error | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` |
| `Property does not exist on type IInputs` | Run `npm run build` to regenerate types, then fix references |
| `TS2307: Cannot find module './generated/ManifestTypes'` | Ensure manifest XML is valid, run `npm run build` |
| `MSB4019: Microsoft.Pcf.targets not found` | Install PCF tooling: `dotnet tool install --global Microsoft.PowerApps.CLI.Tool` |

### Deployment Errors

| Error | Solution |
|-------|----------|
| `No auth profiles found` | Run `pac auth create --url <env-url>` |
| `Publisher prefix does not exist` | Create publisher in target environment or use existing prefix |
| `Solution import failed - dependency` | Import dependent solutions first |
| `Control version must be incremented` | Update version in manifest |
| `Access denied` | Verify user has System Customizer or System Administrator role |

### Solution Packaging Errors

| Error | Solution |
|-------|----------|
| `dotnet build failed` | Ensure .NET SDK is installed, run `dotnet restore` first |
| `No PCF control references found` | Run `pac solution add-reference --path <control-path>` |
| `Solution XML validation error` | Check `Solution.xml` in the solution project |

## CI/CD Pipeline Example

For automated builds (Azure DevOps / GitHub Actions):

```yaml
# GitHub Actions example
name: Build and Deploy PCF
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Power Platform CLI
        run: dotnet tool install --global Microsoft.PowerApps.CLI.Tool
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./<ControlName>
      
      - name: Build control
        run: npm run build
        working-directory: ./<ControlName>
      
      - name: Build solution
        run: dotnet build --configuration Release
        working-directory: ./<SolutionName>
      
      - name: Upload solution artifact
        uses: actions/upload-artifact@v4
        with:
          name: solution
          path: ./<SolutionName>/bin/Release/*.zip
```

## Deployment Checklist

Before deploying to production:
- [ ] Build succeeds without errors or warnings
- [ ] Control version has been incremented
- [ ] Control tested in test harness (`npm start watch`)
- [ ] Control tested in a dev environment
- [ ] Accessibility verified (keyboard nav, screen reader)
- [ ] Performance acceptable (no excessive re-renders)
- [ ] Error states handled gracefully
- [ ] Solution exported as managed for production
- [ ] Deployment plan communicated to team
