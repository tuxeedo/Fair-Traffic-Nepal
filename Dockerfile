# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build React frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Python backend + Nginx serving the built frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Install system deps (nginx + supervisor to manage both processes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# ── Backend ──────────────────────────────────────────────────────────────────
WORKDIR /app/backend

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Collect Django static files
ENV DJANGO_SETTINGS_MODULE=fairtraffic.settings
ENV DJANGO_DEBUG=False
ENV DJANGO_ALLOWED_HOSTS=*
RUN python manage.py collectstatic --noinput

# Run migrations on startup (SQLite, in-container)
# For production with PostgreSQL, run migrations externally.

# ── Frontend (built artifact) ─────────────────────────────────────────────────
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# ── Nginx config ─────────────────────────────────────────────────────────────
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/fairtraffic.conf

# ── Supervisor config (runs nginx + gunicorn together) ────────────────────────
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create media directory
RUN mkdir -p /app/backend/media /app/backend/staticfiles

# HuggingFace Spaces runs as user 1000, fix permissions
RUN chown -R 1000:1000 /app /usr/share/nginx/html \
    && chmod -R 755 /app

# Nginx needs to write to these dirs
RUN mkdir -p /var/log/nginx /var/lib/nginx/body /run \
    && chown -R 1000:1000 /var/log/nginx /var/lib/nginx /run /etc/nginx/conf.d

USER 1000

EXPOSE 7860

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
