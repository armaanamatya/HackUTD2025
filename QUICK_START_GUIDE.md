# 🚀 Quick Start Guide - Predictive Analytics

## ✅ What's Been Built

A **brand new Predictive Analytics dashboard** for CURA that:
- ✨ Matches the Dribbble design aesthetic
- 📊 Features gradient bar charts with regional risk predictions
- 🤖 Displays AI-powered insights with confidence scores
- 🎨 Uses a clean, light theme (Apple-inspired)
- ⚡ Includes smooth Framer Motion animations
- 📱 Responsive two-column layout (2fr + 1fr)

---

## 🎯 How to Test

### 1. **Start the Dev Server**
```bash
cd C:\Users\rishi\Projects\HackUTD2025-1
npm run dev
```

Server will start at: `http://localhost:3000` (or 3001 if 3000 is busy)

### 2. **Access the Dashboard**
Open your browser and navigate to the local URL.

### 3. **Trigger Predictive Analytics**

**Option A: From Home Screen**
- Click the **"Predictive Analytics"** card (purple gradient with 📊 icon)

**Option B: Type a Query**
Type any of these in the search bar:
```
"predict next quarter performance"
"forecast market trends"
"analyze growth patterns"
"show me predictions"
"predict which Texas assets may lose value"
```

### 4. **What You'll See**

**Left Column:**
- 3 KPI cards (Asset Value, Market Efficiency, Risk Factor)
- Gradient bar chart showing regional risk by Texas city
- Model accuracy and dataset size cards at bottom

**Right Column:**
- 4 AI insight cards with:
  - Warning (⚠️ yellow border)
  - Growth (📈 green border)
  - Alert (🚨 red border)
  - Each with confidence score progress bar

---

## 🎨 Visual Features

### Animations to Watch For:
1. **Entry animations**: Cards fade in with stagger effect
2. **Hover effects**: 
   - KPI cards lift up (-2px)
   - Insight cards slide left (-4px)
   - Icons scale up (1.1x)
3. **Progress bars**: Confidence scores animate from 0 to value
4. **Chart tooltips**: Hover over bars to see detailed info

### Color Coding:
- **Blue accent**: Primary actions, chart gradient start
- **Green accent**: Positive trends, chart gradient end
- **Yellow border**: Warning insights
- **Red border**: Alert insights
- **Green border**: Growth insights

---

## 📊 Sample Data

The dashboard currently shows mock data for:

### Regions:
- Dallas (12% risk - highest)
- Austin (7% risk)
- Houston (4% risk - lowest)
- San Antonio (9% risk)
- Fort Worth (6% risk)
- Plano (3% risk)

### Insights:
1. Value drop risk in Dallas (84% confidence)
2. Growth signal in Austin (91% confidence)
3. Market oversupply alert (78% confidence)
4. Stable performance in Houston (95% confidence)

---

## 🔧 Customization

### To Change Mock Data:
Edit `app/api/agent/route.ts` around line 205-253

### To Modify Layout:
Edit `app/components/PredictiveAnalytics.tsx`
- Line 38: Change grid columns ratio
- Line 65: Adjust KPI card count
- Line 140: Modify chart height

### To Add New Insight Types:
1. Update the `type` union in the interface (line 25)
2. Add new case in the insight card rendering (line 218-228)
3. Define new border color and icon

---

## 🎯 Key Files

```
app/
├── components/
│   └── PredictiveAnalytics.tsx    # Main component (287 lines)
├── api/
│   └── agent/
│       └── route.ts               # Data provider (line 205-253)
└── page.tsx                       # Router (line 65)
```

---

## 🐛 Troubleshooting

### Issue: Component doesn't render
**Solution**: Check browser console for errors. Ensure all dependencies are installed:
```bash
npm install recharts framer-motion lucide-react
```

### Issue: Animations not smooth
**Solution**: Check if hardware acceleration is enabled in browser settings.

### Issue: Chart not displaying
**Solution**: Verify `recharts` is installed and data structure matches interface.

### Issue: Wrong mode triggered
**Solution**: Check intent classification keywords in `app/api/agent/route.ts` (line 31-48)

---

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

---

## 🎓 Learning Resources

### Recharts (Charts)
- Docs: https://recharts.org/en-US/
- Examples: https://recharts.org/en-US/examples

### Framer Motion (Animations)
- Docs: https://www.framer.com/motion/
- Examples: https://www.framer.com/motion/examples/

### Tailwind CSS (Styling)
- Docs: https://tailwindcss.com/docs
- Playground: https://play.tailwindcss.com/

---

## ✨ Next Features to Build

1. **Real-time Updates**
   - WebSocket integration
   - Auto-refresh every 5 minutes
   - Live data streaming

2. **Interactive Filters**
   - Date range picker
   - Region selector
   - Risk threshold slider

3. **Export Options**
   - PDF report generation
   - CSV data export
   - Share via email

4. **Drill-down Views**
   - Click region → detailed analysis
   - Click insight → full report
   - Historical comparison

5. **More Chart Types**
   - Line chart for trends
   - Area chart for forecasts
   - Pie chart for distribution

---

## 🎉 Success Checklist

After testing, you should see:
- [x] Clean light-themed dashboard
- [x] 3 KPI cards with colored left borders
- [x] Gradient bar chart (blue→green)
- [x] 4 insight cards on the right
- [x] Smooth animations on load
- [x] Hover effects on all interactive elements
- [x] Confidence progress bars animating
- [x] Custom scrollbar on insights panel
- [x] Model stats at bottom

---

## 💡 Pro Tips

1. **Open DevTools** (F12) to see Framer Motion animations in slow-mo
2. **Resize window** to test responsive behavior
3. **Hover over chart bars** to see detailed tooltips
4. **Try different queries** to see intent classification in action
5. **Check Network tab** to see API response structure

---

## 📞 Need Help?

Check these files for reference:
- `PREDICTIVE_ANALYTICS_IMPLEMENTATION.md` - Full technical docs
- `ANALYTICS_DESIGN_SPECS.md` - Design system details
- `app/components/PredictiveAnalytics.tsx` - Component source

---

**Happy Testing! 🚀**

Built with ❤️ for CURA - Your Agentic AI Workspace

