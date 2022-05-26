### Real User Monitoring (Browser)

## Overview

Opsverse Browser RUM uses OpenTelemetry standards to enable High-quality, ubiquitous, and portable telemetry to enable effective observability. Opsverse RUM pacakge can be used to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.

## Opentelemetry Packages used

@opentelemetry/sdk-trace-web @opentelemetry/instrumentation-document-load @opentelemetry/context-zone @opentelemetry/instrumentation @opentelemetry/instrumentation-fetch @opentelemetry/propagator-b3 @opentelemetry/core @opentelemetry/exporter-zipkin @opentelemetry/tracing @opentelemetry/resources @opentelemetry/semantic-conventions

## Setup

This guide uses the NPM, but the steps to instrument your own application should be broadly the same.

Add @OpsVerseIO/browser-rum to your package.json file, then initialize it with:

### For Javascript frameworks

```
import { OpsVerseRum } from ‘@OpsVerseIO/browser-rum’
if (typeof window !== “undefined” && OpsVerseRum) {
    OpsVerseRum.start({
        authKey: ” “, //Pass the authentication key
        serviceName: ” “,//For trackign purpose
        collectorUrl: ” “,//End point url
        });
}
```

### For NextJS implementation you need to import the package dynamically. Open “\_app.js” file

    ```
    const [libraryLoaded, setLibraryLoaded] = React.useState(false);
    const OpsVerseRumLibrary = dynamic(
        () =>
        import(“@OpsVerseIO/rum”).then((res) => {
            if (res) {
            setLibraryLoaded(true);
            }
        }),
        { ssr: false }
    );
    React.useEffect(() => {
    if (!libraryLoaded) return;
        OpsVerseRum.start({
        authKey: ” “, //Pass the authentication key
        serviceName: ” “,//For trackign purpose
        collectorUrl: ” “,//End point url
        });
    }, [libraryLoaded]);
    return (
        <>
            <OpsVerseRumLibrary />
            <Component {...pageProps} />
        </>
    )
    ```

## Start your application

Now, build your application and run your code in the browser. In the console of the developer toolbar you should see some traces being exported to the collector url.
