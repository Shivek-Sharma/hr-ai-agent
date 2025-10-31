## Introduction - HR Policies AI Agent
This project is an automated HR policy extraction and management system built with Node.js and Cheerio.
It crawls the web to extract and maintain structured data about HR-related policies.

The system identifies and extracts key metadata such as Policy Title, Description, Publication Date, and Source URL.
It then compares newly scraped data against existing database records to efficiently detect duplicates.

To enhance this automation, the project leverages Anthropic's Claude API for:

- Extraction of policies in a JSON format from the HTML
- Summarization of long policy description
- Semantic similarity matching to detect duplicates

All crawl and processing activities are logged — ensuring full transparency and traceability.

## Tech Stack
This project is built using a modern and efficient backend stack designed for scalable data extraction and intelligent policy analysis.

- **Web Server:** Node.js + Express.js — for handling API endpoints, routes, and data flow
- **Crawling:** Cheerio — for fast, server-side HTML parsing and data extraction from websites
- **Database:** MongoDB — for storing extracted policies and crawler logs
- **AI Layer:** Anthropic's Claude API — for natural language understanding, JSON data extraction, semantic comparison, and summarization of HR policies
- **API Documentation:** Swagger — for interactive API documentation and testing

## Installation
1. Clone the Github repository
    ```
    git clone https://github.com/Shivek-Sharma/hr-ai-agent.git
    ```
2. Install dependencies
    ```
    cd hr-ai-agent
    npm install
    ```
3. Fill the values for `.env` variables, take reference of required environment variables from `.env.example` file
4. Run development server locally
    ```
    npm run dev
    ```
5. Local development server will start at `http://localhost:{PORT}`
6. Swagger's API Documentation will be hosted at `http://localhost:{PORT}/api-docs`
7. You can check crawler logs at `src/logs/crawler.log` as well as from the API mentioned in the swagger doc
8. Cron for the crawler is currently set to run after every 12 hours

## Steps to add a new source for HR policies extraction
1. Open `src/config/source.js` file
2. Add a new source metadata object to sources array like:
    ```
    {
        "name": "Name of the source",
        "url": "URL of the source",
        "selectors": {
            "container": "Selector for the entire policies block",
            "publishedAt": "Selector for the publication date block",
        },
    }
    ```
3. Save the file and the new source will be automatically get crawled when next cron job for the crawler runs