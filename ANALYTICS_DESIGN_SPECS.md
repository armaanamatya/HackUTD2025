# Predictive Analytics - Design Specifications

## 🎨 Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  PREDICTIVE ANALYTICS DASHBOARD                    🔄 ⚙️ 📊         │
│  AI-generated predictions & market trends                           │
│  Last updated: 3 mins ago                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────┬───────────────────────────┐ │
│  │  LEFT COLUMN (2fr)                │  RIGHT COLUMN (1fr)       │ │
│  │                                   │                           │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐      │  🔥 AI Insights          │ │
│  │  │ KPI1 │ │ KPI2 │ │ KPI3 │      │                           │ │
│  │  └──────┘ └──────┘ └──────┘      │  ┌─────────────────────┐ │ │
│  │                                   │  │ ⚠️ Warning Insight  │ │ │
│  │  ┌─────────────────────────────┐  │  │ Confidence: 84%     │ │ │
│  │  │ Regional Risk Prediction    │  │  └─────────────────────┘ │ │
│  │  │                             │  │                           │ │
│  │  │  ▂▃▅▇▆▄▃  (Gradient Bars)  │  │  ┌─────────────────────┐ │ │
│  │  │                             │  │  │ 📈 Growth Signal    │ │ │
│  │  │  Dallas Austin Houston...   │  │  │ Confidence: 91%     │ │ │
│  │  └─────────────────────────────┘  │  └─────────────────────┘ │ │
│  │                                   │                           │ │
│  │  💡 Insight: Dallas shows...     │  ┌─────────────────────┐ │ │
│  │                                   │  │ 🚨 Alert            │ │ │
│  │  ┌────────┐ ┌────────┐           │  │ Confidence: 78%     │ │ │
│  │  │ Model  │ │Dataset │           │  └─────────────────────┘ │ │
│  │  │Accuracy│ │  Size  │           │                           │ │
│  │  │ 94.2%  │ │ 12.3k  │           │  ┌─────────────────────┐ │ │
│  │  └────────┘ └────────┘           │  │ ✅ Stable           │ │ │
│  │                                   │  │ Confidence: 95%     │ │ │
│  └───────────────────────────────────┤  └─────────────────────┘ │ │
│                                      │                           │ │
└──────────────────────────────────────┴───────────────────────────┘ │
```

---

## 📐 Component Dimensions

### Layout Grid
```css
grid-cols-[2fr_1fr]  /* Left: 66.6%, Right: 33.3% */
gap-6                /* 24px between columns */
p-6                  /* 24px padding around entire layout */
```

### KPI Cards
```css
Width:        Auto (33.33% of left column)
Height:       Auto (~100px)
Padding:      p-4 (16px)
Border:       border-l-4 (4px left accent)
Radius:       rounded-xl (12px)
Shadow:       shadow-sm
Hover:        y: -2px, shadow-md
```

### Chart Container
```css
Width:        100% of left column
Height:       300px (chart area)
Padding:      p-6 (24px)
Radius:       rounded-xl (12px)
Background:   bg-white
```

### Insight Cards
```css
Width:        100% of right column
Height:       Auto (~120px)
Padding:      p-4 (16px)
Border:       border-l-4 (4px colored accent)
Radius:       rounded-xl (12px)
Margin:       mb-3 (12px between cards)
Hover:        x: -4px, shadow increase
```

---

## 🎨 Color System

### Primary Palette
```css
/* Backgrounds */
--bg-primary:     #F9FAFB  /* gray-50 */
--bg-card:        #FFFFFF  /* white */
--bg-hover:       #F3F4F6  /* gray-100 */

/* Accents */
--accent-blue:    #3B82F6  /* blue-500 */
--accent-green:   #10B981  /* green-500 */
--accent-yellow:  #FBBF24  /* yellow-400 */
--accent-red:     #EF4444  /* red-400 */

/* Text */
--text-primary:   #111827  /* gray-900 */
--text-secondary: #6B7280  /* gray-500 */
--text-tertiary:  #9CA3AF  /* gray-400 */
```

### Gradient Definitions
```css
/* Bar Chart Gradient */
linear-gradient(
  180deg,
  #3B82F6 0%,   /* blue-500 */
  #10B981 100%  /* green-500 */
)

/* Confidence Bar Gradient */
linear-gradient(
  90deg,
  #3B82F6 0%,
  #10B981 100%
)
```

### Border Colors by Type
```typescript
warning: 'border-yellow-400'  // #FBBF24
growth:  'border-green-400'   // #34D399
alert:   'border-red-400'     // #F87171
```

---

## 📝 Typography Scale

### Headings
```css
h1 (Dashboard Title)
  font-size:   24px (text-2xl)
  font-weight: 600 (semibold)
  color:       gray-900

h2 (Section Title)
  font-size:   18px (text-lg)
  font-weight: 600 (semibold)
  color:       gray-900

h3 (Card Title)
  font-size:   14px (text-sm)
  font-weight: 500 (medium)
  color:       gray-500

h4 (Insight Title)
  font-size:   14px (text-sm)
  font-weight: 500 (medium)
  color:       gray-800
```

### Body Text
```css
Subtitle
  font-size:   14px (text-sm)
  font-weight: 400 (regular)
  color:       gray-500

