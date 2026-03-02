# Design System Documentation

## Overview

This directory contains the complete design system documentation for the Evolutionflow Admin Studio Management system. The design system provides production-grade UI components, consistent styling, and comprehensive guidelines for building accessible, responsive interfaces.

## Documentation Files

### 1. [Design System](./design-system.md)
**Complete design system specification**

- Design tokens (colors, spacing, typography, shadows, etc.)
- Component library documentation
- Responsive design guidelines
- Accessibility standards (WCAG 2.1 AA)
- Animation and transition guidelines
- File structure and organization

**Use this for:** Understanding the full design system architecture and specifications.

### 2. [UI Improvement Plan](./ui-improvement-plan.md)
**Step-by-step implementation guide**

- Current state analysis
- Phase-by-phase improvements
- Specific code changes needed for each file
- File paths and line numbers
- Implementation priority (High/Medium/Low)
- Testing checklist

**Use this for:** Implementing the design system improvements in existing pages.

### 3. [Quick Reference](./design-system-quick-reference.md)
**Developer quick reference guide**

- Common patterns and snippets
- Component usage examples
- Responsive patterns
- Accessibility patterns
- Quick setup checklist
- Common mistakes to avoid

**Use this for:** Day-to-day development reference when building features.

## Getting Started

### For New Developers

1. **Read:** Start with [design-system.md](./design-system.md) for comprehensive understanding
2. **Implement:** Follow [ui-improvement-plan.md](./ui-improvement-plan.md) for specific changes
3. **Reference:** Keep [design-system-quick-reference.md](./design-system-quick-reference.md) open while coding

### For Existing Features

1. Identify the page/component you're working on
2. Find it in [ui-improvement-plan.md](./ui-improvement-plan.md)
3. Follow the specific improvements outlined
4. Reference [design-system-quick-reference.md](./design-system-quick-reference.md) for code snippets

## Design System Components

### Available Components

| Component | Location | Status |
|-----------|----------|--------|
| Button | `/src/components/ui/Button.tsx` | ✅ Exists (needs update) |
| Input | `/src/components/ui/Input.tsx` | ✅ Created |
| Card | `/src/components/ui/Card.tsx` | ✅ Created |
| Toast | `/src/components/ui/Toast.tsx` | ✅ Created |
| ToastContainer | `/src/components/ui/ToastContainer.tsx` | ✅ Created |
| StatusBadge | `/src/app/admin/components/StatusBadge.tsx` | ✅ Updated |
| useToast Hook | `/src/hooks/useToast.tsx` | ✅ Created |

### Design Tokens

| Resource | Location |
|----------|----------|
| Design Tokens CSS | `/src/styles/design-tokens.css` |
| Global Styles | `/src/app/globals.css` |

## Implementation Status

### Phase 1: Design System Foundation ✅
- [x] Design tokens created
- [x] Core UI components created
- [x] Toast notification system
- [x] StatusBadge enhanced
- [x] Documentation complete

### Phase 2: Page Improvements (Pending)
- [ ] Studios list page
- [ ] Studio create page
- [ ] Studio detail/edit page
- [ ] Studio form component

### Phase 3: Layout Integration (Pending)
- [ ] Add ToastContainer to admin layout
- [ ] Test toast notifications globally

### Phase 4: Responsive Optimizations (Pending)
- [ ] Mobile view optimizations
- [ ] Tablet view optimizations
- [ ] Desktop view enhancements

### Phase 5: Polish (Pending)
- [ ] Loading states and skeleton screens
- [ ] Animations and transitions
- [ ] Accessibility audit
- [ ] Cross-browser testing

## Key Improvements

### Before vs After

#### Notifications
```tsx
// ❌ Before
alert("Studio created successfully!");

// ✅ After
toast.success("Studio created successfully!");
```

#### Buttons
```tsx
// ❌ Before
<button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
  Save
</button>

// ✅ After
<Button variant="primary" size="md" isLoading={isSaving}>
  Save
</Button>
```

#### Forms
```tsx
// ❌ Before
<input
  type="text"
  className="w-full rounded-md border border-gray-300 px-3 py-2"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// ✅ After
<Input
  label="Studio Name"
  isRequired
  error={errors.name}
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

## Design Principles

### 1. Consistency
- Use design tokens for all colors, spacing, typography
- Reuse components instead of creating one-offs
- Follow established patterns

### 2. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Proper focus management

### 3. Responsive
- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### 4. Performance
- Fast animations (<300ms)
- Smooth transitions
- Efficient re-renders
- Progressive enhancement

### 5. User Feedback
- Toast notifications for all operations
- Loading states for async actions
- Clear error messages
- Field-level validation

## File Paths Reference

### Documentation
```
/docs/02-design/
├── README.md                              # This file
├── design-system.md                       # Complete specification
├── ui-improvement-plan.md                 # Implementation guide
└── design-system-quick-reference.md       # Quick reference
```

### Components
```
/src/components/ui/
├── Button.tsx                             # Button component
├── Input.tsx                              # Input field component
├── Card.tsx                               # Card container component
├── Toast.tsx                              # Toast notification component
└── ToastContainer.tsx                     # Toast container

