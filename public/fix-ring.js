const fs = require('fs');

let bv = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/bar-viewer.js', 'utf8');

// 1. In select(): after recreating atmosphere, frame it!
const oldSelectBlock = `   if(atmosphere){
    atmosphere.dispose();
    atmosphere=createLiquidAtmosphere(THREE,scene,activeFlavourColor);
   }`;

const newSelectBlock = `   if(atmosphere){
    atmosphere.dispose();
    atmosphere=createLiquidAtmosphere(THREE,scene,activeFlavourColor);
    if(goalTarget && goalPosition) atmosphere.frame(goalTarget, goalPosition.distanceTo(goalTarget));
   }`;

bv = bv.replace(oldSelectBlock, newSelectBlock);

// 2. Also right after creating atmosphere in boot():
const oldBootAtmos = "atmosphere=createLiquidAtmosphere(THREE,scene,activeFlavourColor); if(isPreRoll) applyPreRollColor(activeFlavourColor);";
const newBootAtmos = "atmosphere=createLiquidAtmosphere(THREE,scene,activeFlavourColor); if(goalTarget&&goalPosition) atmosphere.frame(goalTarget,goalPosition.distanceTo(goalTarget)); if(isPreRoll) applyPreRollColor(activeFlavourColor);";
bv = bv.replace(oldBootAtmos, newBootAtmos);

// 3. In updateAtmosphere, make sure it falls back to panel or sceneRoot:
const oldUpdateAtmos = "const panel=root.closest('[data-product-reveal]');";
const newUpdateAtmos = "const panel=root.closest('[data-product-reveal]')||sceneRoot;";
bv = bv.replace(oldUpdateAtmos, newUpdateAtmos);

fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/bar-viewer.js', bv, 'utf8');
console.log('Updated bar-viewer.js atmosphere framing');

// 4. In pre-rolls-detail.html: add data-product-reveal attribute to section
let html = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/pre-rolls-detail.html', 'utf8');
if (!html.includes('data-product-reveal')) {
  html = html.replace('<section class="product-reveal"', '<section class="product-reveal" data-product-reveal');
}

// Bump cache buster
const ts = Date.now().toString(36);
html = html.replace(/app\.js\?v=[^"]+/g, `app.js?v=ring_${ts}`);
fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/pre-rolls-detail.html', html, 'utf8');
console.log('Updated pre-rolls-detail.html with data-product-reveal and bumped cache');

let app = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/app.js', 'utf8');
app = app.replace(/model-viewer\.js\?v=[^']+/g, `model-viewer.js?v=ring_${ts}`);
fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/app.js', app, 'utf8');
console.log('Bumped app.js cache buster');
