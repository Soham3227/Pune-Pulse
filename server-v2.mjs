import {createServer} from 'node:http';
import {readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {normalize,selectStories,dayIST} from './news.mjs';
import {organize,CATEGORIES} from './categories.mjs';
import {collectNewsAPI} from './newsapi.mjs';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
try{process.loadEnvFile('.env');}catch{}
const KEY=process.env.NEWSDATA_API_KEY||'';
const INDIA_KEY=process.env.NEWSAPI_API_KEY||'';
const PORT=4317, INTERVAL=6*3600000, MIN_REFRESH=30*60000;
mkdirSync('data',{recursive:true});
const db=new DatabaseSync('data/news-v2.db');
db.exec(`CREATE TABLE IF NOT EXISTS news (url TEXT PRIMARY KEY,id TEXT,published TEXT NOT NULL,payload TEXT NOT NULL);CREATE INDEX IF NOT EXISTS news_published ON news(published);CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL)`);
const get=k=>{const row=db.prepare('SELECT value FROM metadata WHERE key=?').get(k);return row?JSON.parse(row.value):null;};
const put=(k,v)=>db.prepare('INSERT INTO metadata VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k,JSON.stringify(v));
const upsert=db.prepare('INSERT INTO news VALUES(?,?,?,?) ON CONFLICT(url) DO UPDATE SET id=excluded.id,published=excluded.published,payload=excluded.payload');
let working=null;
const redact=s=>String(s||'Connection failed').replaceAll(KEY||'__NO_KEY__','[redacted]').replaceAll(INDIA_KEY||'__NO_INDIA_KEY__','[redacted]').slice(0,250);
async function fetchPage(page){
 const day=dayIST(Date.now()),quota=get('quota')||{day,calls:0};if(quota.day!==day){quota.day=day;quota.calls=0;}if(quota.calls>=80)throw Error('Daily request budget reached; collection resumes tomorrow');
 const u=new URL('https://newsdata.io/api/1/latest');u.searchParams.set('apikey',KEY);u.searchParams.set('q','Pune OR Pimpri OR Chinchwad OR पुणे OR पिंपरी OR चिंचवड');u.searchParams.set('country','in');u.searchParams.set('language','en,mr');if(page)u.searchParams.set('page',page);
 const response=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(30000),headers:{Accept:'application/json'}});
 quota.calls++;put('quota',quota);
 const text=await response.text();if(text.length>4e6)throw Error('Provider response too large');let data;try{data=JSON.parse(text);}catch{throw Error('News provider returned an unreadable response');}
 if(!response.ok||data.status!=='success')throw Error('NewsData: '+redact(data.results?.message||data.message||'HTTP '+response.status));
 if(!Array.isArray(data.results))throw Error('Unexpected provider response');return data;
}
async function refresh(manual=false){
 if(working)return working;if(!KEY&&!INDIA_KEY)return{ok:false,error:'News providers are not configured'};
 const last=get('lastAttempt');if(last&&(!INDIA_KEY||get('newsapiAttempt'))&&Date.now()-Date.parse(last)<(get('error')?(manual?60000:15*60000):manual?MIN_REFRESH:INTERVAL))return{ok:true,skipped:true};
 working=(async()=>{put('lastAttempt',new Date().toISOString());let count=0;const errors=[];let succeeded=0;
 const save=story=>{upsert.run(story.url,String(story.id),story.pubDate,JSON.stringify(story));count++;};
 try{
 if(KEY){try{let page;for(let i=0;i<5;i++){const data=await fetchPage(page);for(const raw of data.results){const story=normalize(raw);if(story)save({...story,provider:'NewsData'});}if(!data.nextPage)break;page=data.nextPage;}succeeded++;put('newsdataSuccess',new Date().toISOString());}catch(e){errors.push(redact(e.message==='fetch failed'?'NewsData connection failed':e.message));}}
 if(INDIA_KEY){try{put('newsapiAttempt',new Date().toISOString());const result=await collectNewsAPI({key:INDIA_KEY,get,put});for(const story of result.stories)save(story);succeeded++;put('newsapiSuccess',new Date().toISOString());}catch(e){errors.push(redact(e.message==='fetch failed'?'NewsAPI connection failed':e.message));}}
 if(succeeded)put('lastSuccess',new Date().toISOString());put('error',errors.length?errors.join('; '):null);
 db.prepare('DELETE FROM news WHERE published < ?').run(new Date(Date.now()-7*86400000).toISOString());
 return{ok:!errors.length,count,partial:succeeded>0&&errors.length>0,error:errors.join('; ')||null};
 }finally{working=null;}})();return working;
}

