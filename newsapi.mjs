import {normalize,dayIST,rangeStart} from './news.mjs';
export async function collectNewsAPI({key,get,put,fetcher=fetch,now=Date.now()}) {
 if(!key)return {configured:false,count:0,stories:[]};
 const day=dayIST(now),quota=get('newsapiQuota')||{day,calls:0};
 if(quota.day!==day){quota.day=day;quota.calls=0;}
 const stories=[];
 // One regional query and one narrow national-policy query. No fabricated relevance.
 for(const q of ['Pune OR Pimpri OR Chinchwad OR Maharashtra','(India OR RBI OR "GST council") AND ("repo rate" OR "income tax" OR "fuel prices" OR "education policy" OR "minimum wage")']){
  if(quota.calls>=40)throw Error('NewsAPI daily request budget reached');
  const url=new URL('https://newsapi.org/v2/everything');
  for(const [k,v] of Object.entries({q,searchIn:'title,description',from:new Date(rangeStart(now)).toISOString(),sortBy:'publishedAt',language:'en',pageSize:'100'}))url.searchParams.set(k,v);
  quota.calls++;put('newsapiQuota',quota);
  const response=await fetcher(url,{headers:{'X-Api-Key':key,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(30000)});
  const raw=await response.text();if(raw.length>4e6)throw Error('NewsAPI response too large');
  let data;try{data=JSON.parse(raw);}catch{throw Error('NewsAPI returned an unreadable response');}
  if(!response.ok||data.status!=='ok')throw Error('NewsAPI: '+String(data.code||'HTTP '+response.status));
  if(!Array.isArray(data.articles))throw Error('NewsAPI returned an unexpected response');
  for(const a of data.articles){
   if(a.title==='[Removed]')continue;
   const story=normalize({title:a.title,description:a.description,link:a.url,image_url:a.urlToImage,pubDate:a.publishedAt,source_name:a.source?.name,category:['general'],language:'english'},now,true);
   if(story)stories.push({...story,provider:'NewsAPI'});
  }
 }
 return {configured:true,count:stories.length,stories};
}
