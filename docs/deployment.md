# Deployment

## Install

Install the package in your Firebase Functions project:

```bash
cd functions
pnpm add firestore-web-scraper
```

Export a function from your Functions entry point:

```ts
import firestoreWebScraper from 'firestore-web-scraper'

export const processQueue = firestoreWebScraper({
  location: 'us-central1',
  database: '(default)',
  scrapeCollection: 'scraping',
})
```

## Deploy

From the Firebase project root:

```bash
firebase deploy --only functions
```

If your app uses the traditional `functions/` layout, `firebase.json` should point at that directory:

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs22"
  }
}
```

## What Gets Deployed

Deploying your Firebase Functions app deploys a single 2nd gen Cloud Function export:

- Function export: `processQueue` or whatever name you assign to `firestoreWebScraper(config)`
- Trigger: Cloud Firestore document created
- Document pattern: `${scrapeCollection}/{documentId}`
- Database: `database`
- Region: `location`
- Runtime: whatever your Firebase Functions project config sets, typically Node.js 22

The package does not deploy Firestore rules, indexes, scheduled jobs, or Firebase Extension marketplace resources.

## Roles And Permissions

The deployed function reads and updates documents in Firestore. Its runtime service account needs permission to read and write task documents. The Firebase Extension version used `datastore.user`; for a package-based setup, grant the equivalent Firestore access to the service account you deploy with or set in `runtimeOptions.serviceAccount`.

Typical deployment also requires the deploying identity to have permissions to create/update Cloud Functions, Eventarc triggers, Artifact Registry images, and to act as the runtime service account. In Firebase projects, the Firebase CLI and Google Cloud IAM setup usually handle this, but locked-down projects may need explicit IAM grants.

### Create A Runtime Service Account

You can create a dedicated runtime service account with `gcloud`:

```bash
PROJECT_ID="your-firebase-project-id"
SA_NAME="firestore-web-scraper"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create "${SA_NAME}" \
  --project="${PROJECT_ID}" \
  --display-name="Firestore Web Scraper Runtime"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/datastore.user"
```

Then use that account in your scraper config:

```ts
export const processQueue = firestoreWebScraper({
  scrapeCollection: 'scraping',
  runtimeOptions: {
    serviceAccount: 'firestore-web-scraper@your-firebase-project-id.iam.gserviceaccount.com',
  },
})
```

If your deployer does not already have permission to deploy functions as that service account, grant `iam.serviceAccountUser` on the runtime service account:

```bash
DEPLOYER="user:you@example.com"

gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --member="${DEPLOYER}" \
  --role="roles/iam.serviceAccountUser"
```

## Billing

Cloud Functions for Firebase and outbound scraping traffic can incur charges. Use appropriate runtime limits such as `timeoutSeconds`, `maxInstances`, and `fetchTimeoutMs`.
