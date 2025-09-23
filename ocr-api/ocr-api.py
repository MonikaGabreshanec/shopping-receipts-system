from flask import Flask, request, jsonify
import pytesseract
import cv2
import numpy as np
from PIL import Image, ImageEnhance
import io
import re
import os

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer, util
import torch

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ['TESSDATA_PREFIX'] = r"C:\Program Files\Tesseract-OCR\tessdata"

app = Flask(__name__)

CATEGORIES = ["Храна", "Пијалоци","Козметика","Хигиена", "Домаќинство", "Електроника", "Друго"]


EXCLUDE_KEYWORDS = [
    'ДДВ', 'ДАВ', 'ААВ', 'ПРОМЕТ', 'ВКУПНО', 'ВКУЛНО', 'ИЗНОС',
    'КРЕДИТ', 'ПЛАЌАЊЕ', 'ДАН', 'КУПНО', 'ВРЕМЕ', 'ВРАЌАЊЕ',
    'МАКЕДОНИЈА', 'МАКЕДОНСКИ'
]

ft_model_dir = "./receipt_model"
ft_tokenizer = AutoTokenizer.from_pretrained(ft_model_dir)
ft_model = AutoModelForSequenceClassification.from_pretrained(ft_model_dir)
ft_pipeline = pipeline("text-classification", model=ft_model, tokenizer=ft_tokenizer)

zs_classifier = pipeline("zero-shot-classification", model="joeddav/xlm-roberta-large-xnli")

embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
category_embeddings = embedder.encode(CATEGORIES, convert_to_tensor=True)

def is_summary_line(line):
    return any(kw in line.upper() for kw in EXCLUDE_KEYWORDS) or re.search(r'(А|Б)=\s*\d+,\d+', line)

def preprocess_image(image_bytes):
    image_pil = Image.open(io.BytesIO(image_bytes))
    if image_pil.mode == 'RGBA':
        image_pil = image_pil.convert('RGB')
    gray = image_pil.convert('L')
    enhanced = ImageEnhance.Contrast(gray).enhance(2.0)
    width, height = enhanced.size
    if width < 1000:
        enhanced = enhanced.resize((int(width*1.5), int(height*1.5)), Image.BICUBIC)
    img_cv = np.array(enhanced)
    img_cv = cv2.copyMakeBorder(img_cv,10,10,10,10,cv2.BORDER_CONSTANT,value=255)
    return img_cv

def extract_products_cutoff(text):
    lines = text.splitlines()

    start_index = 0
    for i, line in enumerate(lines):
        if re.search(r'ДДВ\s*БРОЈ[:\s]*[A-ZА-Ш0-9\-]+', line, re.IGNORECASE):
            start_index = i + 1
            break
    else:
        for i, line in enumerate(lines):
            if re.search(r'\d+[,.]\d+', line):
                start_index = i
                break

    lines = lines[start_index:]

    clean_lines = [l.strip() for l in lines if l.strip() and not is_summary_line(l)]

    products = []
    seen = set()
    i = 0
    while i < len(clean_lines):
        line = clean_lines[i]

        numbers = re.findall(r'\d+[,.]\d+', line)
        if numbers:
            price = numbers[-1].replace(',', '.').strip()
            product = line[:line.rfind(numbers[-1])].strip()

            product = re.sub(r'[^A-Za-zА-Ша-ш0-9\s\.\-]+', '', product).strip()

            if re.match(r'^\d+[,.]?\d*\s*[xх×]', product, re.IGNORECASE):
                i += 1
                continue

            try:
                price = str(int(float(price)))
            except:
                i += 1
                continue

            key = product + price
            if len(product) > 1 and key not in seen:
                seen.add(key)
                products.append({"product": product, "price": price})

        elif i + 1 < len(clean_lines):
            merged = line + " " + clean_lines[i + 1]
            numbers = re.findall(r'\d+[,.]\d+', merged)
            if numbers:
                price = numbers[-1].replace(',', '.').strip()
                product = merged[:merged.rfind(numbers[-1])].strip()
                product = re.sub(r'[^A-Za-zА-Ша-ш0-9\s\.\-]+', '', product).strip()

                if len(product) > 1:
                    key = product + price
                    if key not in seen:
                        seen.add(key)
                        try:
                            price = str(int(float(price)))
                        except:
                            i += 1
                            continue
                        products.append({"product": product, "price": price})
                i += 1

        i += 1

    return products

import re

def normalize_text(text):
    text = text.upper()
    text = re.split(r'\d', text)[0]
    text = re.sub(r'[^A-ZА-Ш\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def classify_product(product_name):
    text = normalize_text(product_name)

    try:
        ft_result = ft_pipeline(text)
        if ft_result:
            ft_category = ft_result[0]['label']
            ft_confidence = ft_result[0]['score']
            print(f"Fine-tuned: {ft_category} (confidence: {ft_confidence:.2f})")
            if ft_confidence > 0.6:
                print(f"Fine-tuned победи: {ft_category}")
                return ft_category
    except Exception as e:
        print(f" Fine-tuned грешка: {e}")

    try:
        zs_result = zs_classifier(text, candidate_labels=CATEGORIES)
        confidence = zs_result['scores'][0]
        predicted_category = zs_result['labels'][0]
        print(f"Zero-shot: {predicted_category} (confidence: {confidence:.2f})")
        if confidence > 0.6:
            print(f" Zero-shot победи: {predicted_category}")
            return predicted_category
    except Exception as e:
        print(f" Zero-shot грешка: {e}")

    return "Друго"

@app.route("/ocr", methods=["POST"])
def ocr():
    file = request.files.get("file")
    if not file:
        return jsonify({"error":"No file uploaded"}), 400
    image_bytes = file.read()
    processed = preprocess_image(image_bytes)
    text = pytesseract.image_to_string(processed, lang="mkd+srp+rus")

    print("\n📄 OCR preview")
    print("-"*40)
    for line in text.splitlines():
        line=line.strip()
        if line:
            print(line)
    print("-"*40)

    products = extract_products_cutoff(text)
    for prod in products:
        prod["category"] = classify_product(prod["product"])
        print(f"Product: {prod['product']} | Price: {prod['price']} | Category: {prod['category']}")

    return jsonify(products)
@app.route("/classify", methods=["POST"])
def classify_text_products():
    data = request.json
    if not data or "products" not in data:
        return jsonify({"error": "No products provided"}), 400

    products = data["products"]
    result = []

    for p in products:
        category = classify_product(p)
        result.append({"product": p, "category": category})

    return jsonify(result)

if __name__=="__main__":
    app.run(host="0.0.0.0", port=5001)
