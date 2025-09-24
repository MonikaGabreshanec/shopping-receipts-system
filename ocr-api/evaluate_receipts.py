import os
import json
import requests
import numpy as np

API_URL = "http://localhost:5001"

def evaluate_receipt(file_path, annotation_path):
    with open(annotation_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)

    with open(file_path, "rb") as f:
        response = requests.post(f"{API_URL}/ocr", files={"file": f})
    predictions = response.json()

    payload = {
        "ground_truth_text": ground_truth["ground_truth_text"],
        "predicted_text": "\n".join([p["product"] + " " + str(p["price"]) for p in predictions]),
        "ground_truth_products": ground_truth["ground_truth_products"],
        "predicted_products": predictions
    }

    eval_response = requests.post(f"{API_URL}/evaluate", json=payload)
    return eval_response.json()


def average_metrics(results):
    """Compute averages across all receipts"""
    avg = {}

    for key in ["ocr_metrics", "product_metrics", "category_metrics"]:
        metrics_list = [r[key] for r in results]
        avg[key] = {
            k: round(float(np.mean([m[k] for m in metrics_list])), 2)
            for k in metrics_list[0]
        }

    return avg


if __name__ == "__main__":
    receipts_dir = "data/receipts"
    annotations_dir = "data/annotations"

    results = []

    for fname in os.listdir(receipts_dir):
        if not fname.lower().endswith((".jpg", ".png", ".jpeg")):
            continue
        receipt_path = os.path.join(receipts_dir, fname)
        annotation_path = os.path.join(
            annotations_dir, os.path.splitext(fname)[0] + ".json"
        )

        if not os.path.exists(annotation_path):
            continue
        metrics = evaluate_receipt(receipt_path, annotation_path)
        results.append(metrics)

    if results:
        avg = average_metrics(results)
        print(json.dumps(avg, indent=2, ensure_ascii=False))
    else:
        print("No receipts evaluated")
