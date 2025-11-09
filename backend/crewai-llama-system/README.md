# CrewAI Multi-Agent System with Llama 3.1 8B Instruct

A modern multi-agent system built with CrewAI framework and powered by Llama 3.1 8B Instruct model for local inference.

## Features

- **Multi-Agent Workflows**: Research, Code Analysis, and Project Planning crews
- **Local LLM Integration**: Supports both Ollama and vLLM deployments
- **Flexible Configuration**: Easy switching between LLM providers with automatic Gemini fallback when local endpoints fail
- **Custom Tools**: Web search, file operations, and code analysis tools
- **Production Ready**: Modern Python project structure with proper dependency management

## Requirements

- Python 3.10+
- 8GB+ RAM (16GB recommended)
- GPU with 8GB+ VRAM (optional but recommended for better performance)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository>
cd crewai-llama-system
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` to configure your LLM provider:
```bash
# For Ollama (default)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct

# Or for vLLM (production)
LLM_PROVIDER=vllm
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct

# Or for a local OpenAI-compatible endpoint (auto-fallback to Gemini if unreachable)
LLM_PROVIDER=local
LOCAL_BASE_URL=http://localhost:8000/v1
LOCAL_MODEL=mistralai/mistral-nemo-instruct-2407
OPENAI_API_KEY=sk-no-key-required
```

### 3. Setup Local LLM

#### Option A: Ollama (Recommended for Development)
```bash
# Install Ollama from https://ollama.ai/
ollama pull llama3.1:8b-instruct
ollama serve
```

#### Option B: vLLM (Recommended for Production)
```bash
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct --host 0.0.0.0 --port 8000
```

#### Option C: Any OpenAI-Compatible Server
- Point `LOCAL_BASE_URL` to your server (e.g., `http://localhost:8000/v1`).
- Set `LOCAL_MODEL` to the model name your server exposes.
- Use a dummy `OPENAI_API_KEY` (`sk-no-key-required`) if your client requires one. If the local endpoint is unreachable or unusable, the system falls back to Gemini `gemini-flash-latest` automatically (requires `GEMINI_API_KEY`).

## Usage

### Command Line Interface

```bash
# Research Mode
python main.py --mode research --topic "AI multi-agent systems in 2025"

# Code Analysis Mode
python main.py --mode code-analysis --code-path "./src/agents/"

# Project Planning Mode
python main.py --mode project-planning --project-desc "Build a task management app"

# Check Configuration
python main.py --config
```

### Example Scripts

Run the provided examples:

```bash
# Research Example
python examples/simple_research_example.py

# Code Analysis Example
python examples/code_analysis_example.py

# Project Planning Example
python examples/project_planning_example.py
```

### Programmatic Usage

```python
from src.crews import ResearchCrew
from config import llm_config

# Initialize crew
research_crew = ResearchCrew()

# Run research
result = research_crew.run_research("Latest AI developments")
print(result)
```

## Project Structure

```
crewai-llama-system/
├── src/
│   ├── agents/          # Agent definitions
│   ├── crews/           # Multi-agent crew configurations
│   ├── tools/           # Custom tools and integrations
│   └── workflows/       # Flow-based orchestration (future)
├── config/
│   ├── llm_config.py    # LLM configuration management
│   └── __init__.py
├── examples/            # Demo scripts and workflows
├── .env.example         # Environment template
├── requirements.txt     # Python dependencies
├── pyproject.toml       # Modern Python project config
├── main.py              # CLI interface
└── README.md
```

## Available Crews

### 1. Research Crew
- **Agents**: Senior Research Analyst, Technical Writer
- **Purpose**: Conduct thorough research and create comprehensive reports
- **Tools**: Web search, file operations

#### Web Research Tools
 - `tavily`: high-quality search (requires `TAVILY_API_KEY`).
 - `perplexity`: conversational search (requires `PERPLEXITY_API_KEY`).
 - `fetch_web_page`: fetches and extracts readable content from a URL.

Usage tips:
- Search first to find sources, then call `fetch_web_page` to read content.
- Pass tool inputs as single key-value pairs (e.g., `{ "query": "..." }`).
- Do not pass URLs to file tools; they only accept local paths.

### 2. Code Analysis Crew
- **Agents**: Senior Code Analyst, Technical Writer  
- **Purpose**: Analyze code quality, structure, and provide optimization recommendations
- **Tools**: Code analysis, file operations

### 3. Project Planning Crew
- **Agents**: Project Coordinator, Research Analyst, Technical Writer
- **Purpose**: Create detailed project plans with timelines and resource allocation
- **Tools**: Research, file operations, planning templates

## Configuration

### LLM Providers

The system supports multiple LLM deployment options:

- **Ollama**: Easy setup, good for prototyping
- **vLLM**: High-performance, production-ready
- **Custom endpoints**: Configure any OpenAI-compatible API

### Performance Tuning

For optimal performance:

1. **GPU Memory**: Ensure 8GB+ VRAM for Llama 3.1 8B
2. **CPU**: Use multi-core systems for better parallel processing
3. **vLLM**: Provides 2.7x higher throughput vs standard deployments
4. **Batch Size**: Adjust based on available memory

## Troubleshooting

### Common Issues

1. **Connection Errors**
   ```bash
   # Check if LLM server is running
   curl http://localhost:11434/api/tags  # Ollama
   curl http://localhost:8000/v1/models  # vLLM
   curl http://localhost:8000/v1/models  # Local OpenAI-compatible
   ```

2. **Memory Issues**
   - Reduce `max_iter` in agent configurations
   - Use smaller context windows
   - Consider quantized models for lower memory usage

3. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python path in scripts

### Performance Optimization

- Use vLLM for production workloads
- Enable GPU acceleration when available
- Monitor memory usage and adjust batch sizes
- Consider model quantization for resource-constrained environments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [CrewAI](https://github.com/crewAIInc/crewAI) - Multi-agent framework
- [Meta AI](https://ai.meta.com/) - Llama 3.1 model
- [Ollama](https://ollama.ai/) - Easy local LLM deployment
- [vLLM](https://github.com/vllm-project/vllm) - High-performance LLM serving
