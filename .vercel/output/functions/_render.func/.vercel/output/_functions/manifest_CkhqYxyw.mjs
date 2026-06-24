import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_D5RQwAHK.mjs';
import 'es-module-lexer';
import { V as decodeKey } from './chunks/astro/server_Jx1ZJCLd.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///tmp/ehs-site/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/accidents/[slug]","isIndex":true,"type":"page","pattern":"^\\/accidents\\/([^/]+?)\\/?$","segments":[[{"content":"accidents","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/accidents/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.Dtfxnn-k.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/accidents","isIndex":true,"type":"page","pattern":"^\\/accidents\\/?$","segments":[[{"content":"accidents","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/accidents/index.astro","pathname":"/accidents","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/ai-apps/[slug]","isIndex":true,"type":"page","pattern":"^\\/ai-apps\\/([^/]+?)\\/?$","segments":[[{"content":"ai-apps","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/ai-apps/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DeeuErPv.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/ai-apps","isIndex":true,"type":"page","pattern":"^\\/ai-apps\\/?$","segments":[[{"content":"ai-apps","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ai-apps/index.astro","pathname":"/ai-apps","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/documents/[slug]","isIndex":true,"type":"page","pattern":"^\\/documents\\/([^/]+?)\\/?$","segments":[[{"content":"documents","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/documents/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.Dp0956Vc.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/documents","isIndex":true,"type":"page","pattern":"^\\/documents\\/?$","segments":[[{"content":"documents","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/documents/index.astro","pathname":"/documents","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/messages/[slug]","isIndex":true,"type":"page","pattern":"^\\/messages\\/([^/]+?)\\/?$","segments":[[{"content":"messages","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/messages/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.XeWAqn7-.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/messages","isIndex":true,"type":"page","pattern":"^\\/messages\\/?$","segments":[[{"content":"messages","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/messages/index.astro","pathname":"/messages","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/regulations/[slug]","isIndex":true,"type":"page","pattern":"^\\/regulations\\/([^/]+?)\\/?$","segments":[[{"content":"regulations","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/regulations/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DRuOZ5AO.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/regulations","isIndex":true,"type":"page","pattern":"^\\/regulations\\/?$","segments":[[{"content":"regulations","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/regulations/index.astro","pathname":"/regulations","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/standards/[slug]","isIndex":true,"type":"page","pattern":"^\\/standards\\/([^/]+?)\\/?$","segments":[[{"content":"standards","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/standards/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DRYNUg5D.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/standards","isIndex":true,"type":"page","pattern":"^\\/standards\\/?$","segments":[[{"content":"standards","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/standards/index.astro","pathname":"/standards","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B9DQytfQ.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"},{"type":"external","src":"/_astro/index.DUWg1727.css"}],"routeData":{"route":"/videos/[slug]","isIndex":true,"type":"page","pattern":"^\\/videos\\/([^/]+?)\\/?$","segments":[[{"content":"videos","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/videos/[slug]/index.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DkseDfJo.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/videos","isIndex":true,"type":"page","pattern":"^\\/videos\\/?$","segments":[[{"content":"videos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/videos/index.astro","pathname":"/videos","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.D5tJR1_A.js"}],"styles":[{"type":"external","src":"/_astro/index.DHVX0KBz.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://hser.ren","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/tmp/ehs-site/src/pages/accidents/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/accidents/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/ai-apps/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/ai-apps/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/documents/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/documents/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/messages/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/messages/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/regulations/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/regulations/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/standards/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/standards/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/videos/[slug]/index.astro",{"propagation":"none","containsHead":true}],["/tmp/ehs-site/src/pages/videos/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/accidents/[slug]/index@_@astro":"pages/accidents/_slug_.astro.mjs","\u0000@astro-page:src/pages/accidents/index@_@astro":"pages/accidents.astro.mjs","\u0000@astro-page:src/pages/ai-apps/[slug]/index@_@astro":"pages/ai-apps/_slug_.astro.mjs","\u0000@astro-page:src/pages/ai-apps/index@_@astro":"pages/ai-apps.astro.mjs","\u0000@astro-page:src/pages/documents/[slug]/index@_@astro":"pages/documents/_slug_.astro.mjs","\u0000@astro-page:src/pages/documents/index@_@astro":"pages/documents.astro.mjs","\u0000@astro-page:src/pages/messages/[slug]/index@_@astro":"pages/messages/_slug_.astro.mjs","\u0000@astro-page:src/pages/messages/index@_@astro":"pages/messages.astro.mjs","\u0000@astro-page:src/pages/regulations/[slug]/index@_@astro":"pages/regulations/_slug_.astro.mjs","\u0000@astro-page:src/pages/regulations/index@_@astro":"pages/regulations.astro.mjs","\u0000@astro-page:src/pages/standards/[slug]/index@_@astro":"pages/standards/_slug_.astro.mjs","\u0000@astro-page:src/pages/standards/index@_@astro":"pages/standards.astro.mjs","\u0000@astro-page:src/pages/videos/[slug]/index@_@astro":"pages/videos/_slug_.astro.mjs","\u0000@astro-page:src/pages/videos/index@_@astro":"pages/videos.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","/tmp/ehs-site/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_CkhqYxyw.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.Dtfxnn-k.js","/astro/hoisted.js?q=1":"_astro/hoisted.DeeuErPv.js","/astro/hoisted.js?q=2":"_astro/hoisted.Dp0956Vc.js","/astro/hoisted.js?q=3":"_astro/hoisted.XeWAqn7-.js","/astro/hoisted.js?q=4":"_astro/hoisted.DRuOZ5AO.js","/astro/hoisted.js?q=5":"_astro/hoisted.DRYNUg5D.js","/astro/hoisted.js?q=6":"_astro/hoisted.DkseDfJo.js","/astro/hoisted.js?q=7":"_astro/hoisted.D5tJR1_A.js","/astro/hoisted.js?q=8":"_astro/hoisted.B9DQytfQ.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/index.DHVX0KBz.css","/_astro/index.DUWg1727.css","/20b63981a8e4ba63a5444e4ada722031.txt","/_astro/hoisted.B9DQytfQ.js","/_astro/hoisted.D5tJR1_A.js","/_astro/hoisted.DRYNUg5D.js","/_astro/hoisted.DRuOZ5AO.js","/_astro/hoisted.DeeuErPv.js","/_astro/hoisted.DkseDfJo.js","/_astro/hoisted.Dp0956Vc.js","/_astro/hoisted.Dtfxnn-k.js","/_astro/hoisted.XeWAqn7-.js","/images/ehs-checklist-app.jpg","/images/ehs-checklist-app.png","/images/fire-extinguisher-app.png","/images/ghs-label-app.png","/images/risk-assessment-app.png","/images/safety-contest-app.jpg","/images/safety-quiz-app.jpg","/images/safety-toolbox-app.png","/images/ai-apps/accident.jpg","/images/ai-apps/ai-hazard-detection.png","/images/ai-apps/chemical-incompatibility.png","/images/ai-apps/chemical-warning-sign-tool.png","/images/ai-apps/chemical.jpg","/images/ai-apps/construction-safety-check.png","/images/ai-apps/dashboard.jpg","/images/ai-apps/document.jpg","/images/ai-apps/dual-prevention.png","/images/ai-apps/ehs-checklist-generator.png","/images/ai-apps/ehs-dashboard.png","/images/ai-apps/ehs-exam-generator.png","/images/ai-apps/eight-operations-game.png","/images/ai-apps/emergency-card-tool.png","/images/ai-apps/emergency-drill-toolkit.png","/images/ai-apps/emergency-plan-card.png","/images/ai-apps/emergency.jpg","/images/ai-apps/environment.jpg","/images/ai-apps/environmental-factor-tool.png","/images/ai-apps/fire.jpg","/images/ai-apps/game.jpg","/images/ai-apps/hazard-identification-tool.png","/images/ai-apps/hazard-identification.png","/images/ai-apps/inspection.jpg","/images/ai-apps/jsa-generator.png","/images/ai-apps/management-system-generator.png","/images/ai-apps/msds-generator-v2.png","/images/ai-apps/occupational-health.jpg","/images/ai-apps/protective-equipment-game.png","/images/ai-apps/regulation.jpg","/images/ai-apps/risk-notification-card.png","/images/ai-apps/risk.jpg","/images/ai-apps/safety-checklist-tool.png","/images/ai-apps/safety-contest-v2.png","/images/ai-apps/safety-sign-generator.png","/images/ai-apps/safety-sign-selector.png","/images/ai-apps/safety-world-cup-game.png","/images/ai-apps/sds-generator.png","/images/ai-apps/signage.jpg","/images/ai-apps/special-work-emergency.png","/images/ai-apps/toxicity-grading-tool.png","/images/ai-apps/training.jpg"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"VW+M2V7LArJX9fgKRN3VxSELMvUMD+Qew8SxzUKgCAA=","experimentalEnvGetSecretEnabled":false});

export { manifest };
