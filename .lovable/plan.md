
# Plan: Add Outlines to All Buttons

## Overview

Add a subtle border/outline to all buttons throughout the application, including navigation bar buttons. The border will use a darker shade of the primary green color that matches the pressed/active state.

## Design Approach

### Color Selection
- Current primary green: `hsl(127 19% 58%)` - a muted sage green
- Darker green for borders: `hsl(127 19% 45%)` - same hue/saturation, darker lightness
- This creates a cohesive look where the border color matches the overall brand

### Button Variants to Update

| Variant | Current Border | New Border |
|---------|---------------|------------|
| `default` | None | Thin darker green border |
| `destructive` | None | Thin darker red border (matching) |
| `outline` | `border-input` (light) | Change to darker green |
| `secondary` | None | Thin darker green border |
| `ghost` | None | Thin darker green border |
| `link` | None | No change (text-only style) |

---

## Technical Changes

### File: `src/index.css`

Add a new CSS variable for the darker green border color:

```css
:root {
  /* ... existing variables ... */
  --primary-dark: 127 19% 45%;  /* Darker green for borders */
}
```

### File: `src/components/ui/button.tsx`

Update each variant to include a border:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border border-[hsl(127_19%_45%)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-red-700",
        outline: "border border-[hsl(127_19%_45%)] bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-[hsl(127_19%_45%)]",
        ghost: "hover:bg-accent hover:text-accent-foreground border border-[hsl(127_19%_45%)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // ... sizes remain unchanged
    },
  },
);
```

---

## Visual Result

### Before
```
┌──────────────────────────────────────────────────┐
│  [Logo]              Step 1 of 4    [👤] [🚪]    │
│                                      ↑    ↑      │
│                            No borders on icons   │
└──────────────────────────────────────────────────┘

       ┌─────────────────┐
       │  Generate Draft │  ← No visible border
       └─────────────────┘
```

### After
```
┌──────────────────────────────────────────────────┐
│  [Logo]              Step 1 of 4   ┌──┐ ┌──┐    │
│                                    │👤│ │🚪│    │
│                                    └──┘ └──┘    │
│                            Thin green borders ↑  │
└──────────────────────────────────────────────────┘

       ╔═════════════════╗
       ║  Generate Draft ║  ← Thin darker green border
       ╚═════════════════╝
```

---

## Summary

| File | Change |
|------|--------|
| `src/index.css` | Add `--primary-dark` CSS variable for border color |
| `src/components/ui/button.tsx` | Add border classes to all button variants (except link) |

This creates a consistent, professional look across all buttons while maintaining the green color theme of the application.
