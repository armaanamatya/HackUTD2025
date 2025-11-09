# Quick Enhancement Prompt for Claude Code

Copy and paste this into Claude Code:

---

**Enhance the Predictive Analytics UI component** (`app/components/PredictiveAnalytics.tsx`) with the following improvements:

## Priority Enhancements

### 1. **Visual Polish**
- Add gradient accents to KPI cards with left border accents
- Implement mini sparkline charts in KPI cards showing trends
- Enhance chart tooltips with richer data (comparisons, sparklines)
- Add interactive legend with show/hide toggles
- Improve color system with better semantic colors for risk levels
- Add smooth animated transitions when data updates

### 2. **Interactive Features**
- Add time period filter (7d, 30d, 90d, Year, All)
- Make chart bars clickable to show detailed modal/overlay
- Add search and sort in insights panel
- Implement expandable insight cards with "View Details"
- Add risk threshold slider filter
- Include comparison view for selected regions

### 3. **Better UX**
- Add loading skeletons matching the layout
- Implement empty states with helpful messaging
- Add keyboard navigation (tab through all elements)
- Improve mobile responsiveness (stack columns, touch-friendly)
- Add toast notifications for actions
- Include contextual tooltips explaining metrics

### 4. **Advanced Features**
- Add PDF/CSV export functionality
- Implement auto-refresh with configurable interval
- Add dark mode support with theme toggle
- Include time series line chart for trends
- Add heatmap for geographic risk distribution
- Implement saved views/bookmarks

### 5. **Micro-interactions**
- Smooth page transitions
- Stagger animations for list items
- Ripple effects on button clicks
- Pulse animations for important metrics
- Hover state enhancements throughout

## Technical Requirements
- Maintain TypeScript types and existing API structure
- Optimize performance (memoization, lazy loading)
- Ensure 60fps animations
- Add error boundaries
- Keep responsive (mobile, tablet, desktop)
- Maintain clean, professional aesthetic

## Design Inspiration
Stripe Dashboard (data clarity), Linear (animations), Vercel Analytics (charts), Apple (minimalism)

**Focus on: Quality over quantity. Start with visual improvements, then add interactivity, then advanced features. Maintain the existing clean aesthetic while making it significantly more polished and user-friendly.**

---

