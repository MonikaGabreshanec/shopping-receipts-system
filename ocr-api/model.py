from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import numpy as np
from sklearn.metrics import accuracy_score
from data import data


CATEGORIES = ["Храна", "Пијалоци", "Козметика", "Хигиена", "Домаќинство", "Електроника", "Друго"]
label2id = {cat: i for i, cat in enumerate(CATEGORIES)}
id2label = {i: cat for i, cat in enumerate(CATEGORIES)}

for d in data:
    if "category" in d and d["category"] in label2id:
        d["label"] = label2id[d["category"]]
    else:
        d["label"] = label2id["Друго"]

dataset = Dataset.from_list(data)
dataset = dataset.train_test_split(test_size=0.2, seed=42)
train_dataset = dataset["train"]
test_dataset = dataset["test"]


model_name = "distilbert-base-multilingual-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)


def tokenize(batch):
    return tokenizer(batch["product_name"], padding=True, truncation=True)

train_dataset = train_dataset.map(tokenize, batched=True)
test_dataset = test_dataset.map(tokenize, batched=True)

model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=len(CATEGORIES),
    id2label=id2label,
    label2id=label2id
)

model.resize_token_embeddings(len(tokenizer))


training_args = TrainingArguments(
    output_dir="./receipt_model",
    num_train_epochs=20,
    per_device_train_batch_size=8,
    weight_decay=0.01,
    learning_rate=2e-5,
    logging_dir="./logs",
    logging_steps=5
)

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {"accuracy": accuracy_score(labels, predictions)}

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    tokenizer=tokenizer,
    compute_metrics=compute_metrics
)

trainer.train()
trainer.save_model("./receipt_model")
print("Model fine-tuned and saved at ./receipt_model")