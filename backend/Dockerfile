FROM python:3.11-slim-bookworm

# 1. System Dependencies (Keep this as is)
RUN apt-get update && apt-get install -y \
    wget gnupg unzip curl xvfb \
    libxi6 libgbm1 libasound2 libnss3 libxss1 xauth \
    && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Upgrade core tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# 3. INSTALL THE AI CORE (This pins websockets to <15.1.0)
# 1. Install websockets first - the "bridge" version
RUN pip install --no-cache-dir "websockets==14.2"

# 2. Force install GenAI (requires websockets < 15.1)
RUN pip install --no-cache-dir google-genai==1.63.0 --no-deps

# 3. Force install SeleniumBase (usually wants websockets 16+, but we say NO)
RUN pip install --no-cache-dir seleniumbase==4.46.5 --no-deps

# 5. INSTALL THE REST (Which no longer contains the conflicting packages)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:$PORT"]