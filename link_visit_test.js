import { check } from "k6";
import { Trend } from "k6/metrics";
import http from "k6/http";

export let CreateTrendRTT = new Trend("RTT create short link");
export let GetShortLinkTrendRTT = new Trend("RTT get short link");
export let GetStatsTrendRTT = new Trend("RTT get stats");

export const options = {
  stages: [{ duration: "1m", target: 100 }],
  thresholds: {
    iterations: ["rate > 100"],
  },
};

export function testCreate(longurl) {
  var url = `http://${__ENV.HOSTNAME}/link`;
  var payload = JSON.stringify({
    url: longurl,
  });

  var params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  var r = http.post(url, payload, params);
  return r;
}

export function testGetRedirect(shortLink, longurl) {
  const r = http.get(shortLink, { redirects: 0 });
  check(r, {
    "is redirect": (r) => r.status === 302,
    "is valid url": (r) => r.headers.Location === longurl,
  });
  return r;
}

export function testGetStats(shortLink, expectedVisit) {
  const r = http.get(`${shortLink}/stats`, { redirects: 0 });
  check(r, {
    "is visit stats": (r) => r.json("visit") === expectedVisit,
  });
  return r;
}

export default function () {
  const longurl = `https://www.google.com/?q=vu${__ENV["UNIQUE"]}${__VU}`;
  var r = testCreate(longurl);
  CreateTrendRTT.add(r.timings.duration);

  const shortLink = r.json("link");
  r = testGetRedirect(shortLink, longurl);
  GetShortLinkTrendRTT.add(r.timings.duration);

  const expectedVisitCount = __ITER + 1;
  r = testGetStats(shortLink, expectedVisitCount);
  GetStatsTrendRTT.add(r.timings.duration);
}
