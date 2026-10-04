import os
import time
from typing import List, Dict, Optional
from pathlib import Path
from django.conf import settings
import requests
from pypdf import PdfReader

class ChatbotService:
    def __init__(self):
        # Obtener API keys
        self.api_keys = self._get_api_keys()
        self.current_api_index = 0
        self.model = os.getenv('MODEL', 'openai/gpt-3.5-turbo')
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.pdf_content = self._load_pdfs()
        self.context_loaded = False
    
    def _get_api_keys(self) -> List[str]:
        """Obtiene todas las API keys"""
        keys = []
        i = 1
        while True:
            key = os.getenv(f'OPENROUTER_API_KEY_{i}')
            if key:
                keys.append(key)
                i += 1
            else:
                break
        return keys
    
    def _load_pdfs(self) -> str:
        """Carga todos los PDFs desde la carpeta media/material_estudio/"""
        pdf_folder = Path(settings.MEDIA_ROOT) / 'material_estudio'
        all_text = ""
        
        if not pdf_folder.exists():
            return ""
        
        pdf_files = list(pdf_folder.glob("*.pdf"))
        if not pdf_files:
            return ""
        
        for pdf_file in pdf_files:
            try:
                with open(pdf_file, 'rb') as file:
                    pdf_reader = PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    all_text += f"\n--- CONTENIDO DE {pdf_file.name} ---\n{text}\n"
            except Exception as e:
                print(f"❌ Error al leer {pdf_file.name}: {str(e)}")
        
        return all_text
    
    def _get_system_prompt(self) -> str:
        """Construye el system prompt"""
        system_prompt = """Eres un especialista académico en marxismo-leninismo y sus principios fundamentales. 
        
Debes responder con:
1. Rigor académico y fundamentación teórica sólida
2. Referencias a autores clásicos del marxismo-leninismo (Marx, Engels, Lenin, etc.)
3. Análisis dialéctico y materialista histórico
4. Vocabulario técnico apropiado
5. Coherencia con los principios del materialismo dialéctico e histórico

PRINCIPIOS FUNDAMENTALES DEL MARXISMO-LENINISMO:
- Materialismo dialéctico
- Materialismo histórico
- Lucha de clases
- Dictadura del proletariado
- Internacionalismo proletario
- Partido de vanguardia
- Imperialismo como fase superior del capitalismo

Siempre mantén un tono académico pero accesible, y fundamenta tus respuestas en la teoría marxista-leninista."""

        if self.pdf_content:
            system_prompt += f"\n\nCONTEXTO DE DOCUMENTOS:\n{self.pdf_content[:3000]}..."
            self.context_loaded = True
        
        return system_prompt
    
    def get_next_api_key(self) -> tuple:
        """Obtiene la siguiente API key circularmente"""
        key = self.api_keys[self.current_api_index]
        index = self.current_api_index
        self.current_api_index = (self.current_api_index + 1) % len(self.api_keys)
        return key, index
    
    def send_message(self, messages: List[Dict[str, str]], max_retries: int = 10) -> Optional[str]:
        """Envía un mensaje al chatbot"""
        if not self.api_keys:
            print("❌ No hay API keys configuradas")
            return None
        
        # Construir mensajes con system prompt
        full_messages = [
            {"role": "system", "content": self._get_system_prompt()}
        ] + messages
        
        attempts = 0
        while attempts < max_retries:
            api_key, api_index = self.get_next_api_key()
            attempts += 1
            
            try:
                print(f"🔄 Intento {attempts} con API #{api_index + 1} - Modelo: {self.model}")
                
                payload = {
                    "model": self.model,
                    "messages": full_messages,
                    "max_tokens": 1500,
                    "temperature": 0.7
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                
                response = requests.post(
                    self.base_url,
                    headers=headers,
                    json=payload,
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Éxito con API #{api_index + 1}")
                    return result['choices'][0]['message']['content']
                
                elif response.status_code == 429:
                    print(f"⚠️ API #{api_index + 1}: Límite alcanzado")
                    continue
                    
                elif response.status_code in [401, 403]:
                    print(f"⚠️ API #{api_index + 1}: Error de autenticación")
                    continue
                    
                else:
                    print(f"❌ API #{api_index + 1}: Error {response.status_code}: {response.text[:100]}")
                    time.sleep(2)
                    continue
                    
            except Exception as e:
                print(f"❌ Excepción con API #{api_index + 1}: {str(e)[:100]}")
                time.sleep(2)
                continue
        
        print("❌ Todas las APIs fallaron")
        return None

'''
import os
import json
import requests
from pathlib import Path
from typing import List, Dict, Any, Optional
from django.conf import settings
from pypdf import PdfReader

class ChatbotService:
    def __init__(self):
        self.api_keys = self._get_api_keys()
        self.current_api_index = 0
        self.model = os.getenv('MODEL', 'openai/gpt-3.5-turbo')
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.pdf_content = self._load_pdfs()
    
    def _get_api_keys(self) -> List[str]:
        keys = []
        i = 1
        while True:
            key = os.getenv(f'OPENROUTER_API_KEY_{i}')
            if key:
                keys.append(key)
                i += 1
            else:
                break
        return keys
    
    def _load_pdfs(self) -> str:
        """Carga todos los PDFs desde la carpeta media/material_estudio/"""
        pdf_folder = Path(settings.MEDIA_ROOT) / 'material_estudio'
        all_text = ""
        
        if not pdf_folder.exists():
            return ""
        
        pdf_files = list(pdf_folder.glob("*.pdf"))
        if not pdf_files:
            return ""
        
        for pdf_file in pdf_files:
            try:
                with open(pdf_file, 'rb') as file:
                    pdf_reader = PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    all_text += f"\n--- {pdf_file.name} ---\n{text}\n"
            except Exception as e:
                print(f"Error al leer {pdf_file.name}: {e}")
        
        return all_text
    
    def get_system_prompt(self) -> str:
        prompt = """Eres un especialista académico en marxismo-leninismo y sus principios fundamentales, incluidas las escuelas freudomarxistas, 
    
Debes responder con:
1. Rigor académico y fundamentación teórica sólida
2. Referencias a autores hombres y mujeres clásicos del marxismo-leninismo (Marx, Engels, Lenin, etc.)
3. Análisis dialéctico y materialista histórico
4. Vocabulario técnico apropiado
5. Coherencia con los principios del materialismo dialéctico e histórico

PRINCIPIOS FUNDAMENTALES DEL MARXISMO-LENINISMO:
- Materialismo dialéctico
- Materialismo histórico
- Lucha de clases
- Dictadura del proletariado
- Internacionalismo proletario
- Partido de vanguardia
- Imperialismo como fase superior del capitalismo

Siempre mantén un tono académico pero accesible, y fundamenta tus respuestas en la teoría marxista-leninista clásica y moderna."""

    ##if self.pdf_content:
        ##prompt += f"\n\nCONTEXTO DE DOCUMENTOS:\n{self.pdf_content[:4000]}..."

        return prompt
    
    def get_next_api_key(self) -> tuple:
        key = self.api_keys[self.current_api_index]
        index = self.current_api_index
        self.current_api_index = (self.current_api_index + 1) % len(self.api_keys)
        return key, index
    
    def send_message(self, messages: List[Dict[str, str]], max_retries: int = 5) -> Optional[str]:
        """Envía un mensaje al chatbot"""
        if not self.api_keys:
            return None
        
        # Construir mensajes completos
        full_messages = [
            {"role": "system", "content": self.get_system_prompt()}
        ] + messages
        
        attempts = 0
        while attempts < max_retries:
            api_key, api_index = self.get_next_api_key()
            attempts += 1
            
            try:
                payload = {
                    "model": self.model,
                    "messages": full_messages,
                    "max_tokens": 1500,
                    "temperature": 0.7
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                
                response = requests.post(
                    self.base_url,
                    headers=headers,
                    json=payload,
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result['choices'][0]['message']['content']
                
                elif response.status_code == 429:
                    continue
                else:
                    continue
                    
            except Exception as e:
                continue
        
        return None '''