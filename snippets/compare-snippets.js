const fs = require('fs');
const Table = require('cli-table2');
const colors = require('colors');

const files = fs.readdirSync('snippets/original');

const table = new Table({
  head: ['file'.blue, 'original'.blue, 'transpiled'.blue]
});

for (let file of files) {
  const original = fs.statSync(`snippets/original/${file}`).size;
  const transpiled = fs.statSync(`snippets/transpiled/${file}`).size;
  const percentage = parseInt((transpiled * 100/original), 10);

  table.push([
    file,
    original,
    `${transpiled} (${percentage}%)`
  ]);
}

console.log(table.toString());
