# ==============================================================================
# PRAGATI AI/ML Service Production Dockerfile
# ==============================================================================
FROM python:3.11-slim

# Install system dependencies & curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root user
RUN groupadd -g 1000 mluser && useradd -u 1000 -g mluser -s /bin/bash -m mluser

WORKDIR /app

# Cache Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Run training to produce models if not already generated
RUN python model/train.py

# Ensure directory ownership
RUN chown -R mluser:mluser /app

USER mluser

EXPOSE 8000

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ml/health || exit 1

# Production ASGI server with 2 worker processes
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
