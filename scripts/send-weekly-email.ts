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

async function getCurrentPrice(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`
    );
    const data = await res.json();
    return data.c ? Number(data.c).toFixed(2) : null;
  } catch {
    return null;
  }
}

// Get company name for relevance check
async function getCompanyName(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`
    );
    const data = await res.json();
    return data?.name || null;
  } catch {
    return null;
  }
}

// Marketaux news with strict relevance filter
async function getRelevantNews(ticker: string) {
  const token = process.env.MARKETAUX_API_TOKEN;
  if (!token) return null;

  try {
    const url = `https://api.marketaux.com/v1/news/all?symbols=${ticker}&filter_entities=true&language=en&api_token=${token}`;
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data || json.data.length === 0) return null;

    const companyName = await getCompanyName(ticker);
    const terms = [ticker.toLowerCase()];
    if (companyName) {
      const clean = companyName.toLowerCase().replace(/inc\.?|corp\.?|ltd\.?|llc\.?|plc/gi, '').trim();
      terms.push(clean);
      if (clean.includes(' ')) terms.push(clean.split(' ')[0]);
    }

    const filtered = json.data.filter((a: any) => {
      const headline = a.title.toLowerCase();
      return terms.some(term => headline.includes(term));
    });

    return filtered.slice(0, 3).map((a: any) => ({
      headline: a.title,
      url: a.url,
      source: a.source,
    }));
  } catch {
    return null;
  }
}

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();

  for (const user of users.users) {
    if (!user.email) continue;

    const { data: holdings } = await supabase.from('holdings').select('*').eq('user_id', user.id);
    const { data: watchlist } = await supabase.from('watchlist').select('*').eq('user_id', user.id);

    let totalValue = 0;
    const rows: string[] = [];

    // Holdings
    for (const h of holdings || []) {
      const priceStr = await getCurrentPrice(h.ticker);
      if (!priceStr) continue;

      const price = Number(priceStr);
      const value = price * Number(h.shares);
      totalValue += value;

      const news = await getRelevantNews(h.ticker);

      rows.push(`
        <div style="background:#1a1a1a;color:white;padding:24px;border-radius:24px;margin-bottom:16px;display:flex;align-items:center;gap:24px;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
          <img src="https://finnhub.io/api/logo?symbol=${h.ticker}" width="80" height="80" style="border-radius:20px;" onerror="this.style.display='none'" />
          <div style="flex:1;">
            <div style="font-size:36px;font-weight:bold;">${h.ticker}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:48px;font-weight:bold;">$${priceStr}</div>
            <div style="color:#aaa;margin-top:8px;">
              ${h.shares} shares = <strong style="font-size:32px;">$${value.toFixed(2)}</strong>
            </div>
          </div>
        </div>
        ${news && news.length > 0 ? `
          <ul style="margin:16px 0 0;padding-left:40px;font-size:14px;list-style:none;">
            ${news.map((n: any) => `
              <li style="margin-bottom:8px;">
                <a href="${n.url}" style="color:#60a5fa;text-decoration:none;">${n.headline}</a>
                <span style="color:#888;margin-left:8px;">— ${n.source}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}
      `);
    }

    // Watchlist
    for (const w of watchlist || []) {
      const priceStr = await getCurrentPrice(w.ticker);
      if (!priceStr) continue;

      const news = await getRelevantNews(w.ticker);

      rows.push(`
        <div style="background:#1a1a1a;color:white;padding:24px;border-radius:24px;margin-bottom:16px;display:flex;align-items:center;gap:24px;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
          <img src="https://finnhub.io/api/logo?symbol=${w.ticker}" width="80" height="80" style="border-radius:20px;" onerror="this.style.display='none'" />
          <div style="flex:1;">
            <div style="font-size:36px;font-weight:bold;">${w.ticker} (Watchlist)</div>
          </div>
          <div style="font-size:48px;font-weight:bold;">$${priceStr}</div>
        </div>
        ${news && news.length > 0 ? `
          <ul style="margin:16px 0 0;padding-left:40px;font-size:14px;list-style:none;">
            ${news.map((n: any) => `
              <li style="margin-bottom:8px;">
                <a href="${n.url}" style="color:#60a5fa;text-decoration:none;">${n.headline}</a>
                <span style="color:#888;margin-left:8px;">— ${n.source}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}
      `);
    }

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#111;color:white;padding:32px;">
        <h1 style="font-size:32px;text-align:center;margin-bottom:32px;">Weekend Investor Recap</h1>

        <div style="background:#0d9488;padding:32px;border-radius:24px;text-align:center;margin-bottom:40px;">
          <p style="margin:0;font-size:24px;">Total Portfolio Value</p>
          <p style="margin:16px 0 0;font-size:64px;font-weight:900;">
            $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        ${rows.join('')}

        <p style="text-align:center;color:#888;margin-top:60px;">
          See you next Friday.<br><em>Weekend Investor</em>
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Weekend Investor <recap@weekendinvestor.site>',
      to: user.email,
      subject: `Your Weekly Recap — $${totalValue.toFixed(2)}`,
      html,
    });

    console.log(`Sent to ${user.email} — $${totalValue.toFixed(2)}`);
  }

  console.log('All emails sent');
}

main().catch(console.error);