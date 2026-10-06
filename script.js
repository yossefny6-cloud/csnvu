const fs = require('fs');
let html = fs.readFileSync('e:/1/index.html', 'utf8');
html = html.replace(/<button class=['"]enter-btn['"]>.*?<\/button>/, '<button class="enter-btn">الدخول للمادة <span class="btn-arrow">←</span></button>');
fs.writeFileSync('e:/1/index.html', html, 'utf8');
