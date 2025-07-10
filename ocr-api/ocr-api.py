from flask import Flask, request, jsonify
import pytesseract
import cv2
import numpy as np
import re
import os
from PIL import Image, ImageEnhance
import io

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ['TESSDATA_PREFIX'] = r"C:\Program Files\Tesseract-OCR\tessdata"

app = Flask(__name__)

EXCLUDE_KEYWORDS = [
    'ДДВ', 'ДАВ', 'ААВ', 'ПРОМЕТ', 'ВКУПНО', 'ВКУЛНО', 'ИЗНОС',
    'КРЕДИТ', 'ПЛАЌАЊЕ', 'ДАН', 'КУПНО', 'ВРЕМЕ', 'ВРАЌАЊЕ',
    'МАКЕДОНИЈА', 'МАКЕДОНСКИ'
]

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
        enhanced = enhanced.resize((int(width * 1.5), int(height * 1.5)), Image.BICUBIC)

    img_cv = np.array(enhanced)
    img_cv = cv2.copyMakeBorder(img_cv, 10, 10, 10, 10, cv2.BORDER_CONSTANT, value=255)

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

    clean_lines = []
    for line in lines:
        line = line.strip()
        if not line or is_summary_line(line):
            continue
        clean_lines.append(line)

    products = []
    seen = set()
    i = 0
    while i < len(clean_lines):
        line = clean_lines[i]
        match = re.search(r'(.+?)\s+(\d+[,.]\d+)\s*[АБВГ]?', line)

        if not match and i + 1 < len(clean_lines):
            merged = line + " " + clean_lines[i + 1]
            match = re.search(r'(.+?)\s+(\d+[,.]\d+)\s*[АБВГ]?', merged)
            if match:
                i += 1

        if match:
            product = match.group(1).strip()
            price = match.group(2).replace(',', '.').strip()
            key = product + price

            if re.match(r'^\d+[,.]?\d*\s*[xх×]', product, re.IGNORECASE):
                i += 1
                continue

            if len(product) > 2 and not product.replace(" ", "").isdigit() and key not in seen:
                seen.add(key)
                products.append({"product": product, "price": price})
        i += 1

    return products

@app.route('/ocr', methods=['POST'])
def ocr():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    filename = file.filename
    image_bytes = file.read()
    processed = preprocess_image(image_bytes)

    text = pytesseract.image_to_string(processed, lang='mkd+srp+rus')

    lines = text.splitlines()
    print(f"\n📄 OCR preview for: {filename}")
    print("-" * 40)
    for line in lines:
        line = line.strip()
        if line:
            print(line)
    print("-" * 40)

    products = extract_products_cutoff(text)
    return jsonify(products)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
