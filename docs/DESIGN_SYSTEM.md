# QueryFlow - Design System

## Design Philosophy

QueryFlow embraces a **dark-first, futuristic aesthetic** inspired by modern developer tools (Vercel, Linear, Supabase). The design prioritizes:

- **Clarity** - Information hierarchy and readability
- **Efficiency** - Fast workflows, minimal friction
- **Elegance** - Subtle animations, premium feel
- **Accessibility** - WCAG 2.1 AA compliance

---

## Color Palette

### Base Colors (Dark Mode First)

```css
/* Backgrounds */
--bg-primary: #0a0a0a;        /* Main background */
--bg-secondary: #111111;      /* Cards, panels */
--bg-tertiary: #1a1a1a;       /* Nested elements */
--bg-elevated: #1f1f1f;       /* Modals, dropdowns */
--bg-hover: #252525;          /* Hover states */

/* Borders */
--border-primary: #2a2a2a;     /* Default borders */
--border-secondary: #333333;   /* Subtle dividers */
--border-focus: #4a9eff;      /* Focus rings */

/* Text */
--text-primary: #ffffff;      /* Primary text */
--text-secondary: #a0a0a0;    /* Secondary text */
--text-tertiary: #6b6b6b;     /* Disabled, hints */
--text-inverse: #0a0a0a;      /* Text on colored bg */

/* Accent Colors */
--accent-primary: #4a9eff;    /* Primary actions, links */
--accent-primary-hover: #5fb3ff;
--accent-secondary: #7c3aed;  /* Secondary actions */
--accent-success: #10b981;     /* Success states */
--accent-warning: #f59e0b;     /* Warnings */
--accent-error: #ef4444;       /* Errors, destructive */
--accent-info: #3b82f6;        /* Info messages */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-shadow: rgba(0, 0, 0, 0.3);

/* Gradients */
--gradient-primary: linear-gradient(135deg, #4a9eff 0%, #7c3aed 100%);
--gradient-secondary: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
--gradient-glow: radial-gradient(circle, rgba(74, 158, 255, 0.15) 0%, transparent 70%);
```

### Light Mode (Optional, Future)

```css
/* Light mode tokens (for future implementation) */
--bg-primary-light: #ffffff;
--bg-secondary-light: #f8f9fa;
--text-primary-light: #0a0a0a;
--text-secondary-light: #6b6b6b;
```

---

## Typography

### Font Stack

```css
/* Primary Font - Developer-friendly monospace for code */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', monospace;

/* UI Font - Clean, modern sans-serif */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Display Font - For headings (optional) */
--font-display: 'Inter', var(--font-sans);
```

### Type Scale

```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Labels, captions */
--text-sm: 0.875rem;      /* 14px - Secondary text */
--text-base: 1rem;        /* 16px - Body text */
--text-lg: 1.125rem;      /* 18px - Large body */
--text-xl: 1.25rem;       /* 20px - Small headings */
--text-2xl: 1.5rem;       /* 24px - Section headings */
--text-3xl: 1.875rem;     /* 30px - Page titles */
--text-4xl: 2.25rem;      /* 36px - Hero text */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

### Typography Usage

```css
/* Headings */
h1 { font-size: var(--text-3xl); font-weight: var(--font-bold); }
h2 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
h3 { font-size: var(--text-xl); font-weight: var(--font-semibold); }

/* Body */
body { font-family: var(--font-sans); font-size: var(--text-base); }

/* Code */
code { font-family: var(--font-mono); font-size: 0.9em; }

/* Monospace for data */
.data-table { font-family: var(--font-mono); font-size: var(--text-sm); }
```

---

## Spacing System

### Spacing Scale (8px base)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### Usage Guidelines

- **Component padding**: `--space-4` to `--space-6`
- **Section spacing**: `--space-8` to `--space-12`
- **Page margins**: `--space-6` to `--space-8`
- **Card gaps**: `--space-4` to `--space-6`

---

## Shadows & Elevation

### Shadow System

```css
/* Elevation Levels */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.5);

/* Glow Effects */
--glow-primary: 0 0 20px rgba(74, 158, 255, 0.3);
--glow-success: 0 0 20px rgba(16, 185, 129, 0.3);
--glow-error: 0 0 20px rgba(239, 68, 68, 0.3);

/* Glassmorphism Shadow */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

### Elevation Usage

- **Level 0**: Base elements (no shadow)
- **Level 1**: Cards, panels (`--shadow-sm`)
- **Level 2**: Modals, dropdowns (`--shadow-md`)
- **Level 3**: Tooltips, popovers (`--shadow-lg`)
- **Level 4**: Overlays, dialogs (`--shadow-xl`)

---

## Motion & Animation

### Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations

```css
--duration-fast: 150ms;      /* Hover states, micro-interactions */
--duration-base: 200ms;      /* Standard transitions */
--duration-slow: 300ms;      /* Page transitions, modals */
--duration-slower: 500ms;    /* Complex animations */
```

### Animation Patterns

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Pulse (for loading states) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Usage Guidelines

- **Hover effects**: `150ms` ease-out
- **Button clicks**: `100ms` ease-in
- **Modal open/close**: `200ms` ease-in-out
- **Page transitions**: `300ms` ease-in-out
- **Loading spinners**: Continuous rotation
- **Skeleton loaders**: Pulse animation

---

## Component Styles

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--accent-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

### Cards & Panels

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-base) var(--ease-out);
}

.card:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
}

/* Glassmorphism Card */
.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

### Input Fields

```css
.input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font-family: var(--font-sans);
  transition: all var(--duration-fast) var(--ease-out);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Data Tables

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.table th {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--font-medium);
  border-bottom: 1px solid var(--border-primary);
}

.table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-primary);
}

.table tr:hover {
  background: var(--bg-hover);
}
```

### Code Editor

```css
.editor {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.editor:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}
```

---

## Layout Principles

### Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Header (Fixed)                                 │
│  [Logo] [Nav] [User Menu]                       │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Main Content Area                  │
│ (Fixed)  │  (Scrollable)                        │
│          │                                      │
│ - Nav    │  - Page Header                       │
│ - Links  │  - Content Cards                     │
│          │  - Data Tables                       │
│          │  - Query Editor                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Grid System

```css
/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Grid */
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

### Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## Accessibility

### Focus States

```css
.focus-ring {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

### Color Contrast

- Text on background: **4.5:1** minimum (WCAG AA)
- Large text: **3:1** minimum
- Interactive elements: **3:1** minimum

### Keyboard Navigation

- All interactive elements keyboard accessible
- Tab order follows visual flow
- Skip links for main content
- Escape key closes modals/dropdowns

---

## Implementation Notes

### CSS Variables Setup

All design tokens should be defined in `globals.css` or a dedicated `tokens.css` file and imported at the root level.

### Tailwind Integration

These tokens can be mapped to Tailwind config for utility-first development:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'accent-primary': 'var(--accent-primary)',
        // ... etc
      },
      spacing: {
        // Map to --space-* variables
      },
    },
  },
}
```

### Component Library

Use **shadcn/ui** components as base, customized with these design tokens for consistency.
