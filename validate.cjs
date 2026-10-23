const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,D=JSON.parse(fs.readFileSync(path.join(root,'guide-data.json'),'utf8'));
const E=require('./speed-engine.js'),P=require('./drop-engine.js');
assert.equal(D.materials.length,22);assert.equal(D.materials.filter(x=>x.kind==='drop').length,19);assert.equal(new Set(D.materials.map(x=>x.id)).size,22);
const four=D.materials.filter(x=>x.chance===.04).map(x=>x.id).sort();assert.deepEqual(four,['story-ore','story-fox-tail','story-old-scale','story-heartwood','story-echo'].sort());
assert.equal(D.materials.find(x=>x.id==='story-ovule').chance,1);assert.equal(D.materials.find(x=>x.id==='story-heartwood').qty,4);assert.equal(D.materials.find(x=>x.id==='story-key2').floor,5);
for(const x of D.materials){if(x.kind==='drop'){assert(x.chance>0&&x.chance<=1);assert(x.locations.length>0);assert(x.step>0);assert.equal(x.timeline[x.step-1],`收集 ${x.name} ×${x.qty}`)}else assert.equal(x.chance,null)}
assert.equal(D.bosses.length,40);for(const b of D.bosses){assert.equal(b.drops.filter(x=>x.pooled).length,3);assert(b.drops.every(x=>D.equipment.some(e=>e.id===x.itemId)));assert(b.drops.filter(x=>x.pooled).every(x=>x.chance===.08));}
assert.equal(D.equipment.length,466);assert.equal(D.equipment.filter(x=>x.weaponType).length,188);assert.equal(D.equipment.filter(x=>x.shield).length,50);
assert.equal(E.speed(165,.9),259);assert.equal(E.result('rapier',125,1).normal,376);assert.equal(E.result('rapier',125,1).boosted,141);assert.equal(E.result('rapier',125,.9).boosted,172);
let count=0;for(let w=1;w<=250;w++)for(const c of E.configs)for(const buff of [1,E.buff(c.style)]){const m=w/100*E.factor(c)*buff,a=E.minimum(m);if(a!==null){assert.equal(E.speed(a,m),500);if(a>0)assert(E.speed(a-1,m)<500)}else assert(E.limit(m)<500);count++}
assert.equal(P.probabilityAtLeast(0,1,.04),0);assert.equal(P.probabilityAtLeast(3,5,.3),0);assert.equal(P.probabilityAtLeast(1,1,1),1);assert(Math.abs(P.probabilityAtLeast(1,1,.04)-.04)<1e-12);assert(Math.abs(P.probabilityAtLeast(2,1,.5)-.75)<1e-12);assert(Math.abs(P.probabilityAtLeast(4,2,.5)-.6875)<1e-12);assert(Math.abs(P.probabilityAtLeast(5,5,.5)-.03125)<1e-12);
const browser=fs.readFileSync(path.join(root,'data.js'),'utf8');assert.equal(browser,'window.SAO_GUIDE = '+JSON.stringify(D)+';\n');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const ref of [...html.matchAll(/(?:src|href)="([^"#?:]+\.(?:js|css|svg))"/g)].map(x=>x[1]))assert(fs.existsSync(path.join(root,ref)),`Missing ${ref}`);
assert(fs.existsSync(path.join(root,'.nojekyll')));console.log(JSON.stringify({status:'passed',materials:22,bosses:40,equipment:466,attackSpeedThresholds:count,probabilityChecks:7}));
