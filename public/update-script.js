const fs = require('fs');

// 1. Update pre-rolls-detail.html
let html = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/pre-rolls-detail.html', 'utf8');
html = html.replace('data-model-editor="pre-rolls"', 'data-model-editor="pre-rolls" data-model-flow data-initial-flavour="granddaddy-purple"');
html = html.replace('Explore the form', 'Replay');
fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/pre-rolls-detail.html', html, 'utf8');
console.log('Updated pre-rolls-detail.html successfully');

// 2. Read bar-viewer.js
let barViewer = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/bar-viewer.js', 'utf8');
console.log('barViewer length:', barViewer.length);
