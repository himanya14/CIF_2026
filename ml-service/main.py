from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="CIF DistilBERT ML Service")

print("Loading DistilBERT model...")

classifier = pipeline(
    "text-classification",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

print("DistilBERT loaded successfully.")


class PredictionRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "DistilBERT ML Service"
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    result = classifier(request.text)

    return {
        "label": result[0]["label"],
        "confidence": round(float(result[0]["score"]), 4)
    }
