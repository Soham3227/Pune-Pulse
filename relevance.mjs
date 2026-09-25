// Relevance is a transparent text heuristic, never a truth or confidence score.
export function relevance(title, excerpt = '', hasArea = false) {
 const text = `${title} ${excerpt}`;
 const important = /\b(warning|alert|flood|closure|outage|water|metro|transport|tax|budget|jobs|hospital|school|fees|pollution|court|election|infrastructure)\b|पाणी|वाहतूक|पूर|इशारा/iu.test(text);
 if (hasArea || /\b(pune|pimpri|chinchwad|pcmc)\b|पुणे|पिंपरी|चिंचवड/iu.test(text))
  return {scope:'Pune',importance:important?100:80,impactReason:'Pune or a local neighbourhood is named in the headline or summary.'};
 if (/\b(maharashtra|maharashtrian)\b|महाराष्ट्र/iu.test(text))
  return {scope:'Maharashtra',importance:important?85:60,impactReason:'Maharashtra is named in the report. Its effect on Pune may vary by locality.'};
 const actor = /\b(RBI|reserve bank of india|union cabinet|union government|central government|GST council|supreme court|nationwide|across india|all india)\b/iu.test(text);
 const action = /\b(announces?|approves?|cuts?|raises?|changes?|orders?|rules?|mandates?|rolls? out|takes? effect|effective|hikes?)\b/iu.test(text);
 const topics = [
  [/\b(repo rate|interest rates?|banking|loans?|EMI)\b/iu,'Banking or borrowing costs'],
  [/\b(GST|income tax|tax rates?|fuel prices?|petrol|diesel|LPG)\b/iu,'Household or business costs'],
  [/\b(railways?|rail services?|aviation|flights?)\b/iu,'National transport services'],
  [/\b(health insurance|vaccination|public health|medicine prices?)\b/iu,'Public health or healthcare costs'],
  [/\b(NEET|JEE|board exams?|education policy|labour law|labor law|minimum wage)\b/iu,'Education or employment rules']
 ];
 const match = topics.find(([pattern])=>pattern.test(text));
 if(actor && action && match) return {scope:'National impact',importance:75,impactReason:`${match[1]}: a national decision may affect Pune residents. Local applicability is not independently confirmed.`};
 return null;
}
