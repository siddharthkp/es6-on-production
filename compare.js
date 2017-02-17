const fs = require('fs');
const Table = require('cli-table2');
const colors = require('colors');

const sizes = {};
const files = ['es5', 'es6', 'transpiled-es5'];

const table = new Table({
  head: ['file'.blue, 'size'.blue, 'comparison'.blue]
});

for (let file of files) sizes[file] = fs.statSync(`dist/bundle-${file}.js`).size;

for (let file in sizes) table.push([
  file,
  sizes[file],
  (sizes[file]/sizes['es6'] * 100).toFixed(2) + '%'
]);

console.log(table.toString());
