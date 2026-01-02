from abc import ABC, abstractmethod
import pypdf
from typing import Optional

class TextExtractor(ABC):
    @abstractmethod
    def extract_text(self, file_path: str, mime_type: str) -> Optional[str]:
        pass

import requests
import io

class PDFTextExtractor(TextExtractor):
    def extract_text(self, file_path: str, mime_type: str) -> Optional[str]:
        if "pdf" not in mime_type:
            return None
        
        try:
            reader = None
            if file_path.startswith('http'):
                response = requests.get(file_path)
                response.raise_for_status()
                f = io.BytesIO(response.content)
                reader = pypdf.PdfReader(f)
            else:
                reader = pypdf.PdfReader(file_path)

            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return None

# Factory or Manager could go here, but keeping it simple for now
