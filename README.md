<p align="center">
  <img src="banner.png" alt="banner" height="275"/>
</p>

<hr/>

[![codecov](https://codecov.io/gh/CorieW/firestore-web-scraper/graph/badge.svg?token=6UIM5NKLR0)](https://codecov.io/gh/CorieW/firestore-web-scraper)

## About

This extension lets you automate web scraping tasks using Firestore. Simply add a document to a designated Firestore collection describing the website to scrape and the data to extract. The extension will process the task, perform the scraping, and update the document with the results, all managed directly from Firestore.

## Usage

You can read [PREINSTALL.md](https://github.com/CorieW/firestore-web-scraper/blob/master/PREINSTALL.md) and [POSTINSTALL.md](https://github.com/CorieW/firestore-web-scraper/blob/master/POSTINSTALL.md) for more detailed instructions on how to use this extension.

## Installation

You can install this extension locally by running the following commands:

   ```bash
   git clone https://github.com/CorieW/firestore-web-scraper.git
   firebase ext:install ./firestore-web-scraper
   ```

In the future, this extension could be published to the Firebase Extensions registry for easier installation.

## Contributing

Contributions are always welcome! If you have an idea for a new feature or a bug fix, please open an issue first to discuss the changes.
