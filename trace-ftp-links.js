const spawn = require('child_process').spawn,
      fs = require('fs');

function curl(params) {
  return new Promise((succeed, fail) => {
    let resp = '';
    let error = '';
    const curl = spawn('curl', params);
    curl.stdout.on('data', (data) => {
      resp += data;
    });
    curl.stderr.on('data', (data) => {
      error += data;
    });
    curl.on('close', (code) => {
      if (code > 0 || error || !resp) {
        fail(error || code);
      } else {
        succeed(resp);
      }
    });
  });
}

function crawl(resp) {
  console.log(resp);
  const lines = resp.trim().replace(/\r/g, '')
    .split('\n')
    .map((l) => l.split(' ').filter(x => x.length > 0));
  console.log(lines.length);
  console.log(lines[0]);
}

curl(['-sL', 'ftp://alt.ngs.noaa.gov/cors/rinex/1994/001/'])
  .then(crawl)
  .catch(console.log.bind(console));