function snapshot(params){const all=db.prepare('SELECT payload FROM news ORDER BY published DESC').all().map(r=>JSON.parse(r.payload));let out=selectStories(all,Object.fromEntries(params));if(params.get('view')==='dashboard'){const group=organize(out.stories,{category:params.get('section')||'All',sort:params.get('sort')||'impact'});out={...out,...group,categories:CATEGORIES,meta:{...out.meta,totalCount:group.totalCount,displayedCount:group.stories.length,hasMore:group.hasMore}};}const lastSuccess=get('lastSuccess'),lastAttempt=get('lastAttempt'),error=get('error');return{...out,meta:{...out.meta,lastSuccess,lastAttempt,nextRefresh:lastAttempt?new Date(Date.parse(lastAttempt)+(error?15*60000:INTERVAL)).toISOString():null,status:!KEY&&!INDIA_KEY?'not-configured':error?'error':lastSuccess?'live':'loading',error,apiConfigured:Boolean(KEY||INDIA_KEY),providers:{newsdata:{configured:Boolean(KEY),lastSuccess:get('newsdataSuccess')},newsapi:{configured:Boolean(INDIA_KEY),lastSuccess:get('newsapiSuccess')}},coverageNote:'Collection runs every 6 hours while this app is running. Free providers may delay coverage; NewsAPI Developer articles are delayed 24 hours and are for development only. Sparse days include the previous two days of saved reports. Relevance is based on headline and summary text, not independent verification.'}};}
const files={'/assets/pune-hero.jpg':['public/assets/pune-hero.jpg','image/jpeg'],'/':['public/index.html','text/html; charset=utf-8'],'/index.html':['public/index.html','text/html; charset=utf-8'],'/app.js':['public/app.js','text/javascript; charset=utf-8'],'/style.css':['public/style.css','text/css; charset=utf-8']};
const server=createServer(async(req,res)=>{
 const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(!['127.0.0.1:'+PORT,'localhost:'+PORT].includes(req.headers.host))return send(403,{error:'Invalid host'});
 if(req.method!=='GET'&&req.headers.origin&&!['http://127.0.0.1:'+PORT,'http://localhost:'+PORT].includes(req.headers.origin))return send(403,{error:'Cross-origin request rejected'});
 try{const url=new URL(req.url,'http://127.0.0.1:'+PORT);
 if(req.method==='GET'&&files[url.pathname]){const [path,type]=files[url.pathname];res.writeHead(200,{'Content-Type':type});return res.end(readFileSync(path));}
 if(req.method==='GET'&&url.pathname==='/api/health')return send(200,{ok:true,version:2});
 if(req.method==='GET'&&url.pathname==='/api/stories')return send(200,snapshot(url.searchParams));
 if(req.method==='POST'&&url.pathname==='/api/refresh'){let size=0;for await(const c of req){size+=c.length;if(size>16384)return send(413,{error:'Body too large'});}return send(200,await refresh(true));}
 return send(404,{error:'Not found'});
 }catch{return send(500,{error:'Unable to complete request'});}
});
if(process.argv.includes('--refresh-only')){const result=await refresh();console.log(JSON.stringify(result));db.close();}
else{server.listen(PORT,'127.0.0.1',()=>{console.log('Pune Pulse: http://127.0.0.1:'+PORT);void refresh();});setInterval(()=>void refresh(),60000).unref();}

