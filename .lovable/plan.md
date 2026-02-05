
# Plan: Fix Copy Link Button and Equal Button Spacing

## Problem

On the Print Preview page action bar:
1. The "Copy Link" functionality is split into an Input field + icon button, which doesn't match the other button styles
2. The buttons don't have equal spacing between them

### Current Layout (Lines 156-188)
```
[Back]                [Print for Patient] [URL Input][📋] [Continue to Feedback]
                                          ↑              
                      Input + icon button - inconsistent with other buttons
```

## Solution

1. Replace the Input + icon button combo with a single "Copy Link" button that matches other buttons
2. Show the URL in a tooltip or keep it hidden (the actual copy functionality remains)
3. Ensure consistent `gap-4` spacing between all buttons

## Technical Changes

### File: `src/pages/PrintPreview.tsx`

Update the action bar section (lines 156-188):

**Before:**
```tsx
<div className="flex items-center gap-3">
  <Button onClick={handlePrint} variant="outline">
    <Printer className="mr-2 h-4 w-4" />
    Print for Patient
  </Button>
  
  {publishedUrl && (
    <div className="flex items-center gap-2">
      <Input 
        value={publishedUrl} 
        readOnly 
        className="w-64 text-sm"
      />
      <Button 
        size="icon" 
        variant="outline"
        onClick={handleCopyUrl}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )}

  <Button onClick={handleContinueToFeedback}>
    ...
  </Button>
</div>
```

**After:**
```tsx
<div className="flex items-center gap-4">
  <Button onClick={handlePrint} variant="outline">
    <Printer className="mr-2 h-4 w-4" />
    Print for Patient
  </Button>
  
  {publishedUrl && (
    <Button 
      variant="outline"
      onClick={handleCopyUrl}
    >
      {copied ? (
        <Check className="mr-2 h-4 w-4 text-green-600" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  )}

  <Button onClick={handleContinueToFeedback}>
    ...
  </Button>
</div>
```

## Visual Result

### Before
```
[Back]    [Print for Patient] [https://...long-url...][📋] [Continue to Feedback]
           ↑ gap-3            ↑ gap-2 (nested)              ↑ gap-3
           Inconsistent spacing and styles
```

### After
```
[Back]    [Print for Patient]    [Copy Link]    [Continue to Feedback]
           ↑ gap-4               ↑ gap-4        ↑ gap-4
           Equal spacing, consistent button styles
```

## Summary

| File | Change |
|------|--------|
| `src/pages/PrintPreview.tsx` | Replace Input + icon button with "Copy Link" button; change `gap-3` to `gap-4` for equal spacing |

The URL is still copied to clipboard when clicked, and the button text changes to "Copied!" with a checkmark for feedback.
