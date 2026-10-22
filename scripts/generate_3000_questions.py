import json
import unicodedata
import re
import os

def normalize_text(text):
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("Generator python initialized")
