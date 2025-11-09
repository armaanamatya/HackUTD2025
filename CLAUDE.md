# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Setup

**Virtual Environment Location**: Use the UV virtual environment at `./uv/` 

**Activation**: 
```bash
source uv/Scripts/activate  # Windows Git Bash/WSL
# OR
uv\Scripts\activate.bat     # Windows Command Prompt
```

**Installation Commands**:
```bash
# Install dependencies with UV
cd crewai-llama-system
uv pip install -r requirements.txt

# For Google Gemini support (currently configured)
uv pip install "crewai[google-genai]"

# Install missing dependencies as needed
uv pip install litellm qdrant-client
```

## Running the System

**Main CLI Interface**:
```bash
cd crewai-llama-system

# Research mode
python main.py --mode research --topic "your research topic"

# Project planning mode  
python main.py --mode project-planning --project-desc "your project description"

# Check configuration
python main.py --config
```

**Test Configuration**:
```bash
# Quick configuration test
python test_gemini.py

# Test available Gemini models
python test_gemini_models.py

# Basic config check
python run_config.py
```

**Example Scripts**:
```bash
python examples/simple_research_example.py
python examples/project_planning_example.py
```

## Architecture Overview

**Multi-Provider LLM System**: The system supports three LLM providers through a unified configuration pattern:

1. **Ollama** (Local LLM): For local Llama 3.1 8B deployment
2. **vLLM** (Production): High-performance local serving  
3. **Gemini** (Cloud): Currently configured with `gemini-2.0-flash-exp`

**Agent-Crew Pattern**: The system follows CrewAI's agent-crew architecture where:
- **Agents** are individual AI workers with specific roles and tools
- **Crews** orchestrate multiple agents to complete complex workflows
- **Tasks** define specific work with expected outputs and context dependencies

## Key Components

**LLM Configuration** (`config/llm_config.py`):
- `LLMConfig.get_llm()` returns configured LLM instance
- Provider selection via `LLM_PROVIDER` environment variable  
- Automatic fallback handling and error reporting
- `default_llm` is instantiated at module level for agent creation

**Agent Definitions** (`src/agents/base_agents.py`):
- `BaseAgents.create_researcher()` - Senior Research Analyst (max_iter=3)
- `BaseAgents.create_writer()` - Technical Writer (max_iter=3) 
- `BaseAgents.create_project_manager()` - Project Coordinator (max_iter=5, delegation=True)
- `BaseAgents.create_code_analyst()` - Senior Code Analyst (max_iter=3)

**Crew Implementations**:
- `ResearchCrew`: Researcher + Writer for research and reporting
- `ProjectPlanningCrew`: Project Manager + Researcher + Writer for planning workflows
- Memory disabled (`memory=False`) to avoid OpenAI embedding dependencies

**Tool System** (`src/tools/custom_tools.py`):
- `CustomTools.get_file_tools()` - FileReadTool, DirectoryReadTool
- `CustomTools.get_web_tools()` - Currently empty (WebsiteSearchTool removed due to OpenAI dependency)
- Tools are assigned per-agent based on their role requirements

## Environment Configuration

**Required Environment Variables**:
```bash
# Current setup (Gemini)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here

# Alternative: Ollama
LLM_PROVIDER=ollama  
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct

# Alternative: vLLM
LLM_PROVIDER=vllm
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct

# Optional
DEBUG=true
CREWAI_TELEMETRY_OPT_OUT=true
```

**Configuration Precedence**:
1. `.env` file in `crewai-llama-system/`
2. Environment variables
3. Default values in `llm_config.py`

## Common Issues and Solutions

**Unicode Encoding Errors**: The system includes fallback handling for Windows console encoding issues with Unicode characters in CrewAI's output formatting.

**Quota Exhaustion**: Gemini free tier has rate limits (250k tokens/minute). System shows clear error messages with retry timing.

**Missing Dependencies**: 
- LiteLLM is required for CrewAI LLM provider abstraction
- Google GenAI provider requires `crewai[google-genai]` installation
- Qdrant client needed for memory features (currently disabled)

**Model Name Issues**: Gemini model names have evolved:
- Working: `gemini-2.0-flash-exp`  
- Not working: `gemini-1.5-flash`, `gemini/gemini-1.5-flash`

## Development Patterns

**Adding New Crews**:
1. Create crew class inheriting from base pattern in `src/crews/`
2. Initialize with `BaseAgents()` and `CustomTools()`
3. Define tasks with clear descriptions and expected outputs
4. Use `context=[previous_task]` for task dependencies
5. Update imports in `src/crews/__init__.py`
6. Add CLI option in `main.py`

**Agent Customization**:
- Modify backstory and goals in `BaseAgents` methods
- Adjust `max_iter` based on task complexity
- Set `allow_delegation=True` only for coordinator roles
- Assign appropriate tools based on agent capabilities

**LLM Provider Integration**:
1. Add new provider method to `LLMConfig`
2. Update `get_llm()` conditional logic
3. Add environment variable handling
4. Update `get_config_info()` for debugging
5. Test with provider-specific model naming conventions

## File Structure Context

The codebase separates concerns with clear module boundaries:
- `config/` - LLM configuration and provider abstraction
- `src/agents/` - Individual agent definitions and capabilities  
- `src/crews/` - Multi-agent workflow orchestration
- `src/tools/` - Tool definitions and agent capabilities
- `examples/` - Standalone demonstration scripts
- Root level contains CLI interface (`main.py`) and test utilities