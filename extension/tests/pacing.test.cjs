const assert=require('node:assert/strict');
const {randomInterval}=require('../snipe-core.js');
assert.equal(randomInterval(1000,3000,()=>0),1000);
assert.equal(randomInterval(1000,3000,()=>0.999999),3000);
assert.equal(randomInterval(1300,2600,()=>0.5),1950);
assert.equal(randomInterval(600,5000,()=>0),600);
assert.throws(()=>randomInterval(5000,1000),/range/);
assert.throws(()=>randomInterval(1000,3000,()=>-1),/sample/);
console.log('PASS: paced interval range tests');
