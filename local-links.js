const fs = require('fs'),
      json = require('./collections.json');

let links = [];
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

const d = new Date();
require('child_process').spawn('mv', ['all-links.txt', 'links.' + d.getTime() + '.txt.bak']);
fs.writeFileSync('./all-links.txt', links.join('\n'));
