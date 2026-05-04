# Prompt Guide

Ready-to-use prompts for the PCF Developer Agent. Copy-paste these into Copilot Chat (with "PCF Developer" mode selected) to get started quickly.

---

## Creating Controls

### Simple Field Control
```
Create a new PCF field control called RatingStars.
It should display 1-5 clickable stars and bind to a Whole.None field.
Namespace: MyControls
```

### Dataset Control
```
Create a dataset PCF control called CustomerCards that displays records
as cards in a grid layout instead of a table. Each card should show
the first 3 columns as title, subtitle, and description.
```

### React Virtual Control
```
Create a React-based PCF field control called ColorPicker.
It should bind to SingleLine.Text and store a hex color value.
Include a color preview swatch and a text input for hex entry.
```

### Control with Multiple Properties
```
Create a PCF field control called ProgressBar that binds to a Decimal field (0-100).
Add input properties for:
- barColor (SingleLine.Text, default "#0078d4")
- showPercentage (TwoOptions, default true)
- height (Whole.None, default 8)
```

---

## Creating from Images

### Exact Replication
```
Here is a screenshot of a toggle switch. Create a PCF field control
that looks exactly like this. It should bind to a TwoOptions field.
[attach image]
```

### Inspired Creation
```
I'm attaching an image of a tag/chip input component. Build a PCF field
control inspired by this design but:
- Bind to SingleLine.Text (store as comma-separated)
- Support adding tags with Enter key
- Support removing tags with X button or Backspace
[attach image]
```

### Update Existing to Match Image
```
Look at this image and update my existing RatingStars control to match
this new design. Keep the same data binding but change the visual style.
[attach image]
```

---

## Editing Controls

### Add a Property
```
Add a "maxRating" input property (Whole.None, default 5) to my
RatingStars control. Update the rendering to use this value instead
of hardcoded 5.
```

### Change Styling
```
Update the styling of my CustomerCards control:
- Add a subtle box shadow to each card
- Use border-radius: 8px
- Add a hover effect that lifts the card slightly
```

### Add Keyboard Navigation
```
Add full keyboard navigation to my RatingStars control:
- Arrow left/right to move between stars
- Enter/Space to select
- Tab to move focus in/out of the control
```

### Integrate a Library
```
Add Chart.js to my ProgressBar control and display a small
sparkline chart showing historical values below the bar.
```

### Add Theming
```
Update my ColorPicker control to use Fluent Design Language tokens
from context.fluentDesignLanguage for colors and border radius.
```

### Add Validation
```
Add validation to my EmailInput control:
- Show red border and error message for invalid email format
- Show character count approaching max length
- Disable submit when invalid
```

---

## Deploying Controls

### Quick Push (Development)
```
Deploy my RatingStars control to my dev environment.
Publisher prefix: contoso
```

### Authenticate
```
Set up authentication to my Power Platform environment at
https://myorg.crm.dynamics.com
```

### Create Solution Package
```
Create a solution package for my RatingStars control.
Publisher name: Contoso
Publisher prefix: contoso
Solution name: ContosoControls
```

### Build Managed Solution
```
Build a managed solution for production deployment of my
CustomerCards control.
```

### Verify Before Deploy
```
Check if my control builds without errors and is ready for deployment.
Run npm audit to check for vulnerabilities.
```

---

## Troubleshooting

### Build Errors
```
My PCF control won't build. Here's the error:
[paste error]
Can you diagnose and fix it?
```

### Fix Manifest
```
I'm getting "Property 'xyz' does not exist on type 'IInputs'" error.
Check if my manifest and code are in sync.
```

### Performance Issues
```
My dataset control is slow with 1000+ records. Can you optimize
the rendering to use virtualization or pagination?
```

---

## Tips for Better Results

1. **Be specific about data types** — "bind to Whole.None (1-5)" is better than "bind to a number"
2. **Mention the namespace** — if you have a preferred namespace, state it upfront
3. **Describe interactions** — "on click", "on hover", "on Enter key" helps the agent add proper events
4. **Attach images when possible** — even a rough sketch gives better results than words alone
5. **One task per prompt** — "Create a control" then "Add hover effects" works better than combining both