Description
  font-size:   12px (text-xs)
  font-weight: 400 (regular)
  color:       gray-600
  line-height: relaxed

Caption
  font-size:   12px (text-xs)
  font-weight: 400 (regular)
  color:       gray-400
```

### Metrics
```css
Large Value (KPI)
  font-size:   24px (text-2xl)
  font-weight: 600 (semibold)
  color:       gray-900

Change Percentage
  font-size:   12px (text-xs)
  font-weight: 500 (medium)
  color:       green-500 / red-500
```

---

## 🎬 Animation Specifications

### Entry Animations
```typescript
// Header
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// KPI Cards (staggered)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1, duration: 0.3 }}

// Chart
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3, duration: 0.5 }}

// Insights (staggered)
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
```

### Hover Animations
```typescript
// KPI Card Hover
whileHover={{ 
  y: -2, 
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
}}
transition={{ duration: 0.2 }}

// Insight Card Hover
whileHover={{ 
  x: -4, 
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)' 
}}
transition={{ duration: 0.2 }}

// Icon Button Hover
whileHover={{ scale: 1.1, color: '#3B82F6' }}
whileTap={{ scale: 0.95 }}
```

### Progress Animations
```typescript
// Confidence Bar
initial={{ width: 0 }}
animate={{ width: `${confidence}%` }}
transition={{ 
  delay: 0.5 + index * 0.1, 
  duration: 0.5,
  ease: 'easeOut'
}}
```

---

## 🔲 Shadow System

```css
/* Card Shadows */
shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow:     0 1px 3px 0 rgba(0, 0, 0, 0.1)
shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1)
shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* Custom Shadows */
.card-hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.insight-hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
```

---

## 📊 Chart Specifications

### Bar Chart Settings
```typescript
<BarChart data={predictions}>
  <CartesianGrid 
    vertical={false}           // No vertical lines
    strokeDasharray="3 3"      // Dashed lines
    stroke="#E5E7EB"           // gray-200
  />
  
  <XAxis 
    dataKey="region"
    axisLine={false}           // No axis line
    tickLine={false}           // No tick marks
    tick={{ 
      fill: '#6B7280',         // gray-500
      fontSize: 12 
    }}
  />
  
  <YAxis 
    axisLine={false}
    tickLine={false}
    tick={{ 
      fill: '#6B7280',
      fontSize: 12 
    }}
    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
  />
  
  <Bar 
    dataKey="dropRisk"
    fill="url(#barGradient)"
    radius={[6, 6, 0, 0]}      // Rounded top corners
    maxBarSize={60}            // Max width: 60px
  />
</BarChart>
```

### Tooltip Styling
```typescript
<Tooltip 
  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
  contentStyle={{
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '12px',
  }}
/>
```

---

## 🎯 Spacing System

```css
/* Gap Sizes */
gap-2:  8px
gap-3:  12px
gap-4:  16px
gap-6:  24px

/* Padding Sizes */
p-2:  8px
p-3:  12px
p-4:  16px
p-6:  24px

/* Margin Sizes */
mb-1:  4px
mb-2:  8px
mb-3:  12px
mb-4:  16px
mb-6:  24px
```

---

## 🔄 Responsive Breakpoints

```css
/* Default: Desktop (1024px+) */
grid-cols-[2fr_1fr]

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  grid-cols-1
  /* Stack columns vertically */
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  grid-cols-1
  gap-4
  p-4
  /* Reduce padding and gaps */
}
```

---

## ✨ Interactive States

### Button States
```css
/* Default */
color: gray-400
opacity: 1

/* Hover */
color: blue-500
scale: 1.1

/* Active/Tap */
scale: 0.95
```

### Card States
```css
/* Default */
border: 1px solid gray-100
shadow: shadow-sm

/* Hover */
transform: translateY(-2px)
shadow: shadow-md
border-color: gray-200
```

### Insight Card States
```css
/* Default */
border-left: 4px solid [color]
shadow: shadow-sm

/* Hover */
transform: translateX(-4px)
shadow: 0 4px 16px rgba(0,0,0,0.08)
```

---

## 🎨 Icon System

### Icon Sizes
```typescript
Small:  w-4 h-4  (16px)
Medium: w-5 h-5  (20px)
Large:  w-6 h-6  (24px)
```

### Icon Colors by Context
```typescript
Header Icons:    text-gray-400 hover:text-blue-500
Warning Icon:    text-yellow-600
Growth Icon:     text-green-600
Alert Icon:      text-red-600
Stat Icon:       text-blue-500 / text-green-500
```

---

## 📱 Scrollbar Styling

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;      /* gray-100 */
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D1D5DB;      /* gray-300 */
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;      /* gray-400 */
}
```

---

## 🎯 Accessibility

### Color Contrast Ratios
```
Text on White Background:
- gray-900: 16.1:1 (AAA)
- gray-500: 4.6:1  (AA)
- gray-400: 3.1:1  (AA Large)

Accent Colors:
- blue-500:  4.5:1  (AA)
- green-500: 4.8:1  (AA)
```

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-blue-500
focus:ring-offset-2
```

---

**Design System Version 1.0 - CURA Predictive Analytics**

