# Pre-Installation Guide

This guide will help you install and configure this extension in your Firebase project.

## Billing
To install an extension, your project must be on the [Blaze (pay as you go) plan](https://firebase.google.com/pricing)

## Setup

### **Step 1: Install the Extension**

You can install this extension locally by running the following commands:

   ```bash
   git clone https://github.com/CorieW/firestore-web-scraper.git
   firebase ext:install ./firestore-web-scraper
   ```

In the future, this extension could be published to the Firebase Extensions registry for easier installation.

### **Step 2: Configure the Extension**

After installing the extension, you need setup the configuration in your Firebase project. The configuration includes the following parameters:

| Parameter       | Description             |
|-----------------|-------------------------|
| `scrapeCollection` | The collection in which scraping tasks are stored and processed. Each document in this collection should contain the details of the task to be performed. The same document will be updated with the results of the scraping task. |


**Example Configuration:**

```json
{
  "scrapeCollection": "tasks",
}
```

## GitHub Repository

The source code for this extension is available on GitHub: [firestore-web-scraper](https://github.com/CorieW/firestore-web-scraper).