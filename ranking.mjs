const DECAY_PER_HOUR = 0.65;
const MS_PER_HOUR = 36e5;

const BOOST_KEYWORDS = [
  // Water supply
  'water supply', 'water cut', 'water shortage', 'tanker', 'pipeline burst', 'valve repair',
  'पाणी पुरवठा', 'पाणी कट', 'पाण्याची त्रास', 'टँकर', 'पाईप फुटणे', 'वॉल्व दुरुस्ती',
  // Traffic & Metro
  'traffic diversion', 'road closed', 'metro closed', 'metro service', 'route change', 'flyover closed',
  'वाहतूक फेरबदल', 'रस्ता बंद', 'मेट्रो बंद', 'मेट्रो सेवा', 'मार्ग बदल', 'फ्लायओवर बंद',
  // Weather
  'heavy rain', 'flood', 'waterlogging', 'orange alert', 'red alert', 'imd warning', 'cyclone',
  'मुसलाधार पाऊस', 'पूर', 'पाणी जमाव', 'ऑरेंज अलर्ट', 'रेड अलर्ट', 'आयएमडी इशारा', 'चक्रवात',
  // Safety
  'building collapse', 'fire broke', 'gas leak', 'short circuit', 'stampede', 'wall collapse',
  'इमारत ढहणे', 'आग लागणे', 'गॅस लीक', 'शॉर्ट सर्किट', 'धक्का', 'भिंत ढहणे',
  // Health
  'dengue', 'malaria', 'chikungunya', 'cholera', 'outbreak', 'vaccination drive', 'hospital alert',
  'डेंगू', 'मलेरिया', 'चिकनगुनिया', 'हैजा', 'प्रकोप', 'लसीकरण मुहिम', 'रुग्णालय सतर्कता',
  // Govt decisions
  'policy change', 'new rule', 'notification issued', 'gazette', 'high court order', 'supreme court',
  'धोरण बदल', 'नवीन नियम', 'अधिसूचना जारी', 'राजपत्र', 'उच्च न्यायालय आदेश', 'सर्वोच्च न्यायालय',
];

const PENALTY_KEYWORDS = [
  // Promotional awards/certifications
  'great place to work', 'global winners', 'certification', 'iso certified', 'excellence award', 'best hospital', 'top ranked',
  'पुरस्कृत', 'प्रमाणपत्र', 'उत्कृष्टता पुरस्कार', 'सर्वोत्तम रुग्णालय', 'टॉप रँक',
  // Corporate personnel
  'hotel appointment', 'named ceo', 'new director', 'joins board', 'senior vice president',
  'मुख्य कार्यकारी अधिकारी', 'नवीन संचालक', 'मंडळात सामील',
  // Hotel dining
  'buffet', 'brunch', 'fine dining', 'culinary festival', 'food festival', 'staycation', 'menu launch',
  'बुफे', 'ब्रंच', 'फाइन डायनिंग', 'पाककला महोत्सव', 'अन्न महोत्सव', 'स्टेकेसन', 'मेनू लॉन्च',
  // Video roundups
  'video roundup', 'watch now', 'top 5 videos', 'in shorts', 'reels', 'visual story',
  'व्हिडिओ रँडअप', 'आता पहा', 'टॉप ५ व्हिडिओ', 'शॉर्ट्समध्ये', 'रिल्स', 'दृश्य कथा',
];

function keywordScore(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => score + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
}

export function priorityScore(story, now = Date.now()) {
  const { importance = 0, pubDate, title = '', excerpt = '', scope = 'Pune', category = '' } = story;
  const text = `${title} ${excerpt} ${category}`;

  let score = Math.max(0, Math.min(100, Number(importance) || 60));

  const boostHits = keywordScore(text, BOOST_KEYWORDS);
  score += Math.min(30, boostHits * 12);

  const penaltyHits = keywordScore(text, PENALTY_KEYWORDS);
  score -= Math.min(60, penaltyHits * 25);
  if (/admissions? open|announces.*admissions|entrepreneur.*delegation|joins the.*(ritz|hotel)|top \d+ news today/i.test(title)) score -= 45;

  const ageHours = (now - new Date(pubDate || story.publishedAt).getTime()) / MS_PER_HOUR;
  if (ageHours > 0) score -= ageHours * DECAY_PER_HOUR;

  const scopeMultiplier = scope === 'Pune' ? 1.15 : scope === 'Maharashtra' ? 1.05 : 1.0;
  score *= scopeMultiplier;

  return Math.max(0, Number(score.toFixed(2)));
}
