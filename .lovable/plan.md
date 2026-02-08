

# Plan: Top-Center Auto-Sizing Toasts with 1-Second Duration

## What Changes

All toast notifications will:
1. Appear at the **top-center** of the screen
2. Auto-dismiss after **1 second**
3. **Auto-size to fit their text content** (no fixed width -- the box wraps tightly around the message)

## Technical Details

### 1. File: `src/hooks/use-toast.ts` (line 6)

Reduce the remove delay from 2000ms to 1000ms:

```
// Before
const TOAST_REMOVE_DELAY = 2000;

// After
const TOAST_REMOVE_DELAY = 1000;
```

### 2. File: `src/components/ui/toast.tsx` -- ToastViewport (line 17)

Reposition viewport to top-center and allow content-based sizing:

```
// Before
"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:left-0 sm:top-auto sm:flex-col md:max-w-[420px]"

// After
"fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex max-h-screen flex-col-reverse items-center p-4"
```

Key changes:
- `left-1/2 -translate-x-1/2` centers it horizontally
- Removed `w-full` and `md:max-w-[420px]` so the viewport doesn't force a fixed width
- Removed `sm:bottom-0 sm:left-0 sm:top-auto sm:flex-col` (no more bottom-left on desktop)
- Added `items-center` so toast children center within the viewport

### 3. File: `src/components/ui/toast.tsx` -- toastVariants (line 26)

Make each toast box shrink-to-fit its content and animate from top:

```
// Before
"group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-left-full"

// After
"group pointer-events-auto relative flex w-auto items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full"
```

Key changes:
- `w-full` changed to `w-auto` so the box sizes to its text content
- `slide-out-to-left-full` changed to `slide-out-to-top-full` (exits upward to match top position)
- Removed `sm:slide-in-from-left-full` (no more left-slide on desktop)

## Summary

| File | Change | Effect |
|------|--------|--------|
| `src/hooks/use-toast.ts` | `TOAST_REMOVE_DELAY` 2000 to 1000 | Toasts auto-dismiss after 1 second |
| `src/components/ui/toast.tsx` | Viewport classes | Toasts appear at top-center, no fixed width |
| `src/components/ui/toast.tsx` | Toast variant classes | Box auto-sizes to content, slides from top |

