// First-visit seed data so Research Lab is never empty.
// Written into localStorage `cryptodesk.chats` if both that key is empty AND
// the `cryptodesk.seeded.v1` flag is missing. Returning users' real history is preserved.

const HOUR = 60 * 60 * 1000
const DAY  = 24 * HOUR

export function buildSeedChats() {
  const now = Date.now()
  return [
    {
      id: 'seed-btc-week',
      title: 'Why did BTC move this week?',
      tickers: ['BTC'],
      lastMessageAt: now - 2 * HOUR,
      messages: [
        { role: 'user', content: 'Why did BTC move this week?' },
        { role: 'assistant', content: "BTC's 2.34% week reflects two converging catalysts: BlackRock's IBIT logged its largest single-day inflow in 30 days at $620M [news:1], and the CPI print of 3.4% YoY came in 10bps below forecast [news:2]. The combination of structural ETF demand and a softer inflation surprise re-priced the institutional floor — buyers stepped in aggressively in the $101-104k range." },
        { role: 'user', content: 'Is the ETF flow durable or one-off?' },
        { role: 'assistant', content: "It looks structural, not opportunistic. The 7-day net inflow of +$1.2B is consistent with a multi-week accumulation pattern, and the BlackRock daily print fits a broader institutional re-allocation rather than a single-day event. The bear case requires a CPI re-acceleration or a regulatory shock — neither in view this week." },
      ],
    },
    {
      id: 'seed-mstr-mnav',
      title: "What's MSTR's mNAV telling us?",
      tickers: ['MSTR', 'BTC'],
      lastMessageAt: now - 1 * DAY,
      messages: [
        { role: 'user', content: "What's MSTR's mNAV telling us?" },
        { role: 'assistant', content: "MSTR is trading at an mNAV premium of 2.8x — meaning the market is pricing each $1 of BTC on MSTR's balance sheet at $2.80 in stock value. That premium reflects (a) scarcity of pure-play BTC equity exposure for institutions that can't hold spot, and (b) Michael Saylor's ATM-equity flywheel that converts the premium into more BTC accumulation. Historically, dips to ~2.4x have been good entry points; sustained reads above 3.0x usually mean the premium is fragile." },
        { role: 'user', content: 'Is the ATM issuance dilutive?' },
        { role: 'assistant', content: "Per share, yes — but per BTC, no. Each issuance round adds BTC faster than it adds shares (because of the 2.8x premium), so BTC-per-share rises every cycle. The +13.7% BTC YTD figure is the proof: that's the BTC equity yield AFTER accounting for dilution, outperforming spot by 4.1pp." },
      ],
    },
    {
      id: 'seed-rebalance-50k',
      title: 'Rebalance $50K toward higher-conviction crypto',
      tickers: ['MAG7', 'BTC', 'SOL'],
      lastMessageAt: now - 3 * DAY,
      messages: [
        { role: 'user', content: 'Rebalance $50K toward higher-conviction crypto. /rebalance 50000' },
        { role: 'assistant', content: 'Running the MAG7 SSI allocation for $50,000. The index weights are derived from market cap with a 2-week smoothing. Here is the breakdown:' },
        { role: 'assistant', content: "BTC 42.5% → $21,250 (0.20 BTC)\nETH 24.3% → $12,150 (3.55 ETH)\nBNB 11.2% → $5,600 (9.0 BNB)\nSOL 10.8% → $5,400 (30.3 SOL)\nXRP 5.6%  → $2,800\nADA 3.2%  → $1,600\nAVAX 2.4% → $1,200\n\nThe overweight in BTC+ETH (66.8% combined) is the conservative core. If you want higher conviction on the upside, the cleanest tilt is +5% SOL / -5% XRP-ADA — SOL has the best 30d ETF correlation outside BTC/ETH [news:6]." },
        { role: 'user', content: "What's the risk on the SOL tilt?" },
        { role: 'assistant', content: "Two risks: (1) SOL beta to BTC is ~1.4x in drawdowns, so a 10% BTC correction is closer to 14% on SOL — bigger swings on the way down. (2) Validator concentration: ~40% of stake sits with the top 10 validators, which makes a single outage a tail event. Mitigation: stagger entries over 2 weeks rather than a single buy." },
      ],
    },
  ]
}
