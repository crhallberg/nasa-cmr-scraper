const page_size = 200;

const spawn = require('child_process').spawn,
      fs = require('fs');

const fileStart = `{
  "feed" : {
    "updated" : "2017-03-10T02:05:41.754Z",
    "id" : "https://cmr.earthdata.nasa.gov:443/search/collections.json?pretty=true",
    "title" : "ECHO dataset metadata",
    "entry" : [
`;
const fileEnd = `]
  }
}
`;

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

function toJson(obj) {
  return JSON.stringify(obj); // , null, 't');
}

let page = 0;
function getPage(succeed, fail) {
  page ++;
  const url = 'https://cmr.earthdata.nasa.gov/search/collections.json?page_size=' + page_size + '&page_num=' + page;
  curl(['-s', url])
    .then(function (res) {
      const json = JSON.parse(res);
      const base = (page - 1) * page_size;
      console.log('Page', page, ':', base, '-', base + json.feed.entry.length);
      let entries = toJson(json.feed.entry, null, '\t');
      ws.write(entries.substring(1, entries.length - 1));
      if (json.feed.entry.length === page_size) {
        ws.write(',\n');
        getPage(succeed, fail);
      } else {
        succeed('done');
      }
    })
    .catch(fail);
}

// spawn('mv', ['collections.json', 'backups/collections.' + (new Date).getTime() + '.json.bak']);
const ws = fs.createWriteStream('./collections.json');
ws.write(fileStart);
function close(msg) {
  console.log(msg);
  ws.write(fileEnd);
  ws.end();
  // spawn('python', ['-mjson.tools', 'collections.json', '>', ');
}
const run = new Promise(getPage).then(close).catch(close);
