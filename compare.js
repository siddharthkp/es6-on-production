const fs = require('fs');
const Table = require('cli-table2');

const sizes = {};
const files = ['es5', 'es6', 'transpiled-es5'];

const table = new Table({
  head: ['file', 'size', 'comparison']
});

for (let file of files) sizes[file] = fs.statSync(`dist/bundle-${file}.js`).size;

for (let file in sizes) table.push([
  file,
  sizes[file],
  (sizes[file]/sizes['es6'] * 100).toFixed(2) + '%'
]);

console.log(table.toString());
