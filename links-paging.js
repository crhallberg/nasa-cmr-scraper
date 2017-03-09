const page_size = 200;

const spawn = require('child_process').spawn,
      fs = require('fs'),
      debug = () => {}; // console.log.bind(console); //

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
      if (error) {
        fail(error);
      } else {
        var [head, body] = resp.split('\r\n\r\n');
        var [status, headers] = parseHeaders(head);
        succeed({
          status: status,
          headers: headers,
          body: body,
          raw: resp,
        });
      }
    });
  });
}
function traceDownload(url, limit) {
  return new Promise((succeed, fail) => {
    if (--limit === 0) {
      return succeed({url: url, error: 'limit reached'});
    }
    curlPromise(['-sI', url])
      .then(function(res) {
        try {
          if (res.status >= 300 && res.status < 400) {
            if (res.headers.Location && res.headers.Location.substr(0, 4) !== 'http') {
              let parts = url.split('/');
              const subpath = res.headers.Location.split('?')[0];
              parts = parts.slice(0, parts.length - subpath.match(/[^\/]+/g).length);
              // console.log(url, res.headers.Location);
              let urlEnd = parts.join('/');
              if (res.headers.Location.charAt(0) !== '/') {
                urlEnd += '/';
              }
              urlEnd += res.headers.Location;
              // console.log('>', urlEnd);
              traceDownload(urlEnd, limit).then(succeed);
            } else {
              debug('>', res.headers.Location);
              traceDownload(res.headers.Location, limit).then(succeed);
            }
          } else {
            delete res.body;
            delete res.raw;
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
          }
        } catch(e) {
          fail(e);
        }
      })
      .catch(function(reason) {
        fail(reason);
      });
  });
}

let page = 0;
function pagePromise() {
  return new Promise((succeed, fail) => {
    page++;
    if (false && page > 1) {
      return succeed();
    }
    console.log('Page ' + page);
    const url = 'https://cmr.earthdata.nasa.gov/search/collections.json?page_size=' + page_size + '&page_num=' + page;
    curlPromise(['-H', 'Accept: application/json', '-si', url])
      .then(function(res) {
        const json = JSON.parse(res.body);
        console.log('-', (page - 1) * page_size, 'to', (page - 1) * page_size + json.feed.entry.length);
        let links = [];
        let done = 0;
        for (let i = 0; i < json.feed.entry.length; i++) {
          const entry = json.feed.entry[i];
          if (entry.links) {
            for (let j = 0; j < entry.links.length; j++) {
              if (entry.links[j].href) {
                links.push(entry.links[j].href);
              }
            }
          } else {
            // console.log(entry);
          }
        }
        fs.appendFile('all_links.txt', links.join('\n'), (err) => {
          if (err) throw err;
          console.log('-', links.length + ' written');
          if (json.feed.entry.length === page_size) {
            pagePromise().then(succeed);
          } else {
            succeed();
          }
        });
      }).catch(console.log.bind(console));
  });
}

const d = new Date();
spawn('mv', ['all-links.txt', 'links.' + d.getTime() + '.txt.bak']);
pagePromise().then(function() {
  console.log("DONE!");
});
