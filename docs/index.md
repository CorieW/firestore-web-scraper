---
layout: home

hero:
  name: Firestore Web Scraper
  text: Scraping jobs powered by Firestore and Firebase Functions
  tagline: Queue a Firestore document, let a 2nd gen Cloud Function fetch the page, and write structured results back to the same task.
  actions:
    - theme: brand
      text: Get Started
      link: /deployment.html
---

## About

This package allows you to automate web scraping tasks using Firestore. Simply add a document to a designated Firestore collection describing the website to scrape and the data to extract. The function will process the task, perform the scraping, and update the document with the results, all managed directly from Firestore.

## Features

- Scrape websites using Firestore documents.
- Use multiple selectors to extract data.
- Extract data from the HTML, innerHTML, text, or attribute of an element.
- Extract as much data as you like from a single Firestore document.
