# How to Run This Project

This project consists of two main components:
1. **Next.js Frontend Application** (CURA - AI Workspace)
2. **Python Backend** (CrewAI Multi-Agent System)

## Prerequisites

- **Node.js** 18+ and npm (for the frontend)
- **Python** 3.10+ (for the backend)
- **PowerShell** (Windows) or bash (Mac/Linux)

---

## Option 1: Run Frontend Only (Quick Start)

The frontend can run independently with mock data.

### Steps:

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Run the development server:**
   ```powershell
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - The application should load with the CURA AI workspace interface

### What you'll see:
- A modern AI workspace interface
- Quick action cards for:
  - Property Discovery
  - Predictive Analytics
  - Document Intelligence
  - Insight Summary
- Interactive search functionality

---

## Option 2: Run Python Backend (CrewAI System)

The Python backend is a multi-agent system using CrewAI.

### Steps:

1. **Navigate to the backend directory:**
   ```powershell
   cd crewai-llama-system
   ```

2. **Create and activate a virtual environment:**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   (On Mac/Linux: `source .venv/bin/activate`)

3. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```powershell
   # Check if .env.example exists, then copy it
   Copy-Item .env.example .env
   ```
   (If `.env.example` doesn't exist, create a `.env` file manually)

5. **Configure your `.env` file:**
   Open `crewai-llama-system\.env` and add your API keys:
   ```
   # For Google Gemini (example)
   GOOGLE_API_KEY=your_api_key_here
   
   # For Ollama (if using local LLM)
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b-instruct
   ```

6. **Run the main script:**
   ```powershell
   python main.py --mode research --topic "AI multi-agent systems"
   ```
   
   Or for project planning:
   ```powershell
   python main.py --mode project-planning --project-desc "Build a task management app"
   ```

### Available Modes:
- `--mode research --topic "your topic"` - Research mode
- `--mode project-planning --project-desc "description"` - Project planning mode
- `--config` - Show current configuration

---

## Option 3: Run Both (Full Stack)

To run both frontend and backend together:

### Terminal 1 - Frontend:
```powershell
npm install
npm run dev
```

### Terminal 2 - Backend:
```powershell
cd crewai-llama-system
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Configure .env file with your API keys
python main.py --mode research --topic "test"
```

**Note:** Currently, the frontend uses mock data. To connect them, you'll need to:
1. Create API endpoints in the backend
2. Update the frontend API routes to call the backend

---

## Troubleshooting

### Frontend Issues:

**Port already in use:**
```powershell
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module not found errors:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Backend Issues:

**Python not found:**
- Make sure Python 3.10+ is installed and in your PATH
- Try `python3` instead of `python` on Mac/Linux

**Import errors:**
```powershell
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**API key errors:**
- Check that your `.env` file exists in `crewai-llama-system/`
- Verify API keys are correctly set
- For Google Gemini, get a key from: https://makersuite.google.com/app/apikey

**LLM connection errors:**
- If using Ollama, make sure it's running: `ollama serve`
- Pull the model: `ollama pull llama3.1:8b-instruct`

---

## Project Structure

```
HackUTD2025/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx          # Main page
├── crewai-llama-system/   # Python backend
│   ├── src/              # Source code
│   ├── config/           # Configuration
│   ├── main.py           # Entry point
│   └── requirements.txt  # Python dependencies
├── package.json          # Frontend dependencies
└── README.md            # Project overview
```

---

## Quick Commands Reference

### Frontend:
```powershell
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
```

### Backend:
```powershell
cd crewai-llama-system
python main.py --mode research --topic "your topic"
python main.py --config  # Check configuration
```

---

## Next Steps

1. **For Frontend Development:**
   - Customize components in `app/components/`
   - Modify API routes in `app/api/`
   - Update styles in `app/globals.css`

2. **For Backend Development:**
   - Add new agents in `crewai-llama-system/src/agents/`
   - Create new crews in `crewai-llama-system/src/crews/`
   - Add tools in `crewai-llama-system/src/tools/`

3. **To Connect Frontend and Backend:**
   - Create REST API endpoints in the Python backend
   - Update `app/api/agent/route.ts` to call the Python backend
   - Or use the CrewAI system as a service

---

## Need Help?

- Check the main `README.md` for project overview
- See `crewai-llama-system/README.md` for backend details
- Review error messages in the terminal for specific issues

