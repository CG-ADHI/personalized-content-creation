class BaseLLM:
    def generate(self, prompt: str, max_tokens=256, temperature=0.7):
        raise NotImplementedError
