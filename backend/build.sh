#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

# Change working directory to backend folder containing manage.py and requirements.txt
cd "$(dirname "$0")"

echo "==> Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate

echo "==> Seeding initial demo data..."
python seed_government_registry.py || true
python create_demo_rules.py || true
python create_demo_users.py || true

echo "==> Build complete!"
