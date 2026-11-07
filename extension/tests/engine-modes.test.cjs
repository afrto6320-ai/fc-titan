const test=require('node:test'),assert=require('node:assert/strict');const modes=require('../engine-modes.js');
test('manual count remains unrestricted; only Pharaoh/Deep sniping uses the first native page',()=>{
 for(const id of ['codex','pharaoh','deep','enhancer'])assert.equal(modes.query(id,'scan').firstPageOnly,false);
 assert.equal(modes.query('pharaoh','snipe').firstPageOnly,true);assert.equal(modes.query('deep','snipe').firstPageOnly,true);
 assert.equal(modes.query('enhancer','snipe').firstPageOnly,false);assert.throws(()=>modes.get('fake'));assert.throws(()=>modes.query('codex','invalid'));
});
test('deduplicate auction IDs, retain distinct auctions of the same player and do not mutate prices or input order',()=>{
 const a={tradeId:'a',playerId:1,price:900},b={tradeId:'b',playerId:1,price:700};const source=[a,b,{...a}];
 assert.deepEqual(modes.order(source,'pharaoh').map(x=>x.tradeId),['a','b']);
 assert.deepEqual(modes.order(source,'enhancer').map(x=>x.tradeId),['b','a']);assert.equal(source.length,3);assert.equal(a.price,900);
});
test('Deep reference ranking uses a fresh exact edition, with market reference or price fallback',()=>{
 const rows=[{tradeId:'cheap',itemId:1,price:700,marketAverage:800},{tradeId:'return',itemId:2,price:900,marketAverage:2000}];
 assert.equal(modes.order(rows,'deep')[0].tradeId,'return');
 assert.equal(modes.order(rows,'deep',{itemId:1,price:3000,retrievedAt:100},100)[0].tradeId,'cheap');
 assert.equal(modes.order(rows,'deep',{itemId:1,price:3000,retrievedAt:100},90101)[0].tradeId,'return');
 assert.equal(modes.order(rows.map(x=>({...x,marketAverage:null})),'deep')[0].tradeId,'cheap');
});
test('bounded delay, cycle anchor and purchase route are explicit and immutable',()=>{
 assert.equal(modes.delay('deep',0),180);assert.equal(modes.delay('deep',1),320);assert.equal(modes.delay('pharaoh'),0);
 assert.equal(modes.get('pharaoh').purchase,'service');assert.equal(modes.get('codex').purchase,'action');
 assert.equal(modes.get('deep').waitFrom,'end');assert.equal(modes.get('codex').waitFrom,'start');assert.ok(Object.isFrozen(modes.get('deep')));
});
