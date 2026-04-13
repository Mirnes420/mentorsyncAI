import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    try {
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log("Page loaded successfully.");
    } catch (e) {
        console.log("Navigation error:", e.message);
    }

    await browser.close();
})();
