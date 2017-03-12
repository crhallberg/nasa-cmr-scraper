const spawn = require('child_process').spawn,
      fs = require('fs'),
      debug = () => {}; // console.log.bind(console); //

const threads = 16;
const timeout = 20;

let done = [];
let jsonOut = [];
let links = fs.readFileSync('./sorted-links.txt', 'utf-8').split('\n');
console.log('Checking ' + links.length + ' links...');
for (let i = 0; i < threads; i++) {
  investigate(i);
}

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

function checkDoneAndClose() {
  for (let i = 0; i < done.length; i++) {
    if (!done[i]) {
      return;
    }
  }
  links = links.filter((op) => op !== null);
  console.log('writing file', links.length);
  fs.writeFileSync('traced-data-links.json', JSON.stringify(jsonOut, null, '\t'));
}

function save(index, headers) {
  debug('save', headers.url);
  // links[index] = headers;
  jsonOut.push({
     url: links[index],
     header: headers
  });
  next(index);
}
function reject(index) {
  debug('reject', links[index]);
  // links[index] = null;
  next(index);
}
function next(index) {
  const n = index + threads;
  if (n < links.length) {
    investigate(n);
  } else {
    done[index % threads] = true;
    checkDoneAndClose();
  }
}

function parseHeaders(_headers) {
  const headers = _headers.split('\r\n');
  let obj = {};
  for (let i = 1; i < headers.length; i++) {
    if (!headers[i]) {
      continue;
    }
    const parts = headers[i].split(': ', 2);
    obj[parts[0]] = parts[1];
  }
  return obj;
}
function checkFile(url) {
  return new Promise((succeed, fail) => {
    if (
      !url
      || !url.match('://')
      || url.substr(0, 7) === 'mailto:'
      || (url.substr(0, 6) === 'ftp://' && url.substr(-1) === '/')
    ) {
      return fail();
    }
    curl(['-sIL', url, '--connect-timeout', timeout])
      .then(function(_headers) {
        if (!_headers) {
          return fail();
        }
        const headers = _headers.trim().split('\r\n\r\n');
        const metadata = parseHeaders(headers[headers.length - 1]);
        if (
          url.substr(0, 6) !== 'ftp://'
          && (
            !metadata
            || !metadata['Content-Type']
            || metadata['Content-Type'].match('text/html')
          )
        ) {
          return fail();
        }
        succeed(metadata);
      })
      .catch((code) => {
        debug('curl error: ' + code);
        fail();
      });
  });
}
function investigate(index) {
  console.log(index % threads, index, links[index]);
  checkFile(links[index])
    .then((headers) => save(index, headers))
    .catch(() => reject(index));
}
