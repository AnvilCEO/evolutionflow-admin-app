# Design System Documentation

## Overview

Production-grade design system for the Evolutionflow Admin Studio Management system.

## Design Tokens

### Color Palette

#### Primary (Brand Black)
```css
--color-primary-900: #171717 (Main brand color)
--color-primary-800: #262626
--color-primary-700: #404040
```

#### Secondary (Slate Gray)
```css
--color-secondary-500: #64748B
--color-secondary-600: #475569
--color-secondary-700: #334155
```

#### Semantic Colors

**Success (Green)**
```css
--color-success-50: #F0FDF4 (Background)
--color-success-500: #22C55E (Main)
--color-success-700: #15803D (Dark)
```

**Warning (Yellow)**
```css
--color-warning-50: #FEFCE8 (Background)
--color-warning-500: #EAB308 (Main)
--color-warning-700: #A16207 (Dark)
```

**Danger (Red)**
```css
--color-danger-50: #FEF2F2 (Background)
--color-danger-600: #DC2626 (Main)
--color-danger-700: #B91C1C (Dark)
```

**Neutral (Gray)**
```css
--color-neutral-50: #F9FAFB
--color-neutral-100: #F3F4F6
--color-neutral-300: #D1D5DB
--color-neutral-500: #6B7280
--color-neutral-700: #374151
--color-neutral-900: #111827
```

### Spacing Scale

Based on 4px grid system:

```css
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
```

### Typography Scale

**Font Family:**
- Primary: Pretendard (Korean), system-ui fallback
- Mono: JetBrains Mono

**Font Sizes:**
```css
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 30px
--font-size-4xl: 36px
```

**Font Weights:**
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights:**
- Tight: 1.25
- Normal: 1.5
- Relaxed: 1.75

### Border Radius

```css
--radius-sm: 4px (Small elements)
--radius-DEFAULT: 6px (Default)
--radius-md: 8px (Cards, inputs)
--radius-lg: 12px (Large cards)
--radius-xl: 16px (Modals)
--radius-full: 9999px (Pills, badges)
```

### Shadows

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
--shadow-DEFAULT: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

### Z-Index Scale

```css
--z-index-dropdown: 1000
--z-index-sticky: 1020
--z-index-fixed: 1030
--z-index-modal-backdrop: 1040
--z-index-modal: 1050
--z-index-tooltip: 1070
```

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Component Library

### Button

**Variants:**
- `primary`: Black background, white text (main actions)
- `secondary`: Gray background (secondary actions)
- `outline`: Border only (tertiary actions)
- `ghost`: No background (minimal actions)
- `danger`: Red background (destructive actions)

**Sizes:**
- `sm`: 36px height, 12px text
- `md`: 44px height, 14px text (touch-friendly)
- `lg`: 56px height, 16px text

**Props:**
```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import Button from "@/components/ui/Button";

<Button variant="primary" size="md" isLoading={isSubmitting}>
  Save Changes
</Button>

<Button variant="danger" onClick={handleDelete}>
  Delete Studio
</Button>
```

### Input

**Features:**
- Field-level validation
- Error messages with icons
- Helper text
- Left/right icons
- Required indicator
- Touch-friendly (40px minimum height)

**Props:**
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  isRequired?: boolean;
}
```

**Usage:**
```tsx
import Input from "@/components/ui/Input";

<Input
  label="Studio Name"
  isRequired
  error={errors.name}
  placeholder="Enter studio name"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
```

### Card

**Variants:**
- `default`: Standard card with border
- `elevated`: Card with shadow
- `bordered`: Card with thicker border

**Padding:**
- `none`: No padding
- `sm`: 16px
- `md`: 24px (default)
- `lg`: 32px

**Props:**
```typescript
interface CardProps {
  variant?: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
  header?: ReactNode;
  footer?: ReactNode;
}
```

**Usage:**
```tsx
import Card from "@/components/ui/Card";

<Card
  variant="elevated"
  header={<h3 className="font-bold text-lg">Basic Information</h3>}
  footer={<div className="flex gap-2">...</div>}
>
  <div className="space-y-4">
    {/* Card content */}
  </div>
</Card>
```

### StatusBadge

**Statuses:**
- `active`: Green (operational)
- `inactive`: Gray (not operational)
- `suspended`: Red (suspended)
- `pending`: Yellow (waiting approval)
- `approved`: Green (approved)
- `rejected`: Red (rejected)

**Sizes:**
- `sm`: Compact size
- `md`: Default size

**Features:**
- Animated dot indicator
- Border for better contrast
- Accessible color combinations

**Usage:**
```tsx
import StatusBadge from "@/app/admin/components/StatusBadge";

