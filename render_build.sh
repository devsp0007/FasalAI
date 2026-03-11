#!/usr/bin/env bash
# Render build script — installs deps and retrains models

cd apps/api
pip install --upgrade pip
pip install -r requirements.txt
python retrain_models.py
