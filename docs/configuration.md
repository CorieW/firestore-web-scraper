# Configuration

Configure the scraper in code when exporting your Firebase Function:

```ts
import firestoreWebScraper from 'firestore-web-scraper'

export const processQueue = firestoreWebScraper({
  location: 'us-central1',
  database: '(default)',
  scrapeCollection: 'scraping',
  logLevel: 'info',
  fetchTimeoutMs: 5000,
  runtimeOptions: {
    timeoutSeconds: 120,
    memory: '512MiB',
    maxInstances: 10,
  },
})
```

The package does not read environment variables itself. If you want to use `.env` or Firebase environment configuration, read those values in your Functions app and pass them into `firestoreWebScraper`.

## Options

| Property           | Default       | Description                                                                                  |
| ------------------ | ------------- | -------------------------------------------------------------------------------------------- |
| [`location`][functions-locations] | `us-central1` | Cloud Functions and Firestore trigger region.                                                |
| [`database`][firestore-manage-databases] | `(default)`   | Firestore database ID, such as `(default)` or a named database ID. |
| `scrapeCollection` | `scraping`    | Collection path containing scraping task documents. See [Firestore Tasks](./firestore-tasks.md). |
| `logLevel`         | `info`        | Logger level: `debug`, `info`, `warn`, `error`, or `silent`.                                 |
| `fetchTimeoutMs`   | `5000`        | Maximum time to wait for a scrape HTTP request before aborting.                              |
| [`runtimeOptions`][event-handler-options] | omitted       | Optional Firebase v2 runtime/event options.                                                  |
| [`eventarcChannel`][event-handler-options-channel] | omitted       | Optional Eventarc channel name for extension-style custom events.                            |
| [`selectedEvents`][event-handler-options-event-type] | omitted       | Optional selected Eventarc event types.                                                       |

## Runtime Options

`runtimeOptions` is an optional object passed into the Firebase v2 Firestore trigger options. Use it for function runtime concerns such as:

- [`timeoutSeconds`][global-options-timeout-seconds]
- [`memory`][global-options-memory]
- [`minInstances`][global-options-min-instances]
- [`maxInstances`][global-options-max-instances]
- [`concurrency`][global-options-concurrency]
- [`cpu`][global-options-cpu]
- [`serviceAccount`][event-handler-options-service-account]
- [`secrets`][global-options-secrets]
- [`retry`][event-handler-options-retry]
- [`labels`][global-options-labels]

The package owns the Firestore trigger identity, so `runtimeOptions` does not accept `document`, `database`, `namespace`, `region`, or event filter fields.

See Firebase's [manage functions guide][manage-functions] for how runtime options affect deployed functions.

[event-handler-options]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.eventhandleroptions
[event-handler-options-channel]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.eventhandleroptions#eventhandleroptionschannel
[event-handler-options-event-type]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.eventhandleroptions#eventhandleroptionseventtype
[event-handler-options-retry]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.eventhandleroptions#eventhandleroptionsretry
[event-handler-options-service-account]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.eventhandleroptions#eventhandleroptionsserviceaccount
[firestore-manage-databases]: https://firebase.google.com/docs/firestore/manage-databases
[functions-locations]: https://firebase.google.com/docs/functions/locations
[global-options-concurrency]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionsconcurrency
[global-options-cpu]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionscpu
[global-options-labels]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionslabels
[global-options-max-instances]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionsmaxinstances
[global-options-memory]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionsmemory
[global-options-min-instances]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionsmininstances
[global-options-secrets]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionssecrets
[global-options-timeout-seconds]: https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.globaloptions#globaloptionstimeoutseconds
[manage-functions]: https://firebase.google.com/docs/functions/manage-functions
