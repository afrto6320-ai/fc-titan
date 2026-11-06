const test=require('node:test');
const assert=require('node:assert/strict');
const {present,resolvedName,groups}=require('../ea-options.js');
const base='https://www.ea.com/ea-sports-fc/ultimate-team/web-app/';
test('native identities deduplicate without merging different clubs with the same name',()=>{
  const entries=[{id:1,value:'1',label:'FC Köln'},{id:1,value:'1',label:'FC Köln'},
    {id:2,value:'2',label:'FC Köln'},{id:3,value:'3',label:'global.teamabbr15.2027.team3*'}];
  const r=present(entries,{kind:'club',base});
  assert.equal(r.options.length,3);assert.equal(r.meta.duplicatesRemoved,1);
  assert.deepEqual(r.options.map(x=>x.index),[0,2,3]);
  assert.equal(r.options[2].unresolved,true);assert.equal(r.meta.unresolvedNames,1);
  assert.equal(r.options[2].label,'EA club #3');
  assert.equal(r.options[0].source,'ea-native');
});
test('resolved duplicate wins and preserves the original EA selection index',()=>{
  const r=present([{id:1,value:1,label:'global.teamabbr15.2027.team1*'},
    {id:1,value:'1',label:'Liverpool'}],{kind:'club',base});
  assert.equal(r.options.length,1);assert.equal(r.options[0].index,1);
  assert.equal(r.options[0].label,'Liverpool');
});
test('names and alternate images come only from supplied native providers',()=>{
  const r=present([{id:4,value:'4',label:'global.teamabbr15.2027.team4*'}],{kind:'club',base,
    getMetadata:()=>({name:'Native club name',leagueId:13,leagueLabel:'Premier League'}),
    getIcon:()=>'/images/native-badge.png',getFallbackImage:()=>'/images/native-fallback.png'});
  assert.equal(r.options[0].labelSource,'ea-config');assert.equal(r.options[0].leagueId,13);
  assert.deepEqual(r.options[0].images.map(x=>x.source),['ea-icon-table','ea-filter-image']);
  assert.equal(r.options[0].image,'https://www.ea.com/images/native-badge.png');
  const unsafe=present([{id:5,value:'5',label:'Arsenal'}],{kind:'club',base,
    getIcon:()=> 'javascript:alert(1)',getFallbackImage:()=> 'https://user:pass@example.com/img.png'});
  assert.deepEqual(unsafe.options[0].images,[]);
  assert.equal(resolvedName('global.teamabbr15.2027.team131541*'),'');
  assert.equal(resolvedName('D.C. United'),'D.C. United');
});
test('EA leading missing-translation marker and RTL formatting never become club names',()=>{
  for(const s of ['*global.teamabbr15.2027.team131541','\u200f*global.teamabbr15.2027.team131541\u200e',
    'global.teamabbr15.2027.team131541*','global.teamabbr15.2027.team131541^','null','undefined'])assert.equal(resolvedName(s),'');
  assert.equal(resolvedName('1. FC Köln'),'1. FC Köln');
  const r=present([{id:31,value:'31',label:'1. FC Köln'},{id:116000,value:'116000',label:'1. FC Köln'}],{kind:'club',base});
  const grouped=groups(r.options);assert.equal(grouped.length,1);assert.equal(grouped[0].options.length,2);
  assert.deepEqual(grouped[0].options.map(x=>x.id),[31,116000]);
});
