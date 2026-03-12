#!/usr/bin/env bash
# Render build script — installs deps and retrains models

pip install --upgrade pip
pip install -r requirements.txt
cd api
python retrain_models.py
