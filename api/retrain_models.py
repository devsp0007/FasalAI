"""
Quick retraining script — Retrains models with the current sklearn version.
Only retrains the crop recommendation model (primary model for the demo).
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, OrdinalEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "latest_model")
DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")

# ═══════════════════════════════════════════════════
# MODEL 1: Crop Recommendation (RandomForest)
# ═══════════════════════════════════════════════════
print("=" * 60)
print("  RETRAINING: Crop Recommendation (RF)")
print("=" * 60)

DATA_PATH = os.path.join(DATASETS_DIR, "Crop_recommendation.csv")
df = pd.read_csv(DATA_PATH)
print(f"Dataset: {df.shape[0]} rows, {df.shape[1]} cols")

FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
X = df[FEATURE_COLS].values
y = df["label"].values

le = LabelEncoder()
y_enc = le.fit_transform(y)
class_names = list(le.classes_)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.20, random_state=42, stratify=y_enc
)

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(
        n_estimators=200, max_depth=None,
        min_samples_split=2, min_samples_leaf=1,
        max_features="sqrt", class_weight="balanced",
        random_state=42, n_jobs=-1,
    ))
])
pipeline.fit(X_train, y_train)

from sklearn.metrics import accuracy_score
acc = accuracy_score(y_test, pipeline.predict(X_test))
print(f"Test Accuracy: {acc:.4f}")

bundle = {
    "pipeline": pipeline,
    "label_encoder": le,
    "feature_cols": FEATURE_COLS,
    "class_names": class_names,
}
model_path = os.path.join(OUTPUT_DIR, "crop_recommendation_rf.pkl")
joblib.dump(bundle, model_path, compress=3)
print(f"✅ Saved: {model_path}")


# ═══════════════════════════════════════════════════
# MODEL 2: Crop Yield (GradientBoosting)
# ═══════════════════════════════════════════════════
print("\n" + "=" * 60)
print("  RETRAINING: Crop Yield (GradientBoosting)")
print("=" * 60)

DATA_PATH2 = os.path.join(DATASETS_DIR, "India Agriculture Crop Production.csv")
if os.path.exists(DATA_PATH2):
    df2 = pd.read_csv(DATA_PATH2)
    print(f"Dataset: {df2.shape[0]} rows")

    df2["year_num"] = df2["Year"].str[:4].astype(int)
    df2 = df2.dropna(subset=["Yield", "Area", "Crop", "Season"])
    df2 = df2[df2["Yield"] > 0]
    q995 = df2["Yield"].quantile(0.995)
    df2 = df2[df2["Yield"] <= q995]

    SAMPLE_SIZE = 80_000
    if len(df2) > SAMPLE_SIZE:
        df2 = df2.sample(n=SAMPLE_SIZE, random_state=42).reset_index(drop=True)

    CAT_FEATURES = ["State", "District", "Crop", "Season"]
    NUM_FEATURES = ["log_area", "year_num"]
    ALL_FEATURES = CAT_FEATURES + NUM_FEATURES

    df2["log_area"] = np.log1p(df2["Area"])
    X2 = df2[ALL_FEATURES].copy()
    y2 = df2["Yield"].values

    for col in CAT_FEATURES:
        X2[col] = X2[col].fillna("Unknown")

    split_year = 2018
    mask_train = df2["year_num"] < split_year
    mask_test = df2["year_num"] >= split_year

    X2_train, y2_train = X2[mask_train], y2[mask_train]
    X2_test, y2_test = X2[mask_test], y2[mask_test]

    cat_transformer = Pipeline([("enc", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))])
    num_transformer = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
    preprocessor = ColumnTransformer([("cat", cat_transformer, CAT_FEATURES), ("num", num_transformer, NUM_FEATURES)])

    pipeline2 = Pipeline([
        ("preprocessor", preprocessor),
        ("model", GradientBoostingRegressor(
            n_estimators=200, learning_rate=0.08, max_depth=5,
            min_samples_split=20, min_samples_leaf=10,
            subsample=0.8, max_features="sqrt", random_state=42,
        ))
    ])
    print("Training yield model...")
    pipeline2.fit(X2_train, y2_train)

    from sklearn.metrics import r2_score
    y2_pred = np.maximum(pipeline2.predict(X2_test), 0)
    r2 = r2_score(y2_test, y2_pred)
    print(f"Test R²: {r2:.4f}")

    bundle2 = {
        "pipeline": pipeline2,
        "feature_cols": ALL_FEATURES,
        "cat_features": CAT_FEATURES,
        "num_features": NUM_FEATURES,
        "target_col": "Yield",
        "target_unit": "Tonnes per Hectare",
        "crops": sorted(df2["Crop"].unique().tolist()),
        "states": sorted(df2["State"].unique().tolist()),
        "seasons": sorted(df2["Season"].unique().tolist()),
        "year_range": [int(df2["year_num"].min()), int(df2["year_num"].max())],
    }
    model_path2 = os.path.join(OUTPUT_DIR, "crop_yield_xgboost.pkl")
    joblib.dump(bundle2, model_path2, compress=3)
    print(f"✅ Saved: {model_path2}")
else:
    print("⚠️  Yield dataset not found, skipping.")


print("\n🎉 All models retrained with current sklearn version!")
print(f"   sklearn: {__import__('sklearn').__version__}")
print(f"   numpy:   {np.__version__}")
