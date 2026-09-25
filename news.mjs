import {relevance} from './relevance.mjs';
export const AREA_ALIASES = {
 'Baner':['baner','बाणेर'],'Balewadi':['balewadi','बालेवाडी'],'Aundh':['aundh','औंध'],
 'Wakad':['wakad','वाकड'],'Hinjewadi':['hinjewadi','hinjawadi','हिंजवडी'],
 'Kothrud':['kothrud','कोथरूड'],'Shivajinagar':['shivajinagar','shivaji nagar','शिवाजीनगर'],
 'Hadapsar':['hadapsar','हडपसर'],'Kharadi':['kharadi','खराडी'],'Viman Nagar':['viman nagar','विमाननगर'],
 'Koregaon Park':['koregaon park','कोरेगाव पार्क'],'Kalyani Nagar':['kalyani nagar','कल्याणीनगर'],
 'Kondhwa':['kondhwa','कोंढवा'],'Warje':['warje','वारजे'],'Swargate':['swargate','स्वारगेट'],
 'Pimpri':['pimpri','पिंपरी'],'Chinchwad':['chinchwad','चिंचवड'],'Nigdi':['nigdi','निगडी'],
 'Bhosari':['bhosari','भोसरी'],'Ravet':['ravet','रावेत'],'Moshi':['moshi','मोशी'],
 'Lohegaon':['lohegaon','लोहगाव'],'Yerawada':['yerawada','yerwada','येरवडा'],'Camp':['pune camp','pune cantonment','पुणे कॅम्प'],
};
export const clean = value => typeof value === 'string' ? value.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim() : '';
export function safeUrl(value) {try {const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return null;const h=u.hostname.toLowerCase();if(h==='localhost'||h==='::1'||h.startsWith('[')||/^\d+\.\d+\.\d+\.\d+$/.test(h)||!h.includes('.'))return null;return u.href;}catch{return null;}}
export function locate(title,excerpt='') {
 const t=clean(title+' '+excerpt).toLowerCase();const matched=Object.entries(AREA_ALIASES).filter(([,aliases])=>aliases.some(a=>new RegExp('(^|[^\\p{L}\\p{N}])'+a+'(?=$|[^\\p{L}\\p{N}])','iu').test(t))).map(([name])=>name);
 return matched.length?matched:['Pune · area unspecified'];
}
export const dayIST=iso=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso));
export function rangeStart(now,days=3){const today=dayIST(now);return Date.parse(today+'T00:00:00+05:30')-(days-1)*86400000;}
export function parseDate(value){if(typeof value!=='string'||!value.trim())return null;const normalized=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)?value.replace(' ','T')+'Z':value;const d=new Date(normalized);return Number.isFinite(d.getTime())?d.toISOString():null;}
export function normalize(item,now=Date.now(),broader=false){
 const title=clean(item.title),excerpt=clean(item.description).slice(0,900),url=safeUrl(item.link),pubDate=parseDate(item.pubDate);
 if(!title||!url||!pubDate||Date.parse(pubDate)>now+300000||Date.parse(pubDate)<rangeStart(now))return null;
 const locations=locate(title,excerpt);
 const impact=relevance(title,excerpt,locations[0]!=='Pune · area unspecified');
 if(!impact||(!broader&&impact.scope!=='Pune'))return null;
 if(/\b(sponsored|press release|advertorial)\b/i.test((item.category||[]).join(' ')))return null;
 const u=new URL(url);for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(key))u.searchParams.delete(key);u.hash='';
 const category=(item.category||[])[0]||'general';
 return {id:item.article_id||u.href,title,excerpt,url:u.href,imageUrl:safeUrl(item.image_url),source:clean(item.source_name||item.source_id)||u.hostname,pubDate,areas:impact.scope==='Pune'?locations:[impact.scope],...impact,category:category.charAt(0).toUpperCase()+category.slice(1),language:clean(item.language)};
}
export function selectStories(all,{area='All Pune',category='All',search='',period='smart',sort='latest'}={},now=Date.now()){
 const today=dayIST(now);let list=all.filter(s=>Date.parse(s.pubDate)>=rangeStart(now)&&Date.parse(s.pubDate)<=now+300000);
 const unique=new Set();list.sort((a,b)=>Date.parse(b.pubDate)-Date.parse(a.pubDate));list=list.filter(s=>{const k=s.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();if(unique.has(k))return false;unique.add(k);return true;});
 const areaCounts=[{name:'All Pune',count:list.length},...Object.keys(AREA_ALIASES).sort().map(name=>({name,count:list.filter(s=>s.areas.includes(name)).length})),...['Pune · area unspecified','Maharashtra','National impact'].map(name=>({name,count:list.filter(s=>s.areas.includes(name)).length}))];
 const categories=[...new Set(list.map(s=>s.category))].sort();
 if(area!=='All Pune')list=list.filter(s=>s.areas.includes(area));
 if(category!=='All')list=list.filter(s=>s.category===category);
 if(search.trim()){const q=search.trim().toLowerCase().slice(0,150);list=list.filter(s=>(s.title+' '+s.excerpt+' '+s.source).toLowerCase().includes(q));}
 const todayCount=list.filter(s=>dayIST(s.pubDate)===today).length;
 const showingPreviousDays=['3d','3days','all','three-days'].includes(period)||(period==='smart'&&todayCount<6);
 if(!showingPreviousDays)list=list.filter(s=>dayIST(s.pubDate)===today);
 list.sort((a,b)=>(sort==='impact'?(b.importance||0)-(a.importance||0):0)||Date.parse(b.pubDate)-Date.parse(a.pubDate));
 const seen=new Set();list=list.filter(s=>{const key=s.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();if(seen.has(key))return false;seen.add(key);return true;});
 return{stories:list,areas:areaCounts,categories,meta:{todayCount,totalCount:list.length,showingPreviousDays,windowStart:new Date(rangeStart(now)).toISOString()}};
}
