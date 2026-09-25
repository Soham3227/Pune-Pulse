# Pune Pulse

A local editorial news reader for Pune, its neighbourhoods and relevant Maharashtra/national decisions. Native Node.js and browser JavaScript; no frontend dependencies.

## Downloaded ZIP setup
Requires Node.js 24 or newer. Extract the ZIP, copy `.env.example` to `.env`, and fill in your NewsData and NewsAPI keys. No npm install is needed. Keys, cached articles and browser bookmarks are intentionally not included in the download. Your existing local project keeps its current configuration.

## Start
Double-click `Start-Pune-Pulse.cmd`, then open http://127.0.0.1:4317/. Keep the window open for scheduled collection. The welcome page links to the actual news dashboard. Closing the server or sleeping the computer pauses collection; startup checks whether a refresh is due. This does not install a Windows background service.

## Providers and updates
Keep `NEWSDATA_API_KEY` and `NEWSAPI_API_KEY` in `.env` on the server. See `.env.example`. Credentials are never served to the browser. Collection runs every six hours, with a manual refresh cooldown. The browser checks saved coverage every five minutes. SQLite retains seven days, while the feed offers today or the latest three India-calendar days. Smart mode adds the previous two days when fewer than six matching stories were published today.

NewsData supplies English and Marathi Pune coverage. NewsAPI supplies additional regional and narrowly targeted national coverage. NewsAPI Developer is for local development/testing only, has a 24-hour article delay and a 100-request daily limit; publishing requires a suitable provider plan. https://newsapi.org/pricing

The app applies lower local request budgets (NewsData 80/day; NewsAPI 40/day) and retains existing stories during provider failures. Provider errors and last successful update remain visible.

## Editorial limits
Original publisher headlines and source links are retained. Relevance is a transparent headline/summary heuristic, not verification or a confidence score. National stories require a specific policy actor, decision and public-impact topic. Regional stories are not assigned to individual neighbourhoods. Images belong to their publishers and may be representational. No invented articles or fabricated breaking-news labels.

## Development
`npm test` runs date-window, area, filtering, relevance and provider-adapter checks. `npm start` starts the server. `node server-v2.mjs --refresh-only` collects once, respecting the cooldown. No external packages are required.

## Image credit
Welcome image: “Shaniwar Wada Main Gate 01”, Pravega, CC0 1.0, Wikimedia Commons. https://commons.wikimedia.org/wiki/File:Shaniwar_Wada_Main_Gate_01.jpg

## Editorial dashboard
The main news view shows up to 25 headlines, ranked by public impact and freshness. The nine category pages (Pune Local, Crime & Safety, Traffic, Politics, Business, Education, Sports, Weather, Entertainment) show all matching stories within the selected date/search filters. Categories replace neighbourhood navigation; existing area API filtering is retained for compatibility. Category assignment is a keyword heuristic and can be imperfect. Promotional items are deprioritized on the main feed, not deleted from categories.

Bookmarks and theme preferences stay in this browser. Sharing uses the device share sheet or copies the publisher link. Animations respect reduced-motion preferences.

Mediastack and Serpstack were skipped at the user’s request. The APILayer key is unused.
