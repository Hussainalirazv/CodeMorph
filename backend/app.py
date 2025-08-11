from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from fastapi.middleware.cors import CORSMiddleware
import torch
import os
import google.generativeai as genai
import re

MODELS_DIR = "models" 
os.makedirs(MODELS_DIR, exist_ok=True)

app = FastAPI()

GEMINI_API_KEY = "AIzaSyBDRkrdAFhvRr9j3EDxLI4NdzwjYFlV6Ew"  
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

origins = [
    "http://localhost",
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],    
    allow_headers=["*"],    
)

class TranslationRequest(BaseModel):
    source_code: str
    source_lang: str
    target_lang: str

loaded_models = {}

async def correct_with_gemini(code: str, source_lang: str, target_lang: str) -> str:
    prompt = f""" only translate this code, don't give any kind-off explanation
    {code}
    """
    
    try:
        response = await gemini_model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini correction failed: {e}")
        return code  

def post_process_translated_c_code(code_str: str) -> str:
    if '#include' not in code_str:
        code_str.insert(0, '#include <stdio.h>') # type: ignore

    code_str = code_str.replace("NEW_LINE", "\n")

    code_str = code_str.replace("DEDENT", "")

    code_str = re.sub(r'\s+;', ';', code_str)
    code_str = re.sub(r'\s+,', ',', code_str)

    code_str = re.sub(r'\(\s+', '(', code_str)
    code_str = re.sub(r'\s+\)', ')', code_str)

    code_str = re.sub(r'\s*=\s*', ' = ', code_str)
    code_str = re.sub(r'\s*\+\s*', ' + ', code_str)
    code_str = re.sub(r'\s*-\s*', ' - ', code_str)
    code_str = re.sub(r'\s*\*\s*', ' * ', code_str)
    code_str = re.sub(r'\s*/\s*', ' / ', code_str)
    code_str = re.sub(r'\s*<\s*', ' < ', code_str)
    code_str = re.sub(r'\s*>\s*', ' > ', code_str)

    code_str = re.sub(r'\s+,', ',', code_str)

    code_str = re.sub(r'\n\s*\n', '\n', code_str)

    code_str = code_str.replace('% d', '%d')  

    code_str = code_str.replace(';', ';\n')
    code_str = code_str.replace('{', '{\n')
    code_str = code_str.replace('}', '\n}')

    lines = code_str.split('\n')
    formatted_lines = []
    indent_level = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line == '}':
            indent_level -= 1
        formatted_lines.append('    ' * indent_level + line)
        if line.endswith('{'):
            indent_level += 1


    lines = [line.strip() for line in code_str.split('\n')]
    code_str = '\n'.join(lines)

    return code_str

def post_process_java_code(code_str: str) -> str:

    code_str = code_str.replace("static int main", "public static void main")
    code_str = code_str.replace("NEW_LINE", "\n").replace("DEDENT", "")
    
    code_str = re.sub(r'\batoin?\s*\(\s*([^)]+?)\s*\)', r'Integer.parseInt(\1)', code_str)

    code_str = re.sub(r'\bargv\b', 'args', code_str)

    code_str = re.sub(r'\breturn\s+1\s*;', 'System.exit(1);', code_str)

    code_str = re.sub(r'\s+', ' ', code_str)

    code_str = re.sub(r'\breturn\s+0\s*;', 'System.exit(0);', code_str)
    
    code_str = re.sub(r'\s*\.\s*', '.', code_str)
    
    code_str = code_str.replace('[ ', '[').replace(' ]', ']')
    code_str = code_str.replace('( ', '(').replace(' )', ')')
    
    code_str = re.sub(r'\s*;\s*', '; ', code_str)
    code_str = re.sub(r'\s*,\s*', ', ', code_str)

    code_str = code_str.replace(';', ';\n')
    code_str = code_str.replace('{', '{\n')
    code_str = code_str.replace('}', '}\n')
     
    lines = code_str.split('\n')
    formatted_lines = []
    indent_level = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line == '}':
            indent_level -= 1
        formatted_lines.append('    ' * indent_level + line)
        if line.endswith('{'):
            indent_level += 1

    # Step 7: Trim and clean up whitespace
    code_str = code_str.strip()
    
    return code_str

def post_process_translated_python_code(code: str) -> str:
    return code

def preprocess_code(code: str) -> str:
    lines = code.split('\n')
    processed_lines = []
    current_indent = 0
    
    for line in lines:
        stripped = line.lstrip()
        if not stripped: 
            continue
            
        indent = len(line) - len(stripped)
        if indent > current_indent:
            processed_lines.append("INDENT " + stripped)
            current_indent = indent
        elif indent < current_indent:
            processed_lines.append("DEDENT " * ((current_indent - indent) // 4) + stripped) 
            current_indent = indent
        else:
            processed_lines.append(stripped)
    
    return " NEW_LINE ".join(processed_lines) + " NEW_LINE"

@app.get("/supported_pairs")
async def get_supported_pairs():
    pairs = []
    try:
        for model_dir in os.listdir(MODELS_DIR):
            if "_to_" in model_dir and os.path.isdir(os.path.join(MODELS_DIR, model_dir)):
                src, tgt = model_dir.split("_to_")
                pairs.append({"source": src, "target": tgt})
        return {"pairs": pairs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning models: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Code Translator API", 
        "endpoints": {
            "supported_pairs": "/supported_pairs",
            "translate": "/translate (POST)"
        }
    }


@app.post("/translate")
async def translate(request: TranslationRequest):
    model_key = f"{request.source_lang}_to_{request.target_lang}"
    model_path = Path(MODELS_DIR) / model_key

    if not model_path.exists():
        raise HTTPException(status_code=404, detail=f"Model for {model_key} not found.")

    try:
        if model_key not in loaded_models:
            print(f"Loading model: {model_key}")
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
            
            if torch.cuda.is_available():
                model.to("cuda")
            model.eval() 
            loaded_models[model_key] = {"tokenizer": tokenizer, "model": model}
        else:
            print(f"Using cached model: {model_key}")
            tokenizer = loaded_models[model_key]["tokenizer"]
            model = loaded_models[model_key]["model"]

        preprocessed = preprocess_code(request.source_code)
        input_text = f"translate {request.source_lang} to {request.target_lang}: {preprocessed}"
        
        inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}

        outputs = model.generate(
            **inputs,
            max_length=512,
            num_beams=10,            
            early_stopping=True,
            no_repeat_ngram_size=4,
            eos_token_id=tokenizer.eos_token_id if tokenizer.eos_token_id else None,
        )

        translated_code = tokenizer.decode(outputs[0], skip_special_tokens=True)

        print("\n--- Raw Translated Code (before post-processing) ---")
        print("```")
        print(translated_code)
        print("```\n")

        final_translated_code = translated_code
        if request.target_lang == "c":
            print("\n--- Applying C post-processing ---")
            final_translated_code = post_process_translated_c_code(translated_code)
        elif request.target_lang == "java":
            print("\n--- Applying Java post-processing ---")
            final_translated_code = post_process_java_code(translated_code)
        elif request.target_lang == "python":
            print("\n--- Applying Python post-processing ---")
            final_translated_code = post_process_translated_python_code(translated_code)
        
        # corrected_code = await correct_with_gemini(
        #    input_text,
        #    request.source_lang, 
        #    request.target_lang
        #)

        print("--- Post-processing complete ---")
        
        return {
            "translation": final_translated_code,
        }

    except Exception as e:
        print(f"Error during translation: {e}")
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")