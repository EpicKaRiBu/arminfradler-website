// Erzeugt data/weltkarte.json (Welt + Europa-Lupe). Aufruf im Repo-Ordner: npm i d3-geo topojson-client world-atlas && node tools/weltkarte.mjs
import {geoEqualEarth,geoAzimuthalEqualArea,geoPath,geoCentroid} from 'd3-geo';
import {feature} from 'topojson-client';
import fs from 'fs';
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const topo110=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const land=feature(topo110,topo110.objects.land), countries=feature(topo110,topo110.objects.countries);
const landE=feature(topo,topo.objects.land), countriesE=feature(topo,topo.objects.countries);
const W=1000,H=500;
const proj=geoEqualEarth().rotate([-12,0]).fitExtent([[8,8],[W-8,H-8]],{type:'Sphere'});
const path=geoPath(proj).digits(1);
const want={at:'040',de:'276',ch:'756',us:'840',uk:'826',dk:'208',no:'578',kr:'410',pl:'616',tr:'792',nl:'528',fr:'250',ca:'124',be:'056',cn:'156',ng:'566',ee:'233',al:'008'};
const EU=new Set(['at','de','ch','uk','dk','no','pl','tr','nl','fr','be','ee','al']);
// Lupe über Europa
const IC=[805,345],IR=148;
const ip=geoAzimuthalEqualArea().rotate([-14,-50]).clipAngle(17).translate(IC).scale(IR/ (2*Math.sin(17*Math.PI/360)));
const ipath=geoPath(ip).digits(1);
const out={w:W,h:H,land:path(land),sphere:path({type:'Sphere'}),laender:{},lupe:{c:IC,r:IR,land:ipath(landE),laender:{}}};
for(const [k,id] of Object.entries(want)){
  const f=countries.features.find(c=>c.id===id); if(f&&!EU.has(k)) out.laender[k]={d:path(f),c:proj(geoCentroid(f)).map(v=>+v.toFixed(1))};
  const fe=countriesE.features.find(c=>c.id===id); if(fe&&EU.has(k)){out.lupe.laender[k]={d:ipath(fe),c:ip(geoCentroid(fe)).map(v=>+v.toFixed(1))};}
}
const fix=(k,ll)=>{out.lupe.laender[k].c=ip(ll).map(v=>+v.toFixed(1))};
fix('fr',[2.5,46.8]);fix('no',[9.5,61]);fix('uk',[-1.8,52.8]);fix('tr',[32,39.2]);fix('at',[14.3,47.6]);
out.laender.us.c=proj([-98,39]).map(v=>+v.toFixed(1));
out.lupe.eu=ip([4.35,50.85]).map(v=>+v.toFixed(1));
out.europa=proj([12,50]).map(v=>+v.toFixed(1));
out.intl=proj([-32,-8]).map(v=>+v.toFixed(1));
fs.writeFileSync('data/weltkarte.json',JSON.stringify(out));
console.log(fs.statSync('data/weltkarte.json').size, out.lupe.laender.at.c, out.europa);
