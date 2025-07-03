# Pre-Installation Guide

Use this extension to create and perform web scraping tasks on a website.

This guide will help you install and configure this extension in your Firebase project.

## Billing
To install an extension, your project must be on the [Blaze (pay as you go) plan](https://firebase.google.com/pricing)

## Setup

### **Step 1: Install the Extension**

### **Step 2: Configure the Extension**

After installing the extension, you need setup the configuration in your Firebase project. The configuration includes the following parameters:

**Configuration Parameters:**

- **location**:
  The location of the Firestore database to use.

- **database**:
  The name of the Firestore database to use.

- **scrapeCollection**:
  The collection in which scraping tasks are stored and processed. Each document in this collection should contain the details of the task to be performed. The same document will be updated with the results of the scraping task.


**Example Configuration:**

```json
{
  "location": "us-central1",
  "database": "(default)",
  "scrapeCollection": "tasks",
}
```

## GitHub Repository

The source code for this extension is available on GitHub: [firestore-web-scraper](https://github.com/CorieW/firestore-web-scraper).