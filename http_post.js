import http from 'k6/http';

export const options = {
  stages: [
    { duration: "1m", target: 100 },
  ],
  thresholds: {
    'http_reqs': ['rate < 100'],
  }
}

export default function () {
  var url = `http://${__ENV.HOSTNAME}/link`;
  var payload = JSON.stringify({
    "url": `https://www.google.com/?q=vu%20${__VU},iter%20${__ITER}`
  })

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}
