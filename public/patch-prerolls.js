const fs = require('fs');

// --- 1. UPDATE model-viewer.js ---
let mv = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/model-viewer.js', 'utf8');

// Ensure 'pre-rolls' is included in mountBarViewer routing
if (!mv.includes("['vapes','pre-rolls'].includes(root.dataset.modelEditor)")) {
  mv = mv.replace(
    "root.dataset.modelEditor==='vapes'?mountBarViewer(root,scope):mountEditor(root,scope)",
    "['vapes','pre-rolls'].includes(root.dataset.modelEditor)?mountBarViewer(root,scope):mountEditor(root,scope)"
  );
  fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/model-viewer.js', mv, 'utf8');
  console.log('1. Updated model-viewer.js for pre-rolls routing');
} else {
  console.log('1. model-viewer.js already has pre-rolls routing');
}

// --- 2. UPDATE bar-viewer.js ---
let bv = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/bar-viewer.js', 'utf8');

// Add import of approvedFlavours if needed
if (!bv.includes('approvedFlavours')) {
  bv = bv.replace(
    "import {productComponent} from './product-content.js?v=c73acc77c6a5';",
    "import {productComponent,approvedFlavours} from './product-content.js?v=c73acc77c6a5';"
  );
}

// In mountBarViewer:
const findVariantOld = "let selected=findVariant(root.dataset.initialFlavour||new URLSearchParams(location.search).get('flavour')).id;";
const findVariantNew = `const kind=root.dataset.modelEditor||'vapes';
 const isPreRoll=kind==='pre-rolls';
 const getFlavourColor=(id)=>{
  if(isPreRoll){
   const match=approvedFlavours.find(f=>f.id===id);
   return match?match.shade:'#8c7a4a';
  }
  return findVariant(id).color;
 };
 let selected=isPreRoll?(root.dataset.initialFlavour||'granddaddy-purple'):findVariant(root.dataset.initialFlavour||new URLSearchParams(location.search).get('flavour')).id;
 let activeFlavourColor=getFlavourColor(selected);`;

if (bv.includes(findVariantOld)) {
  bv = bv.replace(findVariantOld, findVariantNew);
}

// Tube recoloring helper
const recolorPreRollsTube = `
 function applyPreRollColor(hex){
  if(!model||!isPreRoll||!hex)return;
  model.traverse(node=>{
   if(node.isMesh){
    const mats=Array.isArray(node.material)?node.material:[node.material];
    for(const m of mats){
     if(m && (m.name==='Brass tube' || ['StorageTube','TubeCap','Brass storage','Brass lid'].includes(node.name||node.parent?.name))){
      m.color.set(hex);
      m.needsUpdate=true;
     }
    }
   }
  });
 }
`;

if (!bv.includes('function applyPreRollColor(')) {
  bv = bv.replace("function applyPose(p,w){", recolorPreRollsTube + "\n function applyPose(p,w){");
}

// In boot(), loading model:
const modelFetchOld = "fetch(`assets/models/${selected}.glb?v=${revision}`,{signal:request.signal}),fetch(`assets/models/${selected}.json?v=${revision}`,{signal:request.signal})";
const modelFetchNew = "fetch(`assets/models/${isPreRoll?'pre-rolls':selected}.glb?v=${revision}`,{signal:request.signal}),fetch(`assets/models/${isPreRoll?'pre-rolls':selected}.json?v=${revision}`,{signal:request.signal})";
if (bv.includes(modelFetchOld)) {
  bv = bv.replace(modelFetchOld, modelFetchNew);
}

// Atmosphere color in boot:
const atmosOld = "atmosphere=createLiquidAtmosphere(THREE,scene,findVariant(selected).color);";
const atmosNew = "atmosphere=createLiquidAtmosphere(THREE,scene,activeFlavourColor); if(isPreRoll) applyPreRollColor(activeFlavourColor);";
if (bv.includes(atmosOld)) {
  bv = bv.replace(atmosOld, atmosNew);
}

// Poster in info():
const posterOld = "poster.src=`assets/vape-range/${selected}-runway.webp?v=approved-range-20261112`;gesture.textContent=failed?'The product image is still available.':!ready?'Loading 3D...':'Drag to rotate';";
const posterNew = "if(isPreRoll){poster.src='assets/preroll-concept.webp';}else{poster.src=`assets/vape-range/${selected}-runway.webp?v=approved-range-20261112`;}gesture.textContent=failed?'The product image is still available.':!ready?'Loading 3D...':'Drag to rotate';";
if (bv.includes(posterOld)) {
  bv = bv.replace(posterOld, posterNew);
}

// Status text:
const readyStatusOld = "status.textContent=`${findVariant(selected).name} 3D set ready.`;";
const readyStatusNew = "status.textContent=`${isPreRoll?'Pre-rolls':findVariant(selected).name} 3D set ready.`;";
if (bv.includes(readyStatusOld)) {
  bv = bv.replace(readyStatusOld, readyStatusNew);
}

// In select(id):
const selectOld = "function select(id){id=findVariant(id).id;if(id===selected){showStage();return;}selected=id;request?.abort();epoch++;loading=false;failed=false;cancelAnimationFrame(frame);animation=null;signal(false);showStage();boot();}";
const selectNew = `function select(id, colorOverride){
  if(isPreRoll){
   selected=id;
   activeFlavourColor=colorOverride||getFlavourColor(id);
   applyPreRollColor(activeFlavourColor);
   if(atmosphere){
    atmosphere.dispose();
    atmosphere=createLiquidAtmosphere(THREE,scene,activeFlavourColor);
   }
   draw();
   return;
  }
  id=findVariant(id).id;
  if(id===selected){showStage();return;}
  selected=id;
  request?.abort();
  epoch++;
  loading=false;
  failed=false;
  cancelAnimationFrame(frame);
  animation=null;
  signal(false);
  showStage();
  boot();
}`;
if (bv.includes(selectOld)) {
  bv = bv.replace(selectOld, selectNew);
}

// Event listeners for flavour selection:
const eventOld = "scope.on(sceneRoot,'ehf-select-flavour',e=>select(e.detail.id));";
const eventNew = `scope.on(sceneRoot,'ehf-select-flavour',e=>select(e.detail.id, e.detail.color||e.detail.shade));
 scope.on(root,'ehf-select-flavour',e=>select(e.detail.id, e.detail.color||e.detail.shade));
 scope.on(document,'ehf-select-flavour',e=>select(e.detail.id, e.detail.color||e.detail.shade));`;
if (bv.includes(eventOld)) {
  bv = bv.replace(eventOld, eventNew);
}

fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/bar-viewer.js', bv, 'utf8');
console.log('2. Updated bar-viewer.js successfully');

// --- 3. BUMP CACHE BUSTERS ---
const ts = Date.now().toString(36);
let app = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/app.js', 'utf8');
app = app.replace(/model-viewer\.js\?v=[^']+/g, `model-viewer.js?v=disassemble_${ts}`);
fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/app.js', app, 'utf8');
console.log('3. Bumped model-viewer cache buster in app.js');

let pr = fs.readFileSync('c:/Tasks/exclusivehempfarms/public/pre-rolls-detail.html', 'utf8');
pr = pr.replace(/app\.js\?v=[^"]+/g, `app.js?v=app_${ts}`);
fs.writeFileSync('c:/Tasks/exclusivehempfarms/public/pre-rolls-detail.html', pr, 'utf8');
console.log('4. Bumped app.js cache buster in pre-rolls-detail.html');