/src/app/admin/components/
├── StatusBadge.tsx                        # Status indicator (updated)
├── ActionMenu.tsx                         # Dropdown menu
├── AdminTable.tsx                         # Data table
└── LoadingSpinner.tsx                     # Loading spinner
```

### Styles
```
/src/styles/
└── design-tokens.css                      # Design system tokens

/src/app/
└── globals.css                            # Global styles
```

### Hooks
```
/src/hooks/
└── useToast.tsx                           # Toast management hook
```

### Pages to Update
```
/src/app/admin/studios/
├── page.tsx                               # List page
├── new/page.tsx                           # Create page
├── [id]/page.tsx                          # Detail page
└── components/
    └── StudioForm.tsx                     # Form component
```

## Color Palette

### Quick Reference
```css
/* Blacks & Grays */
bg-black              /* #000000 - Primary actions */
bg-gray-100           /* #F3F4F6 - Secondary actions */
bg-gray-50            /* #F9FAFB - Backgrounds */
text-gray-900         /* #111827 - Headings */
text-gray-700         /* #374151 - Body text */
text-gray-600         /* #4B5563 - Secondary text */
text-gray-500         /* #6B7280 - Muted text */

/* Success (Green) */
bg-green-600          /* #16A34A - Success actions */
bg-green-50           /* #F0FDF4 - Success backgrounds */
text-green-700        /* #15803D - Success text */

/* Danger (Red) */
bg-red-600            /* #DC2626 - Danger actions */
bg-red-50             /* #FEF2F2 - Error backgrounds */
text-red-700          /* #B91C1C - Error text */

/* Warning (Yellow) */
bg-yellow-500         /* #EAB308 - Warning actions */
bg-yellow-50          /* #FEFCE8 - Warning backgrounds */
text-yellow-700       /* #A16207 - Warning text */

/* Info (Blue) */
bg-blue-600           /* #2563EB - Info actions */
bg-blue-50            /* #EFF6FF - Info backgrounds */
text-blue-700         /* #1D4ED8 - Info text */
```

## Spacing Scale

```css
gap-1   /* 4px  - Very tight */
gap-2   /* 8px  - Tight */
gap-3   /* 12px - Default internal */
gap-4   /* 16px - Default component */
gap-6   /* 24px - Section spacing */
gap-8   /* 32px - Large sections */
```

## Typography Scale

```css
text-xs     /* 12px - Small text, captions */
text-sm     /* 14px - Body text, inputs */
text-base   /* 16px - Large body text */
text-lg     /* 18px - Subsection headings */
text-xl     /* 20px - Section headings */
text-2xl    /* 24px - Page subheadings */
text-3xl    /* 30px - Page titles */
```

## Support

### Questions?

1. Check [design-system-quick-reference.md](./design-system-quick-reference.md) first
2. Review examples in [design-system.md](./design-system.md)
3. Follow implementation steps in [ui-improvement-plan.md](./ui-improvement-plan.md)

### Contributing

When adding new components:

1. Follow the existing component structure
2. Document in [design-system.md](./design-system.md)
3. Add usage examples to [design-system-quick-reference.md](./design-system-quick-reference.md)
4. Update this README

### Testing

Before considering implementation complete:

- [ ] Test on mobile devices (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify keyboard navigation
- [ ] Test with screen reader
- [ ] Check color contrast (use WebAIM checker)
- [ ] Verify touch targets (minimum 44px)
- [ ] Test loading states
- [ ] Test error states
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

## Next Steps

1. **Immediate:** Add ToastContainer to admin layout
2. **Week 1:** Update studios list page with new components
3. **Week 2:** Update create/edit pages and form component
4. **Week 3:** Add loading skeletons and animations
5. **Week 4:** Accessibility audit and final polish

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Material Design 3](https://m3.material.io/)
- [shadcn/ui Examples](https://ui.shadcn.com/)

---

**Last Updated:** 2026-03-02
**Version:** 1.0.0
**Status:** Design System Foundation Complete, Implementation Pending
