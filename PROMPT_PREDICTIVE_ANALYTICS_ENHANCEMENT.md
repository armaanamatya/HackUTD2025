# Prompt for Claude Code: Enhance Predictive Analytics UI

## Context
I have a Predictive Analytics dashboard component (`app/components/PredictiveAnalytics.tsx`) built with Next.js, React, Tailwind CSS, Recharts, and Framer Motion. The current implementation has a clean, light theme with a two-column layout (2fr + 1fr), KPI cards, gradient bar charts, and an AI insights panel.

## Your Task
Enhance and modernize the Predictive Analytics UI to make it more visually appealing, interactive, and user-friendly. Focus on improving the overall user experience while maintaining the existing clean, professional aesthetic.

## Specific Enhancement Requests

### 1. Visual Design Improvements
- **Enhanced KPI Cards**: 
  - Add subtle gradient backgrounds or colored accent bars on the left
  - Improve typography hierarchy with better font weights and sizes
  - Add sparkline mini-charts or trend indicators showing historical data
  - Include comparison badges (e.g., "Above average", "Below target")
  - Add hover tooltips with additional context

- **Chart Enhancements**:
  - Add a legend with interactive toggles to show/hide data series
  - Implement animated data transitions when data updates
  - Add reference lines for average, target, or threshold values
  - Improve tooltip design with richer information (sparklines, comparisons)
  - Add zoom/pan functionality for detailed exploration
  - Consider adding a second Y-axis if needed for different metrics
  - Add data point markers on hover with smooth animations

- **Color System**:
  - Implement a more sophisticated color palette with semantic colors
  - Add dark mode support with smooth theme transitions
  - Use color to better communicate risk levels (green = low risk, yellow = medium, red = high)
  - Add gradient overlays for visual depth

### 2. Interactive Features
- **Filters & Controls**:
  - Add time period selector (Last 7 days, 30 days, 90 days, Year, All time)
  - Implement region/category filters with multi-select capability
  - Add search functionality within insights panel
  - Include sort options for insights (by confidence, date, type)
  - Add risk threshold slider to filter predictions

- **Drill-Down Functionality**:
  - Make chart bars clickable to show detailed modal/overlay
  - Add "View Details" buttons on insight cards that expand to show full analysis
  - Implement breadcrumb navigation for nested views
  - Add comparison view (compare selected regions side-by-side)

- **Real-time Updates**:
  - Add auto-refresh toggle with configurable interval
  - Show loading skeletons during data refresh
  - Display last updated timestamp with auto-update animation
  - Add notification badges for new insights

### 3. Data Visualization Enhancements
- **Additional Chart Types**:
  - Add a time series line chart showing trends over time
  - Include a heatmap for geographic risk distribution
  - Add a pie/donut chart for asset type distribution
  - Implement a scatter plot for risk vs. value analysis
  - Add small multiples for comparing multiple metrics

- **Better Data Context**:
  - Add statistical summaries (mean, median, standard deviation)
  - Include confidence intervals on predictions
  - Show forecast accuracy metrics
  - Display data quality indicators
  - Add annotations for significant events or milestones

### 4. UX Improvements
- **Loading & Empty States**:
  - Create elegant loading skeletons that match the layout
  - Add empty state illustrations with helpful messaging
  - Implement error states with retry functionality
  - Add optimistic UI updates for better perceived performance

- **Accessibility**:
  - Improve keyboard navigation (tab through all interactive elements)
  - Add ARIA labels for screen readers
  - Ensure sufficient color contrast ratios
  - Add focus indicators for keyboard users
  - Implement skip links for better navigation

- **Responsive Design**:
  - Optimize for mobile devices (stack columns, hide non-essential elements)
  - Add tablet-specific layouts
  - Implement touch-friendly interactions
  - Add swipe gestures for mobile navigation
  - Ensure charts are readable on small screens

### 5. Advanced Features
- **Export & Sharing**:
  - Implement PDF export with branded report generation
  - Add CSV/Excel export for data
  - Include screenshot capture functionality
  - Add shareable links with pre-configured filters
  - Implement email report scheduling

- **Personalization**:
  - Add user preferences (default time period, favorite metrics)
  - Implement custom dashboard layouts (drag-and-drop)
  - Add saved views/bookmarks
  - Include customizable alert thresholds

- **Collaboration**:
  - Add comments/notes on specific insights
  - Implement sharing with team members
  - Add activity feed showing recent changes
  - Include @mentions in comments

### 6. Micro-interactions & Animations
- **Enhanced Animations**:
  - Add page transition animations
  - Implement stagger animations for list items
  - Add smooth chart data transitions
  - Include hover state animations on all interactive elements
  - Add success/error toast notifications
  - Implement progress indicators for long operations

- **Visual Feedback**:
  - Add ripple effects on button clicks
  - Include success checkmarks after actions
  - Show loading spinners for async operations
  - Add subtle pulse animations for important metrics
  - Implement shake animations for errors

### 7. Information Architecture
- **Better Organization**:
  - Add tabbed sections for different analysis views
  - Implement collapsible sections for detailed data
  - Add sticky headers for better navigation
  - Include table of contents for long pages
  - Add quick action buttons in strategic locations

- **Contextual Help**:
  - Add tooltips explaining metrics and terminology
  - Include "What's this?" links for complex concepts
  - Add guided tour for first-time users
  - Implement contextual help panels

## Technical Requirements
- Maintain TypeScript type safety
- Keep existing component structure and props interface
- Ensure backward compatibility with existing API data structure
- Optimize performance (lazy loading, memoization, code splitting)
- Add proper error boundaries
- Implement proper state management (consider using Zustand or Context API if needed)
- Add unit tests for critical functionality
- Ensure all animations are performant (60fps)

## Design Inspiration
- **Stripe Dashboard**: Clean data presentation, excellent use of whitespace
- **Linear**: Smooth animations, great micro-interactions
- **Vercel Analytics**: Modern chart designs, excellent tooltips
- **Apple**: Minimalist design, focus on content
- **Notion**: Flexible layouts, excellent information hierarchy
- **Figma**: Great use of color, excellent hover states

## Success Criteria
The enhanced UI should:
1. Be significantly more visually appealing than the current version
2. Provide better user experience with improved interactivity
3. Maintain excellent performance (no lag or jank)
4. Be fully responsive across all device sizes
5. Be accessible to all users (WCAG 2.1 AA compliant)
6. Include at least 5 major new features from the list above
7. Have smooth, polished animations throughout
8. Maintain the existing clean, professional aesthetic

## Files to Modify
- `app/components/PredictiveAnalytics.tsx` - Main component
- `app/api/agent/route.ts` - May need to update API response structure if adding new data
- Consider creating new sub-components:
  - `KPICard.tsx` - Enhanced KPI card component
  - `ChartContainer.tsx` - Wrapper for charts with controls
  - `InsightCard.tsx` - Enhanced insight card with expand functionality
  - `FilterBar.tsx` - Filter and control components
  - `ExportModal.tsx` - Export functionality modal

## Notes
- Don't break existing functionality - enhance, don't replace
- Maintain the existing color scheme as a base, but feel free to expand it
- Keep the two-column layout but make it more flexible
- Ensure all new features are optional/configurable
- Add proper TypeScript types for all new features
- Include proper error handling for all async operations

---

**Please implement these enhancements step by step, starting with the most impactful visual improvements, then adding interactive features, and finally implementing advanced functionality. Focus on quality over quantity - it's better to have fewer, polished features than many half-implemented ones.**