<StatusBadge status="active" label="Operating" withDot />
<StatusBadge status="maintenance" size="sm" />
```

### Toast Notifications

**Types:**
- `success`: Green (successful operations)
- `error`: Red (errors)
- `warning`: Yellow (warnings)
- `info`: Blue (information)

**Features:**
- Auto-dismiss after 5 seconds
- Manual close button
- Smooth enter/exit animations
- Stacked display (top-right)

**Usage:**
```tsx
import { useToast } from "@/hooks/useToast";

const toast = useToast();

// Success
toast.success("Studio created successfully!");

// Error
toast.error("Failed to save changes");

// Warning
toast.warning("This action cannot be undone");

// Info
toast.info("New features available");
```

## Responsive Design

### Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape / Small desktop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement:

```tsx
// Mobile: Stack vertically
// Tablet+: 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input label="First Name" />
  <Input label="Last Name" />
</div>
```

### Touch-Friendly Targets

- Minimum touch target: 44x44px
- Button heights: 44px (md), 56px (lg)
- Input heights: 40px minimum
- Checkbox/radio: 20x20px with 44px clickable area

## Accessibility

### WCAG 2.1 AA Compliance

1. **Color Contrast:**
   - Text: Minimum 4.5:1 ratio
   - Large text: Minimum 3:1 ratio
   - Interactive elements: Minimum 3:1 ratio

2. **Keyboard Navigation:**
   - All interactive elements focusable
   - Visible focus indicators (2px ring)
   - Logical tab order

3. **Screen Readers:**
   - Semantic HTML elements
   - ARIA labels where needed
   - Error messages linked to inputs (`aria-describedby`)

4. **Focus Management:**
   - Visible focus states on all interactive elements
   - Focus trap in modals
   - Skip navigation links

### Best Practices

```tsx
// Good: Proper labeling and error handling
<Input
  id="email"
  label="Email Address"
  type="email"
  error={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>

// Good: Accessible button with loading state
<Button
  isLoading={isSubmitting}
  disabled={isSubmitting}
  aria-label={isSubmitting ? "Saving changes..." : "Save changes"}
>
  Save
</Button>
```

## Animation & Transitions

### Principles

1. **Purposeful:** Animations should have a clear purpose
2. **Fast:** Keep animations under 300ms
3. **Subtle:** Avoid distracting movements
4. **Respecting Motion Preferences:** Support `prefers-reduced-motion`

### Common Animations

```css
/* Fade in/out */
.fade-enter {
  animation: fadeIn 200ms ease-in;
}

/* Slide in from right (toasts) */
.slide-enter {
  animation: slideInRight 300ms ease-out;
}

/* Button hover scale */
.button:hover {
  transform: scale(1.02);
  transition: transform 150ms ease;
}
```

## File Structure

```
src/
├── components/
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Toast.tsx
│       └── ToastContainer.tsx
├── app/
│   └── admin/
│       ├── components/          # Admin-specific components
│       │   ├── StatusBadge.tsx
│       │   ├── ActionMenu.tsx
│       │   └── AdminTable.tsx
│       └── studios/             # Studio management pages
│           ├── page.tsx
│           ├── new/page.tsx
│           ├── [id]/page.tsx
│           └── components/
│               └── StudioForm.tsx
├── styles/
│   └── design-tokens.css        # Design system tokens
├── hooks/
│   └── useToast.tsx             # Toast notification hook
└── docs/
    └── 02-design/
        └── design-system.md     # This file
```

## Usage Guidelines

### Do's

- Use semantic HTML elements
- Follow the spacing scale consistently
- Use design tokens instead of arbitrary values
- Test on mobile devices
- Include loading states for async operations
- Provide clear error messages
- Use accessible color combinations

### Don'ts

- Don't use inline styles (prefer Tailwind classes)
- Don't create one-off spacing values
- Don't use `alert()` for notifications (use Toast)
- Don't skip loading states
- Don't use color alone to convey information
- Don't create inaccessible color combinations

## Future Improvements

- [ ] Dark mode support
- [ ] Data table component with sorting/filtering
- [ ] Skeleton loading screens
- [ ] Modal/Dialog component
- [ ] Dropdown/Select with search
- [ ] Date picker component
- [ ] File upload component
- [ ] Progress indicators
- [ ] Tabs component
- [ ] Tooltip component

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
