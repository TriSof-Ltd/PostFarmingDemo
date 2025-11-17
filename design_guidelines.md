# Post Farming - Design Guidelines

## Design Approach
**Reference-Based Approach**: Modern SaaS dashboard design inspired by Hootsuite and Buffer
- Focus on clean data presentation and intuitive navigation
- Functional over decorative design philosophy
- Professional business application aesthetic with shadcn/ui styling

## Color System
```
Primary: #09090B (near black) - Headers, primary text
Secondary: #F4F4F5 (light grey) - Section backgrounds
Background: #FFFFFF (white) - Main background
Border: #E4E4E7 (grey) - Dividers, card borders
Accent: #18181B (dark) - Interactive elements
Muted: #71717A (medium grey) - Secondary text, labels
```

## Typography
- **Font Family**: Inter or system font stack
- **Hierarchy**: 
  - Page titles: text-2xl to text-3xl, font-semibold
  - Section headers: text-xl, font-semibold
  - Card titles: text-lg, font-medium
  - Body text: text-sm to text-base
  - Labels/captions: text-xs to text-sm, text-muted

## Layout System
- **Spacing**: Use Tailwind units of 2, 4, 6, and 8 (p-2, p-4, p-6, p-8, gap-4, gap-6, etc.)
- **Container**: max-w-7xl for main content areas
- **Grid System**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for responsive cards
- **Sidebar Navigation**: Fixed left sidebar (w-64) with main content area flex-1

## Component Library (shadcn/ui)
- **Cards**: border border-border, rounded-lg, shadow-sm, bg-white, p-6
- **Buttons**: shadcn default button variants (default, outline, ghost)
- **Forms**: shadcn input, select, textarea components with labels
- **Modals/Dialogs**: shadcn dialog components with overlay
- **Tables**: shadcn table with hover states
- **Charts**: Recharts library for analytics visualization
- **Badges**: shadcn badge for status indicators
- **Dropdowns**: shadcn dropdown-menu for client switcher

## Key Interface Patterns
- **Dashboard Layout**: Sidebar + topbar with breadcrumbs + content area
- **Metric Cards**: Grid of cards showing KPIs with icons and trend indicators
- **Data Tables**: Striped tables with sortable columns and action buttons
- **Calendar View**: Month/week grid with scheduled posts as colored events
- **Inbox Interface**: List view with platform badges, timestamps, and reply inputs
- **Client Switcher**: Dropdown in top-right corner showing current client with avatar

## Visual Treatment
- Minimal shadows (shadow-sm for cards)
- Subtle borders (border-border)
- Rounded corners (rounded-lg for cards, rounded-md for inputs)
- Clean whitespace using consistent padding/margins
- Platform-specific accent colors for Instagram/Facebook/TikTok badges

## Images
No hero images needed. This is a business dashboard application focused on data display and functionality. All visuals come from:
- Social media post preview thumbnails
- Client avatars/logos
- Platform icons (Instagram, Facebook, TikTok)
- Chart visualizations