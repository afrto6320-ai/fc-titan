/* Native option presentation. Never invent clubs, IDs, names or asset URLs. */
((root) => {
  'use strict';
  const plain = value => typeof value === 'string' ? value.trim().slice(0,180) : '';
  function resolvedName(value) {
    const label=plain(value);
    // EA returns the translation key (sometimes with a trailing *) when localization is absent.
    return label && !/^[a-z][\w-]*(?:\.[\w-]+){2,}\*?$/i.test(label) ? label : '';
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
  function present(entries, {kind,base,getMetadata=()=>null,getIcon=()=>'',getFallbackImage=()=>'',getAlternateName=()=>''}) {
    const rows=new Map();
    let duplicates=0;
    entries.forEach((entry,index)=>{
      const meta=getMetadata(entry)||{};
      const label=resolvedName(entry.label)||resolvedName(meta.name)||resolvedName(getAlternateName(entry));
      const labelSource=resolvedName(entry.label)?'ea-option':resolvedName(meta.name)?'ea-config':label?'ea-localization':'missing';
      const id=Number(entry.id);
      const icons=[['ea-icon-table',getIcon(entry)],['ea-filter-image',getFallbackImage(entry)]];
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
      unresolvedNames:options.filter(x=>x.unresolved).length,withoutImageUrl:options.filter(x=>!x.images.length).length}};
  }
  const api=Object.freeze({present,resolvedName,identity,assetUrl});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CodexEAOptions=api;
})(globalThis);
