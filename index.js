const express = require("express");
const puppeteer = require("puppeteer-core");
const app = express();

app.get("/scrape", async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  try {
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(`https://www.amazon.fr`);
    await page.type("#twotabsearchtextbox", keyword, { delay: 50 });
    await page.waitForSelector(".s-suggestion", { timeout: 3000 }).catch(() => {});

    const suggestions = await page.$$eval(".s-suggestion", els =>
      els.map(el => el.textContent.trim())
    );

    await browser.close();
    res.json({ keyword, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Scraper listening on port", port));