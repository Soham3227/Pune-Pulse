import {priorityScore} from './ranking.mjs';
export const CATEGORIES = [
  'Pune Local',
  'Crime & Safety',
  'Traffic',
  'Politics',
  'Business',
  'Education',
  'Sports',
  'Weather',
  'Entertainment'
];

const KEYWORDS = {
  'Weather': [
    'rain', 'rainfall', 'monsoon', 'storm', 'cyclone', 'flood', 'flooding', 'waterlogging',
    'temperature', 'heatwave', 'cold wave', 'humidity', 'imd', 'weather alert', 'orange alert',
    'red alert', 'yellow alert', 'thunderstorm', 'hailstorm', 'drought', 'cloudburst',
    'पावस', 'पाऊस', 'मूसलाधार', 'पूर', 'पूरस्थिती', 'तापमान', 'उष्णता', 'शीतलहर',
    'आंधी', 'तूफान', 'मेघगर्जना', 'कडक', 'हिमपात', 'दुष्काल', 'हवामान', 'चेतावनी'
  ],
  'Crime & Safety': [
    'murder', 'killing', 'stabbing', 'shooting', 'assault', 'robbery', 'theft', 'burglary',
    'kidnapping', 'abduction', 'rape', 'molestation', 'harassment', 'domestic violence',
    'accident', 'crash', 'collision', 'hit and run', 'fire', 'blaze', 'explosion',
    'building collapse', 'drowning', 'suicide', 'poisoning', 'overdose', 'arrest',
    'police', 'fir', 'case registered', 'investigation', 'custody', 'bail', 'court',
    'convict', 'sentence', 'prison', 'jail', 'gang', 'mafia', 'extortion', 'blackmail',
    'हत्या', 'खून', 'चोरी', 'डकैती', 'अपहरण', 'बलात्कार', 'छेडखानी', 'उत्पीडन',
    'दुर्घटना', 'आग', 'विस्फोट', 'इमारत गिर', 'पोलीस', 'गुन्हा', 'अटक', 'कायदेशीर',
    'न्यायालय', 'सजा', 'कारागृह', 'गॅंग', 'फिरौती', 'धमकी'
  ],
  'Traffic': [
    'traffic jam', 'congestion', 'gridlock', 'road block', 'diversion', 'one way',
    'signal failure', 'pothole', 'road repair', 'construction', 'metro work', 'flyover',
    'bridge', 'tunnel', 'parking', 'no parking', 'towing', 'challan', 'fine', 'helmet',
    'seatbelt', 'drunk driving', 'rash driving', 'speed limit', 'speed camera',
    'auto strike', 'bus strike', 'transport strike', 'rera', 'brts', 'pmpml',
    'यातायात', 'ट्रॅफिक', 'रस्ता बंद', 'मार्ग परिवर्तन', 'सिग्नल', 'गड्डा', 'बांधकाम',
    'मेट्रो', 'फ्लायओवर', 'पार्किंग', 'चालान', 'दंड', 'हेलमेट', 'सीटबेल्ट',
    'मत्तीत वाहनचालन', 'हडबड', 'गतीमर्यादा', 'रिक्शा हडताल', 'बस हडताल', 'परिवहन'
  ],
  'Politics': [
    'election', 'vote', 'voting', 'candidate', 'constituency', 'mp', 'mla', 'corporator',
    'mayor', 'municipal', 'corporation', 'pmc', 'pcmc', 'ward', 'manifesto', 'rally',
    'campaign', 'bjp', 'congress', 'ncp', 'shiv sena', 'mns', 'aap', 'alliance',
    'coalition', 'minister', 'cm', 'chief minister', 'governor', 'policy', 'bill',
    'ordinance', 'gazette', 'notification', 'reservation', 'quota', 'protest', 'morcha',
    'धरण', 'मोर्चा', 'निवडणूक', 'मतदान', 'उमेदवार', 'मतदारसंघ', 'खासदार', 'आमदार',
    'नगरसेवक', 'महापौर', 'मनपा', 'घोषणापत्र', 'प्रचार', 'मंत्री', 'मुख्यमंत्री',
    'राज्यपाल', 'धोरण', 'विधेयक', 'अध्यादेश', 'राजपत्र', 'सूचना', 'आरक्षण', 'प्रतिबंध'
  ],
  'Business': [
    'startup', 'funding', 'investment', 'ipo', 'stock', 'share', 'market', 'sensex',
    'nifty', 'gdp', 'inflation', 'recession', 'budget', 'tax', 'gst', 'customs',
    'export', 'import', 'trade', 'industry', 'factory', 'manufacturing', 'it park',
    'software', 'company', 'corporate', 'merger', 'acquisition', 'layoff', 'hiring',
    'job', 'vacancy', 'salary', 'increment', 'bonus', 'pf', 'esic', 'labour',
    'उद्योग', 'कारखाना', 'निवेश', 'शेअर बाजार', 'बँक', 'कर्ज', 'बजेट', 'कर',
    'निर्यात', 'आयात', 'व्यापार', 'कंपनी', 'विलिनीकरण', 'अधिग्रहण', 'नोकरी',
    'रिक्ती', 'पगार', 'वाढ', 'बोनस', 'कामगार', 'श्रमिक'
  ],
  'Education': [
    'school', 'college', 'university', 'admission', 'entrance', 'exam', 'result',
    'merit list', 'cutoff', 'fee', 'scholarship', 'curriculum', 'syllabus', 'textbook',
    'teacher', 'professor', 'principal', 'vice chancellor', 'ugc', 'aicte', 'cbse',
    'icse', 'state board', 'ssc', 'hsc', 'neet', 'jee', 'cet', 'mba', 'engineering',
    'medical', 'pharmacy', 'nursing', 'hostel', 'library', 'laboratory', 'research',
    'शाळा', 'महाविद्यालय', 'विद्यापीठ', 'प्रवेश', 'सराव', 'परीक्षा', 'निकाल',
    'गुणपत्रक', 'शुल्क', 'शिष्यवृत्ती', 'अभ्यासक्रम', 'शिक्षक', 'प्राचार्य', 'कुलगुरू',
    'पाठ्यपुस्तक', 'लायब्ररी', 'प्रयोगशाळा', 'संशोधन', 'अभियांत्रिकी', 'वैद्यकीय'
  ],
  'Sports': [
    'cricket', 'ipl', 'ranji', 'football', 'isl', 'hockey', 'badminton', 'tennis',
    'kabaddi', 'wrestling', 'boxing', 'athletics', 'marathon', 'olympics', 'asian games',
    'commonwealth', 'medal', 'gold', 'silver', 'bronze', 'championship', 'tournament',
    'match', 'series', 'team', 'player', 'captain', 'coach', 'stadium', 'pitch',
    'score', 'wicket', 'run', 'goal', 'point', 'victory', 'defeat', 'draw',
    'क्रिकेट', 'फुटबॉल', 'हॉकी', 'बॅडमिंटन', 'टेनिस', 'कबड्डी', 'कुश्ती', 'मल्लयुद्ध',
    'बॉक्सिंग', 'एथलेटिक्स', 'मॅरेथॉन', 'ओलंपिक', 'पदक', 'सोने', 'रजत', 'कांस्य',
    'स्पर्धा', 'संघ', 'मॅच', 'टीम', 'खेळाडू', 'कप्तान', 'प्रशिक्षक', 'स्टेडियम', 'जिंक', 'हर'
  ],
  'Entertainment': [
    'film', 'movie', 'bollywood', 'marathi cinema', 'actor', 'actress', 'director',
    'producer', 'shooting', 'release', 'box office', 'trailer', 'teaser', 'song',
    'music', 'concert', 'show', 'event', 'festival', 'award', 'nomination',
    'theatre', 'drama', 'natya', 'exhibition', 'art', 'culture', 'heritage',
    'celebrity', 'star', 'premiere', 'screening', 'ott', 'web series', 'streaming',
    'चित्रपट', 'सिनेमा', 'अभिनेता', 'अभिनेत्री', 'संचालक', 'निर्माता', 'प्रदर्शन',
    'बॉक्स ऑफिस', 'ट्रेलर', 'गाणी', 'संगीत', 'संगीतसभा', 'कार्यक्रम', 'उत्सव',
    'पुरस्कार', 'नामांकन', 'रंगभूमी', 'नाट्य', 'प्रदर्शनी', 'कला', 'संस्कृती',
    'वारशाचा', 'प्रसिद्ध', 'ओटीटी', 'वेब सीरीज', 'स्ट्रीमिंग'
  ]
};


