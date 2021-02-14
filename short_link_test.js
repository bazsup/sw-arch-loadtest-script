import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [{ duration: "1m", target: 100 }],
  thresholds: {
    http_reqs: ["rate > 100"],
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
}

export default function () {
  const longurl = `https://www.google.com/?q=vu%20${__VU},iter%20${__ITER}`;
  var r = testCreate(longurl);
  const shortLink = r.json('link');
  testGetRedirect(shortLink, longurl)
}
