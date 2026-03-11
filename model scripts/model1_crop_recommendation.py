
import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix
)
from sklearn.pipeline import Pipeline

DATA_PATH   = r"C:\Users\ankur\OneDrive\Documents\projects\SIH25010\datasets\Crop_recommendation.csv"
OUTPUT_DIR  = r"C:\Users\ankur\OneDrive\Documents\projects\SIH25010\latest_model"
MODEL_FILE  = os.path.join(OUTPUT_DIR, "crop_recommendation_rf.pkl")
META_FILE   = os.path.join(OUTPUT_DIR, "crop_recommendation_rf_meta.json")
RANDOM_SEED = 42

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── 1. Load & Inspect ──────────────────────────────────────
print("=" * 60)
print("  CROP RECOMMENDATION — RANDOM FOREST")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\n📂 Dataset shape : {df.shape}")
print(f"   Columns       : {list(df.columns)}")
print(f"   Missing values: {df.isnull().sum().sum()}")
print(f"   Unique crops  : {df['label'].nunique()} → {sorted(df['label'].unique())}")

# ── 2. Feature / Target Split ──────────────────────────────
FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET_COL   = "label"

X = df[FEATURE_COLS].values
y = df[TARGET_COL].values

# Encode string labels → integers
le = LabelEncoder()
y_enc = le.fit_transform(y)
class_names = list(le.classes_)
print(f"\n   Class mapping : {dict(zip(range(len(class_names)), class_names))}")

# ── 3. Train / Test Split ──────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.20, random_state=RANDOM_SEED, stratify=y_enc
)
print(f"\n📊 Train size : {X_train.shape[0]}  |  Test size : {X_test.shape[0]}")

# ── 4. Build Pipeline (Scaler + RF) ───────────────────────
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        class_weight="balanced",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    ))
])

# ── 5. Cross-Validation ────────────────────────────────────
print("\n🔄 Running 5-fold cross-validation …")
cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="accuracy", n_jobs=-1)
print(f"   CV Accuracy : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# ── 6. Train Final Model ───────────────────────────────────
pipeline.fit(X_train, y_train)

# ── 7. Evaluate ────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
acc    = accuracy_score(y_test, y_pred)

print(f"\n✅ Test Accuracy : {acc:.4f} ({acc*100:.2f}%)")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred, target_names=class_names))

# Feature importance (from the RF inside the pipeline)
rf_model     = pipeline.named_steps["clf"]
importances  = rf_model.feature_importances_
feat_imp     = dict(zip(FEATURE_COLS, importances.round(4).tolist()))
feat_imp_sorted = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True))
print("📌 Feature Importances:")
for feat, imp in feat_imp_sorted.items():
    bar = "█" * int(imp * 40)
    print(f"   {feat:<15} {imp:.4f}  {bar}")

# ── 8. Export Model + Metadata ─────────────────────────────
# Bundle pipeline AND label encoder together for easy reload
bundle = {
    "pipeline"      : pipeline,
    "label_encoder" : le,
    "feature_cols"  : FEATURE_COLS,
    "class_names"   : class_names,
}
joblib.dump(bundle, MODEL_FILE, compress=3)
print(f"\n💾 Model saved → {MODEL_FILE}")

meta = {
    "model_type"        : "RandomForestClassifier",
    "sklearn_version"   : __import__("sklearn").__version__,
    "feature_cols"      : FEATURE_COLS,
    "target_col"        : TARGET_COL,
    "class_names"       : class_names,
    "n_classes"         : len(class_names),
    "n_estimators"      : 200,
    "train_samples"     : int(X_train.shape[0]),
    "test_samples"      : int(X_test.shape[0]),
    "cv_accuracy_mean"  : round(float(cv_scores.mean()), 4),
    "cv_accuracy_std"   : round(float(cv_scores.std()), 4),
    "test_accuracy"     : round(float(acc), 4),
    "feature_importances": feat_imp_sorted,
}
with open(META_FILE, "w") as f:
    json.dump(meta, f, indent=2)
print(f"📄 Metadata saved → {META_FILE}")

# ── 9. Quick Inference Demo ────────────────────────────────
print("\n🌾 Demo Prediction:")
sample = pd.DataFrame([{
    "N": 90, "P": 42, "K": 43,
    "temperature": 20.8, "humidity": 82.0,
    "ph": 6.5, "rainfall": 202.9
}])
pred_enc   = pipeline.predict(sample)[0]
pred_proba = pipeline.predict_proba(sample)[0]
pred_label = le.inverse_transform([pred_enc])[0]
top3_idx   = np.argsort(pred_proba)[::-1][:3]
print(f"   Input   : N=90, P=42, K=43, temp=20.8, humidity=82, ph=6.5, rain=202.9")
print(f"   → Top recommendation: {pred_label.upper()}")
print(f"   → Top-3 with confidence:")
for i in top3_idx:
    print(f"      {class_names[i]:<18} {pred_proba[i]*100:.1f}%")

print("\n✅ Model 1 complete!\n")


# ══════════════════════════════════════════════════════════
#  HOW TO LOAD & USE IN ANOTHER PROJECT
# ══════════════════════════════════════════════════════════
"""
import joblib, numpy as np

bundle   = joblib.load("crop_recommendation_rf.pkl")
pipeline = bundle["pipeline"]
le       = bundle["label_encoder"]
features = bundle["feature_cols"]   # ['N','P','K','temperature','humidity','ph','rainfall']

# Single prediction
import pandas as pd
sample = pd.DataFrame([{
    "N": 80, "P": 40, "K": 40,
    "temperature": 25.0, "humidity": 75.0,
    "ph": 6.8, "rainfall": 180.0
}])
pred_label = le.inverse_transform(pipeline.predict(sample))[0]
print(f"Recommended crop: {pred_label}")

# With confidence scores
proba = pipeline.predict_proba(sample)[0]
top3  = sorted(zip(bundle["class_names"], proba), key=lambda x: x[1], reverse=True)[:3]
for crop, conf in top3:
    print(f"  {crop}: {conf*100:.1f}%")
"""
