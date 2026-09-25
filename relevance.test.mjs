import test from 'node:test';
import assert from 'node:assert/strict';
import {relevance} from './relevance.mjs';
import {normalize,selectStories} from './news.mjs';
import {collectNewsAPI} from './newsapi.mjs';
const now=Date.parse('2026-09-23T12:00:00Z');
test('National coverage requires a concrete decision, actor and applicable topic',()=>{
 assert.equal(relevance('RBI cuts repo rate; loans may become cheaper').scope,'National impact');
 assert.equal(relevance('India celebrates a cricket win'),null);
 assert.equal(relevance('Analysts predict future interest rates'),null);
 assert.equal(relevance('US central bank cuts interest rates'),null);
 assert.equal(relevance('Maharashtra announces school closures').scope,'Maharashtra');
 assert.equal(relevance('Pune metro services resume').scope,'Pune');
});
test('Regional stories never get assigned to a Pune neighbourhood',()=>{
 const raw={title:'Maharashtra announces new education policy',description:'Statewide changes',link:'https://example.com/report',pubDate:'2026-09-23T10:00:00Z'};
 assert.equal(normalize(raw,now),null);
 const s=normalize(raw,now,true);assert.deepEqual(s.areas,['Maharashtra']);
 assert.equal(selectStories([s],{area:'Baner',period:'3d'},now).stories.length,0);
 assert.equal(selectStories([s],{area:'Maharashtra'},now).stories.length,1);
});
test('NewsAPI sends credentials only in headers, filters unrelated reports and enforces budget',async()=>{
 const state={};let calls=0;
 const args={key:'test-secret',get:k=>state[k],put:(k,v)=>state[k]=v,now,fetcher:async(url,options)=>{
  calls++;assert.equal(url.hostname,'newsapi.org');assert.equal(url.searchParams.has('apiKey'),false);assert.equal(options.headers['X-Api-Key'],'test-secret');
  return new Response(JSON.stringify({status:'ok',articles:[{title:'Pune water supply alert',description:'Maintenance',url:'https://example.com/water',publishedAt:'2026-09-23T10:00:00Z',source:{name:'Example'}},{title:'Hollywood movie review',url:'https://example.com/film',publishedAt:'2026-09-23T10:00:00Z'}]}));
 }};
 const result=await collectNewsAPI(args);assert.equal(calls,2);assert.equal(result.stories.length,2);assert.equal(result.stories[0].provider,'NewsAPI');
 state.newsapiQuota.calls=40;await assert.rejects(collectNewsAPI(args),/budget/);
});
test('Provider errors do not echo provider response messages or credentials',async()=>{
 await assert.rejects(collectNewsAPI({key:'secret',get:()=>null,put:()=>{},now,fetcher:async()=>new Response(JSON.stringify({status:'error',code:'apiKeyInvalid',message:'secret'}),{status:401})}),e=>e.message==='NewsAPI: apiKeyInvalid');
});
test('Duplicate headlines do not inflate counts or suppress sparse-day fallback',()=>{
 const today={title:'Pune metro update',pubDate:'2026-09-23T10:00:00Z',areas:['Baner'],category:'Transport'};
 const yesterday={...today,title:'Pune water update',pubDate:'2026-09-22T10:00:00Z'};
 const result=selectStories([...Array(6).fill(today),yesterday],{},now);
 assert.equal(result.meta.todayCount,1);assert.equal(result.meta.showingPreviousDays,true);
 assert.equal(result.stories.length,2);assert.equal(result.areas[0].count,2);
});
