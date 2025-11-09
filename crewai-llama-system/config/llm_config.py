import os
from crewai import LLM
from dotenv import load_dotenv, find_dotenv, dotenv_values

load_dotenv(override=True)


class LLMConfig:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "gemini")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
    def get_llm(self) -> LLM:
        if self.provider == "ollama":
            return self._get_ollama_llm()
        elif self.provider == "vllm":
            return self._get_vllm_llm()
        elif self.provider == "gemini":
            return self._get_gemini_llm()
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def _get_ollama_llm(self) -> LLM:
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct")
        
        return LLM(
            model=f"ollama/{model}",
            base_url=base_url,
            temperature=0.7,
        )
    
    def _get_vllm_llm(self) -> LLM:
        base_url = os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
        model = os.getenv("VLLM_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
        
        return LLM(
            model=f"openai/{model}",
            base_url=base_url,
            temperature=0.7,
        )
    
    def _get_gemini_llm(self) -> LLM:
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")

        return LLM(
            model=f"google/{model}",
            api_key=api_key,
            temperature=0.7,
        )
    
    def get_config_info(self) -> dict:
        def _env_source(var_name: str) -> str:
            dotenv_path = find_dotenv(usecwd=True)
            file_vals = dotenv_values(dotenv_path) if dotenv_path else {}
            file_val = file_vals.get(var_name)
            env_val = os.getenv(var_name)
            if file_val is None:
                return "os_environment"
            return "env_file" if env_val == file_val else "os_environment"

        if self.provider == "gemini":
            return {
                "provider": self.provider,
                "debug": self.debug,
                "model": os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"),
                "api_key_set": bool(os.getenv("GEMINI_API_KEY")),
                "provider_source": _env_source("LLM_PROVIDER"),
            }
        else:
            return {
                "provider": self.provider,
                "debug": self.debug,
                "model": os.getenv(f"{self.provider.upper()}_MODEL"),
                "base_url": os.getenv(f"{self.provider.upper()}_BASE_URL"),
                "provider_source": _env_source("LLM_PROVIDER"),
            }


llm_config = LLMConfig()
default_llm = llm_config.get_llm()
