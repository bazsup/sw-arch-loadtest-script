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
  maxRedirects: 0,
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

export function testGetRedirect(shortLink, longurl, count) {
  const requests = [];
  for (let i = 0; i < count; i++) {
    requests.push({
      method: "GET",
      url: shortLink,
    });
  }
  const r = http.batch(requests);
  const res = r[0];
  check(res, {
    "is redirect": (r) => r.status === 302,
    "is valid url": (r) => r.headers.Location === longurl,
  });
  return res;
}

export function testGetStats(shortLink, expectedVisit) {
  const r = http.get(`${shortLink}/stats`, { redirects: 0 });
  check(r, {
    "is visit stats": (r) => r.json("visit") === expectedVisit,
  });
  return r;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default function () {
  const longurl = `https://www.google.com/?q=vu${__ENV["UNIQUE"]}${__VU},iter${__ITER}`;

  const requestsCount = random(300, 500);

  var r = testCreate(longurl);
  CreateTrendRTT.add(r.timings.duration);

  const shortLink = r.json("link");
  r = testGetRedirect(shortLink, longurl, requestsCount);

  const expectedVisitCount = requestsCount;
  r = testGetStats(shortLink, expectedVisitCount);
  GetStatsTrendRTT.add(r.timings.duration);
}
