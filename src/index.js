"use strict";

var tracer = (function () {
  //Imports
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

  //Decalarations
  let authKey = "ZGV2b3Bzbm93OndlaXJkaGVhdDE4";
  let serviceName = "tracer-rum";
  let collectorUrl =
    "https://jaeger-collector-pearjet.observe.devopsnow.cloud/api/v2/spans";

  function create() {
    var start = function (params) {
      if (params.serviceName) serviceName = params.serviceName;
      if (params.authKey) authKey = params.authKey;
      if (params.collectorUrl) collectorUrl = params.collectorUrl;

      const provider = new WebTracerProvider({
        resource: new Resource({
          context: serviceName,
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        sampler: new TraceIdRatioBasedSampler(1),
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
            propagateTraceHeaderCorsUrls: [/http:\/\/localhost:*\.*/],
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
