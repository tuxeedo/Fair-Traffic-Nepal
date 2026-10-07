#!/usr/bin/env bash
set -o errexit
cd "$(dirname "$0")"
echo "==> Installing dependencies..."
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
