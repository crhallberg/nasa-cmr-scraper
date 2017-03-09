const fs = require('fs');

fs.writeFileSync('./sorted-links.txt', '', 'utf-8');
fs.readFile('./all_links.txt', 'utf-8', function(err, txt) {
  if (err) {
    console.log(err);
    return;
  }
  let lines = txt.split('\n').sort();
  console.log(lines.length);
  let count = 0;
  const ws = fs.createWriteStream('./sorted-links.txt');
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i] !== lines[i-1]) {
      ws.write(lines[i] + '\n');
      count ++;
    }
  }
  ws.end();
  console.log(count);
});
