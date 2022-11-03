# Real User Monitoring

## Browser Instrumentation

### Overview

OpsVerse Browser RUM uses OpenTelemetry standards to enable high quality, ubiquitous, and portable telemetry to enable effective observability. OpsVerse browser RUM package can be used to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.

Note: Currently the library supports only [Fetch Api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for Trace header propagation. [Axios has issues](https://github.com/open-telemetry/opentelemetry-js/issues/1076)

### Setup

This guide uses the NPM, but the steps to instrument your own application should be broadly the same.

Execute the following command

```
npm instal --save opsverse-rum
npm i @opentelemetry/api
```

#### Import and initialize the package

For HTML and Javascript based application

```
    import("opsverse-rum").then((res) => {
        if(res){
            res.start({
                authKey: "<B64EncodedBasicAuthToCollectorUrl>",
                serviceName: "example-service",
                collectorUrl: "<OpenTelemetryCollectorUrl>",
                samplingRatio: "1" //min: 0.0 and max: 1.0
            });
        }
    })
```

or

```
    import { OpsVerseBrowserRum } from ‘opsverse-rum’
    if (typeof window !== "undefined" && OpsVerseRum) {
        OpsVerseBrowserRum.start({
            authKey: "<B64EncodedBasicAuthToCollectorUrl>",
            serviceName: "example-service",
            collectorUrl: "<OpenTelemetryCollectorUrl>",
            samplingRatio: "1" //min: 0.0 and max: 1.0
        });
    }
```

For NextJS

```
    const [libraryLoaded, setLibraryLoaded] = React.useState(false);
    const OpsVerseRumLibrary = dynamic(
        () =>
        import("opsverse-rum").then((res) => {
            if (res) {
                setLibraryLoaded(true);
            }
        }),
        { ssr: false }
    );

    React.useEffect(() => {
    if (!libraryLoaded) return;
        OpsVerseBrowserRum.start({
            authKey: "<B64EncodedBasicAuthToCollectorUrl>",
            serviceName: "example-service",
            collectorUrl: "<OpenTelemetryCollectorUrl>",
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

#### Start your application

Now, build your application and run your code in the browser. In the console/network tab of the browsers developer toolbar you should see some traces being exported to the collector url.

See [OpsVerse support docs](https://docs.opsverse.io/observenow/collection/application-integration/node/) for reference.

#### Opentelemetry Packages used

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

## NodeJS Instrumentation

### Overview

In order to visualize and analyze your traces, you will need to export them to a tracing server. Follow these instructions for setting up a backend and exporter.

You may also want to use the BatchSpanProcessor to export spans in batches in order to more efficiently use resources and [B3 Propagation](https://github.com/openzipkin/b3-propagation) headers which are used for trace context propagation across service boundaries.

### Setup

Please npm install or yarn add the following packages

[@opentelemetry/sdk-node](https://www.npmjs.com/package/@opentelemetry/sdk-node)
[@opentelemetry/auto-instrumentations-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
[@opentelemetry/resources](https://www.npmjs.com/package/@opentelemetry/resources)
[@opentelemetry/semantic-conventions](https://www.npmjs.com/package/@opentelemetry/semantic-conventions)
[@opentelemetry/exporter-zipkin](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)
[@opentelemetry/core](https://www.npmjs.com/package/@opentelemetry/core)
[@opentelemetry/propagator-b3](https://www.npmjs.com/package/@opentelemetry/propagator-b3)
[@opentelemetry/api](https://www.npmjs.com/package/@opentelemetry/api)

#### Create a file tracing.js which will contain your tracing setup code.

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
            Authorization: "Basic <base64 encoded clientId:secret>",
        },
        url: "<OpsVerse collector url>",
    };
    const exporter = new ZipkinExporter(options);

    const sdk = new opentelemetry.NodeSDK({
        traceExporter: exporter,
        instrumentations: [getNodeAutoInstrumentations()],
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: "<tracking-name>",
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

The tracing setup and configuration should be run before your application code. One tool commonly used for this task is the -r, --require module flag.

```
    node --require './tracing.js' app.js
```

You are now good to send traces to any OpenTelemetry Collector. This library was specifically crafted so that you may additionally get Real User Monitoring metrics if by sending to the OpenTelemetry Collector you launched via [Opsverse](https://console.opsverse.io)
