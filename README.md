


https://github.com/user-attachments/assets/74d27c0b-81e1-427a-a8d0-cc78a7f3016c


# MentorSync AI | Full-Stack Recruitment Intelligence 🚀
> **End-to-End Autonomous Pipeline for Generative Career Mentorship.**

**MentorSync AI** is a sophisticated full-stack engine designed to automate the bridge between candidate potential and industry requirements. By utilizing a "Headless" architecture, it transforms raw data—CVs and Job Descriptions—into high-fidelity, actionable mentorship feedback through a high-speed, "Radical Candor" AI pipeline.

---

## 🏗️ Technical Architecture
MentorSync is engineered as a decoupled system, allowing the backend to function as a standalone microservice or power the integrated frontend dashboard.

* **Backend:** Python (Flask/Django) logic handling the "Heavy Lifting."
* **Data Extraction:** SeleniumBase (Undetected Mode) to bypass sophisticated anti-bot protections on Tier-1 job boards.
* **Intelligence Layer:** Gemini 2.5 Flash for low-latency semantic analysis and feedback generation.
* **Frontend:** React-based visualization layer for real-time match monitoring.

---

## ✨ Engineering Highlights
- **Asymmetric Scraping:** Leverages stealth automation to pull data from sources where standard `requests` or `BeautifulSoup` scrapers fail.
- **AI-Driven Gap Analysis:** Moves beyond binary "Fit/No Fit" logic to identify specific technical missing links (e.g., "Lack of Async architectural experience").
- **Headless-First Integration:** The core engine is accessible via API, making it "plug-and-play" for existing HR platforms like Workday, Lever, or Greenhouse.
- **Radical Candor Engine:** Generates empathetic, human-centric feedback that protects employer brand reputation even during high-volume rejections.

---

## 🛠️ Headless API Integration (cURL)

The mentorship engine can be triggered from any CLI or external application, bypassing the UI entirely for high-scale automation:

```bash
curl -X POST http://localhost:5555/generate-bait \
  -F "job_url=[https://remoterocketship.com/job/example-role](https://remoterocketship.com/job/example-role)" \
  -F "resume_pdf=@/path/to/your/resume.pdf"
