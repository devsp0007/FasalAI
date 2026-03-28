#!/usr/bin/env bash
# Render build script — installs deps, retrains ML models, and initializes DB

set -e  # Exit on error

echo "=== Installing Python dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Creating model output directory ==="
mkdir -p latest_model/disease

echo "=== Retraining ML models ==="
cd api
python retrain_models.py
cd ..

echo "=== Build complete ==="
echo "Models saved in latest_model/"
ls -la latest_model/
