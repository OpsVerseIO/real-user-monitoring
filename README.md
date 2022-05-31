### Real User Monitoring (Browser Implementation)

## Overview

OpsVerse Browser RUM uses OpenTelemetry standards to enable High-quality, ubiquitous, and portable telemetry to enable effective observability. OpsVerse RUM packages can be used to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.

## Opentelemetry Packages used

[@opentelemetry/sdk-trace-web](https://www.npmjs.com/package/@opentelemetry/sdk-trace-web)
[@opentelemetry/instrumentation-document-load](https://www.npmjs.com/package/@opentelemetry/instrumentation-document-load)
[@opentelemetry/context-zone](https://www.npmjs.com/package/@opentelemetry/context-zone)
[@opentelemetry/instrumentation](https://www.npmjs.com/package/@opentelemetry/instrumentation)
[@opentelemetry/instrumentation-fetch](https://www.npmjs.com/package/@opentelemetry/instrumentation-fetch)
[@opentelemetry/propagator-b3](https://www.npmjs.com/package/@opentelemetry/propagator-b3)
[@opentelemetry/core](https://www.npmjs.com/package/@opentelemetry/core)
[@opentelemetry/exporter-zipkin](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)
[@opentelemetry/sdk-trace-base](https://www.npmjs.com/package/@opentelemetry/sdk-trace-base)
[@opentelemetry/resources](https://www.npmjs.com/package/@opentelemetry/resources)
[@opentelemetry/semantic-conventions](https://www.npmjs.com/package/@opentelemetry/semantic-conventions)

## Setup

This guide uses the NPM, but the steps to instrument your own application should be broadly the same.

Add @OpsVerseIO/browser-rum to your package.json file, then initialize:

### For HTML and Javascript based application

```
    import { OpsVerseRum } from ‘@OpsVerseIO/browser-rum’
    if (typeof window !== "undefined" && OpsVerseRum) {
        OpsVerseRum.start({
            authKey: "<base64 encoded>",
            serviceName: "<tracking-name>",
            collectorUrl: "<OpsVerse Collector Url>",
            samplingRatio: "1" //min: 0.0 and max: 1.0
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
            authKey: "<base64 encoded>",
            serviceName: "<tracking-name>",
            collectorUrl: "<OpsVerse Collector Url>",
            samplingRatio: "1" //min: 0.0 and max: 1.0
        });
    }, [libraryLoaded]);

    return (
        <>
            <Component {...pageProps} />
            <OpsVerseRumLibrary />
        </>
    )
```

## Start your application

Now, build your application and run your code in the browser. In the console/network tab of the browsers developer toolbar you should see some traces being exported to the collector url.

### Real User Monitoring (NodeJs Implementation)

## Overview

## Opentelemetry Packages used

## Setup

The tracing setup and configuration should be run before your application code. One tool commonly used for this task is the -r, --require module flag.

Create a file with a name like tracing.js which will contain your tracing setup code.

```
    /* tracing.js */
    // Require dependencies
    const opentelemetry = require("@opentelemetry/sdk-node");
    const {
    getNodeAutoInstrumentations,
    } = require("@opentelemetry/auto-instrumentations-node");
    const { Resource } = require("@opentelemetry/resources");
    const {
    SemanticResourceAttributes,
    } = require("@opentelemetry/semantic-conventions");

    const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
    const { CompositePropagator } = require("@opentelemetry/core");
    const {
    B3Propagator,
    B3InjectEncoding,
    } = require("@opentelemetry/propagator-b3");
    const api = require("@opentelemetry/api");

    const options = {
    headers: {
        Authorization: "Basic ZGV2b3Bzbm93OndlaXJkaGVhdDE4",
    },
    url: "https://jaeger-collector-pearjet.observe.devopsnow.cloud/api/v2/spans",
    };
    const exporter = new ZipkinExporter(options);

    const sdk = new opentelemetry.NodeSDK({
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "console-api",
    }),
    });

    api.propagation.setGlobalPropagator(
    new CompositePropagator({
        propagators: [
        new B3Propagator(),
        new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
        ],
    })
    );

    sdk.start();


```

## Now you can run your application as you normally would, but you can use the --require flag to load the tracing code before the application code.

```
    node --require './tracing.js' app.js
```

Open your web browser and reload the page a few times, after a while you should see the spans printed in the console by the ConsoleSpanExporter.

Fyi: [B3 Propagation](https://github.com/openzipkin/b3-propagation) is a specification for the header "b3" and those that start with "x-b3-". These headers are used for trace context propagation across service boundaries.
