// scripts/send-weekly-email.ts
import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const NOISE_SOURCES = ['Yahoo Entertainment', 'TMZ', 'Daily Mail', 'PopSugar', 'Guest Post', 'Rumor'];

async function getCurrentPrice(ticker: string): Promise<{ price: string; high: string; low: string } | null> {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`);
    const data = await res.json();
    return data.c ? { price: Number(data.c).toFixed(2), high: Number(data.h).toFixed(2), low: Number(data.l).toFixed(2) } : null;
  } catch { return null; }
}

async function getCompanyName(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`);
    const data = await res.json();
    return data?.name || null;
  } catch { return null; }
}

async function getHighQualityNews(ticker: string, companyName: string) {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const cleanName = companyName.toLowerCase().replace(/inc\.?|corp\.?|ltd\.?|llc\.?|plc/gi, '').trim();
    const filtered = data.filter((item: any) => {
      const headline = item.headline.toLowerCase();
      return !NOISE_SOURCES.some(noise => item.source.includes(noise)) && 
             (headline.includes(ticker.toLowerCase()) || headline.includes(cleanName)) && 
             item.summary.length > 40;
    });

    return filtered.slice(0, 5).map((item: any) => ({ headline: item.headline, url: item.url, source: item.source }));
  } catch { return null; }
}

function generateStockRow(ticker: string, stats: any, news: any[], shares?: number, isWatchlist: boolean = false) {
  const holdingValue = shares ? (Number(stats.price) * shares).toLocaleString(undefined, { minimumFractionDigits: 2 }) : null;

  return `
    <div style="background:#151515; border:1px solid #333; color:white; padding:24px; border-radius:16px; margin-bottom:24px;">
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="left">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding-right: 16px;">
                  <img src="https://finnhub.io/api/logo?symbol=${ticker}" width="44" height="44" style="border-radius:10px; background:white; display:block;" />
                </td>
                <td>
                  <span style="font-size:22px; font-weight:bold; display:block;">${ticker}</span>
                  ${isWatchlist ? `<span style="color:#666; font-size:10px; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Watchlist</span>` : ''}
                </td>
              </tr>
            </table>
          </td>
          <td align="right">
            <div style="font-size:22px; font-weight:bold;">$${stats.price}</div>
            <div style="font-size:10px; color:#666; margin-top:2px;">7-day high: $${stats.high} • 7-day low: $${stats.low}</div>
          </td>
        </tr>
      </table>

      ${shares ? `
        <div style="background:#222; border-radius:12px; padding:14px 18px; margin-top:20px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="left" style="font-size:14px; color:#999;">${shares.toLocaleString()} Shares</td>
              <td align="right" style="font-size:18px; font-weight:bold; color:#10b981;">$${holdingValue}</td>
            </tr>
          </table>
        </div>
      ` : ''}
      
      <div style="margin-top:20px; border-top:1px solid #222; padding-top:16px;">
        ${news.length > 0 ? news.map((n, index) => `
          <div style="margin-bottom:16px; ${index === news.length - 1 ? '' : 'border-bottom:1px solid #222; padding-bottom:16px;'}">
            <a href="${n.url}" style="color:#ffffff; text-decoration:none; font-size:14px; font-weight:500; display:block; line-height:1.4;">${n.headline}</a>
            <span style="color:#666; font-size:11px; margin-top:4px; display:block;">via ${n.source}</span>
          </div>
        `).join('') : '<div style="color:#444; font-size:12px; padding:10px 0;">No significant news this week.</div>'}
      </div>
    </div>
  `;
}

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();
  for (const user of users.users) {
    if (!user.email) continue;
    const { data: holdings } = await supabase.from('holdings').select('*').eq('user_id', user.id);
    const { data: watchlist } = await supabase.from('watchlist').select('*').eq('user_id', user.id);

    let totalVal = 0;
    let sections: string[] = [];

    for (const h of holdings || []) {
      const stats = await getCurrentPrice(h.ticker);
      const name = await getCompanyName(h.ticker);
      if (stats && name) {
        totalVal += (Number(stats.price) * Number(h.shares));
        const news = await getHighQualityNews(h.ticker, name);
        sections.push(generateStockRow(h.ticker, stats, news || [], Number(h.shares)));
      }
    }

    for (const w of watchlist || []) {
      const stats = await getCurrentPrice(w.ticker);
      const name = await getCompanyName(w.ticker);
      if (stats && name) {
        const news = await getHighQualityNews(w.ticker, name);
        sections.push(generateStockRow(w.ticker, stats, news || [], undefined, true));
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="background-color:#050505; margin:0; padding:0; -webkit-text-size-adjust:none; text-size-adjust:none;">
          <div style="max-width:600px; margin:0 auto; padding:40px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
            
            <div style="text-align:center; margin-bottom:40px;">
              <h1 style="color:white; font-size:24px; font-weight:800; margin:0;">Weekend Investor</h1>
              <p style="color:#666; font-size:12px; margin-top:8px;">Portfolio Insight • ${new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
            </div>

            <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); padding:32px; border-radius:24px; text-align:center; margin-bottom:40px;">
              <div style="color:rgba(255,255,255,0.7); font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Net Worth Estimate</div>
              <div style="color:white; font-size:48px; font-weight:900; margin-top:8px;">$${totalVal.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
            </div>

            ${sections.join('')}

            <div style="text-align:center; margin-top:40px; border-top:1px solid #222; padding-top:20px;">
              <p style="color:#444; font-size:11px;">
                <a href="https://weekend-investor.vercel.app" style="color:#10b981; text-decoration:none; font-weight:bold;">Update Portfolio</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Weekend Investor <recap@weekendinvestor.site>',
      to: user.email,
      subject: `Weekly Recap: $${totalVal.toLocaleString(undefined, {minimumFractionDigits:2})}`,
      html,
    });
    console.log(`Sent to ${user.email}`);
  }
}

main().catch(console.error);