FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 1. System Dependencies for Chrome
RUN apt-get update && apt-get install -y \
    wget gnupg unzip curl xvfb \
    libxi6 libgbm1 libasound2 libnss3 libxss1 xauth \
    && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. THE FIX: Install standard requirements EXCEPT the ones that conflict
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip

# We use grep to skip the fighting packages in the requirements file
RUN pip install --no-cache-dir $(grep -vE "seleniumbase|websockets" requirements.txt)

# 3. MANUALLY install the conflict-causers
# Install seleniumbase WITHOUT checking dependencies (prevents the crash)
RUN pip install --no-cache-dir seleniumbase==4.46.5 --no-deps

# Force the specific version that Google Gemini needs
RUN pip install --no-cache-dir "websockets>=13.0.0,<15.1.0"

COPY . .

CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:$PORT"]