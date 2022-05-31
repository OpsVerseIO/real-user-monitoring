"use strict";

var tracer = (function () {
  const { WebTracerProvider } = require("@opentelemetry/sdk-trace-web");
  const {
    DocumentLoadInstrumentation,
  } = require("@opentelemetry/instrumentation-document-load");
  const { ZoneContextManager } = require("@opentelemetry/context-zone");
  const {
    registerInstrumentations,
  } = require("@opentelemetry/instrumentation");
  const {
    FetchInstrumentation,
  } = require("@opentelemetry/instrumentation-fetch");
  const { B3Propagator } = require("@opentelemetry/propagator-b3");
  const { TraceIdRatioBasedSampler } = require("@opentelemetry/core");

  const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
  const { BatchSpanProcessor } = require("@opentelemetry/tracing");
  const { Resource } = require("@opentelemetry/resources");
  const {
    SemanticResourceAttributes,
  } = require("@opentelemetry/semantic-conventions");

  //Initialising Variables
  let authKey = "";
  let serviceName = "";
  let collectorUrl = "";
  let samplingRatio = 1;

  function create() {
    var start = function (params) {
      if (params.serviceName) serviceName = params.serviceName;
      if (params.authKey) authKey = params.authKey;
      if (params.collectorUrl) collectorUrl = params.collectorUrl;
      if (params.samplingRatio) samplingRatio = params.samplingRatio;

      const provider = new WebTracerProvider({
        resource: new Resource({
          context: serviceName,
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        sampler: new TraceIdRatioBasedSampler(samplingRatio),
      });

      const options = {
        headers: {
          Authorization: "Basic " + authKey,
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers": "*",
          "X-CSRF": "1",
        },
        concurrencyLimit: 10,
        url: collectorUrl,
      };

      provider.addSpanProcessor(
        new BatchSpanProcessor(new ZipkinExporter(options))
      );

      provider.register({
        contextManager: new ZoneContextManager(),
        propagator: new B3Propagator(),
      });

      window.tracer = provider.getTracer("tracer-web");
      window.parentSpan = window.tracer.startSpan("apiCall");

      registerInstrumentations({
        instrumentations: [
          new DocumentLoadInstrumentation(),
          new FetchInstrumentation({
            ignoreUrls: [/localhost:8090\/sockjs-node/],
            propagateTraceHeaderCorsUrls: [
              /.+/g, //Allows all service url's
              "https://httpbin.org/get",
            ],
            clearTimingResources: true,
          }),
        ],
      });
    };

    return {
      start: start,
    };
  }

  return {
    getInstance: function () {
      if (typeof rumInst == "undefined") {
        var rumInst = create();
      }
      return rumInst;
    },
  };
})();

var OpsVerseRum = tracer.getInstance();
if (global === undefined) {
  var global = window;
}
global.OpsVerseRum = tracer.getInstance();
module.exports = OpsVerseRum;
