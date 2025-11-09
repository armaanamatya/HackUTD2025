import os
import requests
from crewai import LLM
from dotenv import load_dotenv

# Ensure .env values take precedence over any pre-set environment variables
load_dotenv(override=True)


class LLMConfig:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "ollama")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        # Explicit control to allow or disable Gemini fallback when using local provider
        self.allow_gemini_fallback = os.getenv("ALLOW_GEMINI_FALLBACK", "false").lower() == "true"
        
    def get_llm(self) -> LLM:
        if self.provider == "ollama":
            return self._get_ollama_llm()
        elif self.provider == "vllm":
            return self._get_vllm_llm()
        elif self.provider == "gemini":
            return self._get_gemini_llm()
        elif self.provider == "local":
            # Strict local usage by default. Only fallback to Gemini if explicitly allowed.
            if self.allow_gemini_fallback and not self._local_endpoint_available():
                gem_llm = self._maybe_get_gemini_fallback()
                if gem_llm is not None:
                    return gem_llm
            return self._get_local_llm()
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
            api_key="sk-no-key-required", # Required for local OpenAI-compatible servers
        )
    
    def _get_gemini_llm(self) -> LLM:
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        return LLM(
            model="gemini-flash-latest",
            api_key=api_key,
            temperature=0.7,
        )
    
    def _get_local_llm(self) -> LLM:
        base_url = os.getenv("LOCAL_BASE_URL", "http://localhost:8000/v1")
        model = os.getenv("LOCAL_MODEL", "local-model")
        api_key = os.getenv("OPENAI_API_KEY", "sk-no-key-required")
        
        return LLM(
            model=f"openai/{model}",
            base_url=base_url,
            temperature=0.7,
            api_key=api_key,
        )

    def _local_endpoint_available(self) -> bool:
        """Check if the local OpenAI-compatible endpoint is reachable and usable.
        We first GET /models, then attempt a minimal POST to /chat/completions.
        """
        base_url = os.getenv("LOCAL_BASE_URL", "http://localhost:8000/v1")
        model = os.getenv("LOCAL_MODEL", "local-model")
        try:
            # Quick reachability check
            resp = requests.get(f"{base_url}/models", timeout=3)
            if resp.status_code != 200:
                return False

            # Minimal completion probe to catch auth/model issues early
            headers = {
                "Content-Type": "application/json",
            }
            api_key = os.getenv("OPENAI_API_KEY", "sk-no-key-required")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            data = {
                "model": model,
                "messages": [
                    {"role": "user", "content": "ping"}
                ],
                "max_tokens": 5,
                "temperature": 0.0,
            }
            comp = requests.post(f"{base_url}/chat/completions", json=data, headers=headers, timeout=3)
            return comp.status_code == 200
        except Exception:
            return False

    def _maybe_get_gemini_fallback(self) -> LLM | None:
        """Return a Gemini LLM if GEMINI_API_KEY is configured; otherwise None."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        return LLM(
            model="gemini-flash-latest",
            api_key=api_key,
            temperature=0.7,
        )
    
    def get_config_info(self) -> dict:
        if self.provider == "gemini":
            return {
                "provider": self.provider,
                "debug": self.debug,
                "model": "gemini-flash-latest",
                "api_key_set": bool(os.getenv("GEMINI_API_KEY")),
            }
        elif self.provider == "local":
            return {
                "provider": self.provider,
                "debug": self.debug,
                "model": os.getenv("LOCAL_MODEL"),
                "base_url": os.getenv("LOCAL_BASE_URL"),
                "allow_gemini_fallback": self.allow_gemini_fallback,
                "fallback_to_gemini": self.allow_gemini_fallback and (self._local_endpoint_available() is False) and bool(os.getenv("GEMINI_API_KEY")),
            }
        else:
            return {
                "provider": self.provider,
                "debug": self.debug,
                "model": os.getenv(f"{self.provider.upper()}_MODEL"),
                "base_url": os.getenv(f"{self.provider.upper()}_BASE_URL"),
            }


llm_config = LLMConfig()
default_llm = llm_config.get_llm()
