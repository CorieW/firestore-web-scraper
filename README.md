<p align="center">
  <img src="banner.png" alt="banner" height="275"/>
</p>

<hr/>

[![codecov](https://codecov.io/gh/CorieW/firestore-web-scraper/graph/badge.svg?token=6UIM5NKLR0)](https://codecov.io/gh/CorieW/firestore-web-scraper)

## 📝 About

This extension allows you to automate web scraping tasks using Firestore. Simply add a document to a designated Firestore collection describing the website to scrape and the data to extract. The extension will process the task, perform the scraping, and update the document with the results, all managed directly from Firestore.

## ✨ Features

- Scrape websites using Firestore documents.
- Use multiple selectors to extract data (ID, Class, Tag, Attribute, Text, CSS selector).
- Extract data from the HTML, innerHTML, text, or attribute of an element.
- Extract as much data as you like from a single Firestore document.

## 🚀 Usage

You can read [PREINSTALL.md](https://github.com/CorieW/firestore-web-scraper/blob/master/PREINSTALL.md) and [POSTINSTALL.md](https://github.com/CorieW/firestore-web-scraper/blob/master/POSTINSTALL.md) for more detailed instructions on how to use this extension.

## 🛠️ Installation

### Option 1: Firebase Console (Recommended)

  - Go to the [Firebase Console](https://console.firebase.google.com/)
  - Select your project
  - Navigate to Extensions in the left sidebar
  - Click Browse the catalog
  - Search for "Firestore Web Scraper"
  - Click Install
  - Configure the extension parameters
  - Deploy the extension

### Option 2: Firebase CLI

   ```bash
   # Clone the repository
   git clone https://github.com/CorieW/firestore-web-scraper.git

   # Install the extension
   firebase ext:install ./firestore-web-scraper

   # Deploy the extension
   firebase deploy --only extensions
   ```

## 🤝 Contributing

Contributions are always welcome! If you have an idea for a new feature or a bug fix, please open an issue first to discuss the changes.
