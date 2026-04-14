FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 1. Install Chrome and System Dependencies (Required for Selenium on Render)
RUN apt-get update && apt-get install -y \
    wget gnupg unzip curl xvfb \
    libxi6 libgbm1 libasound2 libnss3 libxss1 xauth \
    && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip

# 3. THE BYPASS: Install everything EXCEPT the two conflicting packages
RUN pip install --no-cache-dir $(grep -vE "seleniumbase|websockets" requirements.txt)

# 4. MANUALLY install the conflict-causers
# This stops pip from checking dependencies and failing the build
RUN pip install --no-cache-dir seleniumbase==4.46.5 --no-deps
RUN pip install --no-cache-dir "websockets>=13.0.0,<15.1.0"

COPY . .

# Render uses the $PORT environment variable automatically
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:$PORT"]