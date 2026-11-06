/* Native option presentation. Never invent clubs, IDs, names or asset URLs. */
((root) => {
  'use strict';
  const plain = value => typeof value === 'string' ? value.trim().slice(0,180) : '';
  function resolvedName(value) {
    const label=plain(value).normalize('NFKC').replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,'').trim();
    const key=label.replace(/^[*^?!\s]+|[*^?!\s]+$/g,'');
    // hasLocalizationString in EA's own source compares against '*' + key.
    if(!label||/^(undefined|null)$/i.test(label)||/[\u0000-\u001f\u007f-\u009f\ufffd]/.test(label))return '';
    return /^(?:global|search(?:filters)?|roles|extendedPlayerInfo|rarity|itemRarity|text|controlbar|notification|onboarding|navbar?)\.[\w.-]+$/i.test(key)?'':label;
  }
  function identity(entry) {
    const id=Number(entry.id);
    return JSON.stringify([Number.isSafeInteger(id)?id:String(entry.id),String(entry.value)]);
  }
  function assetUrl(value, base) {
    try {
      if(typeof value!=='string'||!value.trim())return '';
      const u=new URL(value,base);
      return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';
    }catch{return '';}
  }
  function present(entries, {kind,base,getMetadata=()=>null,getIcon=()=>'',getFallbackImage=()=>'',getExtraImages=()=>[],getAlternateName=()=>''}) {
    const rows=new Map();
    let duplicates=0;
    entries.forEach((entry,index)=>{
      const meta=getMetadata(entry)||{};
      const label=resolvedName(entry.label)||resolvedName(meta.name)||resolvedName(getAlternateName(entry));
      const labelSource=resolvedName(entry.label)?'ea-option':resolvedName(meta.name)?'ea-config':label?'ea-localization':'missing';
      const id=Number(entry.id);
      const icons=[['ea-icon-table',getIcon(entry)],['ea-filter-image',getFallbackImage(entry)],...getExtraImages(entry).map(url=>['ea-asset-function',url])];
      const images=[];
      for(const [source,value] of icons){const url=assetUrl(value,base);if(url&&!images.some(x=>x.url===url))images.push({url,source});}
      const option={index,id:Number.isSafeInteger(id)?id:null,label:label||`EA ${kind} #${entry.id}`,
        labelSource,unresolved:!label,images,image:images[0]?.url||'',source:'ea-native',
        leagueId:Number.isSafeInteger(meta.leagueId)?meta.leagueId:null,leagueLabel:resolvedName(meta.leagueLabel)};
      const key=identity(entry),previous=rows.get(key);
      if(previous){duplicates++;if(previous.unresolved&&!option.unresolved)rows.set(key,option);}
      else rows.set(key,option);
    });
    const options=[...rows.values()];
    return {options,meta:{source:'ea-native',rawCount:entries.length,uniqueCount:options.length,duplicatesRemoved:duplicates,
      unresolvedNames:options.filter(x=>x.unresolved).length,withoutImageUrl:options.filter(x=>!x.images.length).length,
      nameGroups:kind==='club'?groups(options.filter(x=>!x.unresolved)).length:null}};
  }
  function groups(options) {
    const map=new Map();
    for(const option of options){
      const key=option.unresolved?'id:'+option.index:'name:'+option.label.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
      if(!map.has(key))map.set(key,{label:option.label,options:[]});
      map.get(key).options.push(option);
    }
    return [...map.values()];
  }
  const api=Object.freeze({present,resolvedName,identity,assetUrl,groups});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CodexEAOptions=api;
})(globalThis);
