# Design System Quick Reference

Quick reference guide for developers implementing the design system.

## Color Usage

### Primary Actions
```tsx
// Main CTA buttons, primary actions
bg-black text-white hover:bg-gray-800
```

### Secondary Actions
```tsx
// Less important actions
bg-gray-100 text-gray-900 hover:bg-gray-200
```

### Destructive Actions
```tsx
// Delete, remove, dangerous actions
bg-red-600 text-white hover:bg-red-700
```

### Text Colors
```tsx
text-gray-900    // Headings, primary text
text-gray-700    // Body text
text-gray-600    // Secondary text
text-gray-500    // Muted text, placeholders
```

## Spacing

### Component Spacing (gap, padding)
```tsx
gap-1   = 4px     // Very tight
gap-2   = 8px     // Tight
gap-3   = 12px    // Default internal spacing
gap-4   = 16px    // Default component spacing
gap-6   = 24px    // Section spacing
gap-8   = 32px    // Large section spacing
```

### Margin Helpers
```tsx
mb-1    // 4px
mb-2    // 8px
mb-4    // 16px
mb-6    // 24px
mb-8    // 32px
```

## Typography

### Headings
```tsx
<h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-2xl font-bold text-gray-900">Section Title</h2>
<h3 className="text-lg font-bold text-gray-900">Subsection Title</h3>
```

### Body Text
```tsx
<p className="text-sm text-gray-700">Regular paragraph text</p>
<p className="text-sm text-gray-600">Secondary info text</p>
<p className="text-xs text-gray-500">Small helper text</p>
```

### Labels
```tsx
<label className="block text-sm font-medium text-gray-700 mb-1.5">
  Field Label
</label>
```

## Common Patterns

### Card Container
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Content */}
</div>
```

### Section with Header
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-bold mb-4 pb-2 border-b">Section Title</h3>
  {/* Content */}
</div>
```

### Form Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Form fields */}
</div>
```

### Action Row
```tsx
<div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

## Component Usage

### Button
```tsx
// Primary action
<Button variant="primary" size="md">Save</Button>

// Secondary action
<Button variant="secondary" size="md">Cancel</Button>

// Destructive action
<Button variant="danger" size="md">Delete</Button>

// Loading state
<Button variant="primary" isLoading>Saving...</Button>

// With icon
<Button variant="primary" leftIcon={<PlusIcon />}>Add New</Button>
```

### Input
```tsx
// Basic input
<Input
  label="Field Name"
  placeholder="Enter value..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Required field
<Input
  label="Required Field"
  isRequired
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With error
<Input
  label="Email"
  error="Invalid email format"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With icon
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>
```

### Card
```tsx
// Basic card
<Card padding="md">
  <p>Card content</p>
</Card>

// Card with header
<Card
  header={<h3 className="text-lg font-bold">Card Title</h3>}
  padding="md"
>
  <p>Card content</p>
</Card>

// Elevated card
<Card variant="elevated" padding="lg">
  <p>Important content</p>
</Card>
```

### Toast Notifications
```tsx
import { useToast } from "@/hooks/useToast";

const toast = useToast();

// Success
toast.success("Operation completed successfully");

// Error
toast.error("Something went wrong");

// Warning
toast.warning("Please review before continuing");

// Info
toast.info("New feature available");
```

### StatusBadge
```tsx
// Active status
<StatusBadge status="active" withDot />

// With custom label
<StatusBadge status="maintenance" label="Under Maintenance" />

// Small size
<StatusBadge status="pending" size="sm" />
```

## Responsive Patterns

### Mobile-First Grid
```tsx
// Stack on mobile, 2 cols on tablet, 3 cols on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

### Flex Direction
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Left</div>
  <div className="flex-1">Right</div>
</div>
```

### Hidden on Mobile
```tsx
// Hide on mobile, show on tablet+
<span className="hidden md:inline">Additional Info</span>

// Show on mobile only
<span className="md:hidden">Mobile View</span>
```

## Accessibility Patterns

### Form Labels
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700">
  Email Address
  <span className="text-red-500">*</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <p id="email-error" role="alert">{errorMessage}</p>}
```

### Button States
```tsx
<button
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? "Saving..." : "Save changes"}
>
  {isLoading ? "Saving..." : "Save"}
</button>
```

### Skip to Content
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>
```

## Animation Patterns

### Hover Effects
```tsx
// Button hover
className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]"

// Card hover
className="transition-shadow duration-200 hover:shadow-lg"

// Link hover
className="transition-colors duration-150 hover:text-black"
```

### Loading Spinner
```tsx
<div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
```

### Fade In
```tsx
className="animate-fade-in opacity-0 [animation-fill-mode:forwards]"

// Add to tailwind.config.js:
animation: {
  'fade-in': 'fadeIn 200ms ease-in',
}
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
}
```

## Common Mistakes to Avoid

### DON'T
```tsx
// ❌ Arbitrary values
className="mt-[13px] text-[15px]"

// ❌ Inline styles
style={{ marginTop: '13px', fontSize: '15px' }}

// ❌ Custom colors
className="bg-[#ff0000] text-[#333333]"

// ❌ alert() for user feedback
alert("Saved successfully");

// ❌ Missing loading states
<button onClick={handleSave}>Save</button>
```

### DO
```tsx
// ✅ Design system values
className="mt-3 text-sm"

// ✅ Utility classes
className="mt-3 text-sm text-gray-700"

// ✅ Semantic colors
className="bg-red-600 text-white"

// ✅ Toast notifications
toast.success("Saved successfully");

// ✅ Loading states
<Button isLoading={isSaving} onClick={handleSave}>Save</Button>
```

## Quick Setup Checklist

When starting a new page:

1. Import design system components:
```tsx
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";
```

2. Initialize toast:
```tsx
const toast = useToast();
```

3. Use consistent spacing:
```tsx
<div className="space-y-6">  {/* Between major sections */}
  <Card padding="md">
    <div className="space-y-4">  {/* Between form fields */}
      {/* Content */}
    </div>
  </Card>
</div>
```

4. Add loading states:
```tsx
const [isLoading, setIsLoading] = useState(false);

<Button isLoading={isLoading} onClick={handleAction}>
  Action
</Button>
```

5. Handle errors with toast:
```tsx
try {
  // ... operation
  toast.success("Success message");
} catch (error) {
  toast.error(error.message || "Error message");
}
```

## Resources

- Full documentation: `/docs/02-design/design-system.md`
- Implementation plan: `/docs/02-design/ui-improvement-plan.md`
- Design tokens: `/src/styles/design-tokens.css`
- Component examples: `/src/components/ui/`