const PRIORITY=['Weather','Crime & Safety','Traffic','Politics','Business','Education','Sports','Entertainment'];
const AMBIGUOUS=new Set(['court','fine','construction','bridge','rera','share','market','job','gold','silver','bronze','series','team','player','captain','coach','pitch','score','run','goal','point','victory','defeat','draw','director','producer','shooting','release','show','event','award','star','medical','notification','policy','bill','कडक','वाढ','हर','सूचना','कायदेशीर']);
function matches(text,keyword){if(AMBIGUOUS.has(keyword))return false;return new RegExp(String.raw`(^|[^\p{L}\p{N}])`+keyword+String.raw`(?=$|[^\p{L}\p{N}])`,'iu').test(text)}
export function categorize(story={}){const title=String(story.title||''),excerpt=String(story.excerpt||'');let best='Pune Local',score=0;for(const category of PRIORITY){const words=KEYWORDS[category];const n=words.reduce((sum,word)=>sum+(matches(title,word)?3:0)+(matches(excerpt,word)?1:0),0)+(String(story.category||story.existingCategory||'').toLowerCase()===category.toLowerCase()?2:0);if(n>score){score=n;best=category}}return best}
const time=s=>Date.parse(s.pubDate||s.publishedAt);
export function organize(stories,{category='All',limit=25,sort='impact',now=Date.now()}={}){const urls=new Set(),titles=new Set();const unique=[];for(const s of Array.isArray(stories)?stories:[]){if(!s||!s.title||!Number.isFinite(time(s)))continue;const title=s.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();if((s.url&&urls.has(s.url))||titles.has(title))continue;if(s.url)urls.add(s.url);titles.add(title);unique.push({...s,section:categorize(s)})}const categoryCounts=CATEGORIES.map(name=>({name,count:unique.filter(s=>s.section===name).length}));const known=CATEGORIES.includes(category);let result=known?unique.filter(s=>s.section===category):unique;const score=s=>priorityScore(s,now);result.sort((a,b)=>(sort==='latest'?0:score(b)-score(a))||time(b)-time(a));const totalCount=result.length;const cap=Number.isFinite(Number(limit))?Math.max(20,Math.min(30,Math.trunc(Number(limit)))):25;const hasMore=!known&&result.length>cap;if(!known)result=result.slice(0,cap);return {stories:result,totalCount,categoryCounts,hasMore}}
