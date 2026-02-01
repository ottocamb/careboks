

# Fix Markdown Text Rendering Issue

## Problem Summary
The AI generates content with Markdown formatting (like `**bold**` and `*` for bullets), but the SectionBox component displays it as plain text. This results in users seeing raw asterisks instead of formatted text.

---

## Root Cause

| Component | Current Behavior |
|-----------|------------------|
| `supabase/functions/generate-patient-document-v2/prompts.ts` | Instructs AI to "prioritize writing in bullet points" which produces Markdown-style formatting |
| `src/components/SectionBox.tsx` (line 157) | Renders content as: `<p className="whitespace-pre-wrap">{content}</p>` - plain text only |
| Missing | No Markdown-to-HTML parser exists in the project |

---

## Solution: Add Markdown Rendering Support

We'll add a Markdown parser to properly render the AI-generated content with formatting.

### Approach
1. Install a lightweight Markdown renderer (`react-markdown`)
2. Update `SectionBox.tsx` to parse and render Markdown content
3. Apply consistent styling for Markdown elements (lists, bold, italic)

---

## Implementation Details

### Step 1: Install react-markdown

Add the `react-markdown` package which is a lightweight, secure Markdown renderer for React.

### Step 2: Update SectionBox.tsx

Replace the plain text rendering with Markdown support:

**Current (line 156-158):**
```text
<div className="prose prose-sm max-w-none">
  <p className="whitespace-pre-wrap text-foreground">{content}</p>
</div>
```

**Updated:**
```text
<div className="prose prose-sm max-w-none">
  <ReactMarkdown>{content}</ReactMarkdown>
</div>
```

### Step 3: Add Tailwind Prose Styling (Optional Enhancement)

The component already uses `prose prose-sm` classes. We'll ensure proper styling for:
- Bold text (`**text**`)
- Bullet lists (`*` or `-`)
- Numbered lists (`1.`, `2.`)
- Headings if any

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Add dependency | Install `react-markdown` |
| `src/components/SectionBox.tsx` | Modify | Import and use ReactMarkdown for content rendering |

---

## Visual Before/After

**Before:**
```text
Here are the important contact details for your healthcare team:

**Emergency Services:**

*   **Call 112 immediately** for any life-threatening emergencies
```

**After:**
Here are the important contact details for your healthcare team:

**Emergency Services:**

• **Call 112 immediately** for any life-threatening emergencies

---

## Why This Approach

| Alternative | Reason Not Chosen |
|-------------|-------------------|
| Change AI to output plain text | Would lose useful formatting (bold for emphasis, bullets for lists) that improves readability |
| Use dangerouslySetInnerHTML | Security risk - Markdown library handles sanitization safely |
| Custom regex replacement | Fragile, doesn't handle edge cases, reinvents the wheel |

