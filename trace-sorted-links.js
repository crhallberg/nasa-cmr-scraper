const spawn = require('child_process').spawn,
      fs = require('fs'),
      ftp = require('ftp-get'),
      debug = () => {}; // console.log.bind(console); //

const threads = 50;
let done = [];
let links = fs.readFileSync('./sorted-links.txt', 'utf-8').split('\n');
console.log('Checking ' + links.length + ' links...');
for (let i = 0; i < threads; i++) {
  investigate(i);
}

function investigate(index) {
  function reject() {
    debug('reject', links[index]);
    links[index] = null;
  }
  function next() {
    const n = index + threads;
    if (n < links.length) {
      setTimeout(() => { investigate(n); }, 10);
    } else {
      done[index % threads] = true;
      for (let i = 0; i < done.length; i++) {
        if (!done[i]) {
          return;
        }
      }
      const ws = fs.createWriteStream('./traced-data-links.txt');
      for (let i = 0; i < links.length; i++) {
        if (links[i] !== null) {
          ws.write(links[i] + '\n');
        }
      }
      ws.end();
    }
  }
  if (!links[index] || !links[index].match('://') || links[index].substr(0, 6) === 'ftp://') {
    reject();
    next();
    return;
  }
  console.log(index % threads, index, links[index]);
  traceDownload(links[index], 10)
    .then(function(res) {
      if ((Object.keys(res.headers).length === 0 && res.headers.constructor === Object)
        || !res.headers['Content-Type']
        || res.headers['Content-Type'] === 'text/html'
      ) {
        reject();
      }
      next();
    })
    .catch(function(reason) {
      console.log('error:', reason);
      reject();
      next();
    });
}

function parseHeaders(_headers) {
  const headers = _headers.split('\r\n');
  let status = parseInt(headers[0].split(' ')[1]);
  let obj = {};
  for (let i = 1; i < headers.length; i++) {
    if (!headers[i]) {
      continue;
    }
    const parts = headers[i].split(': ', 2);
    obj[parts[0]] = parts[1];
  }
  return [status, obj];
}
function curlPromise(params) {
  debug('curl', params.join(' '));
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
      if (error || resp.length === 0) {
        fail(error);
      } else {
        const parts = resp.split('\r\n\r\n');
        let off = 1;
        while (off < parts.length && !parts[parts.length - off]) {
          off++
        }
        if (off === parts.length) {
          fail('empty header');
        }
        const [status, headers] = parseHeaders(parts[parts.length - off]);
        succeed({
          status: status,
          headers: headers
        });
      }
    });
  });
}
function traceDownload(url) {
  return new Promise((succeed, fail) => {
    curlPromise(['-sIL', url, '--connect-timeout', 10])
      .then(function clean(res) {
        try {
          if (res.status === 200) {
            delete res.status;
            delete res.headers['Access-Control-Allow-Headers'];
            delete res.headers['Access-Control-Allow-Origin'];
            delete res.headers['Connection'];
            delete res.headers['Date'];
            delete res.headers['Server'];
            delete res.headers['Strict-Transport-Security'];
            for (let h in res.headers) {
              if (h.charAt(0) === 'X') {
                delete res.headers[h];
              }
            }
            res.url = url;
            succeed(res);
          } else {
            fail(res.status + ' ' + url);
          }
        } catch(e) {
          fail(e);
        }
      }).catch(fail);
  });
}
