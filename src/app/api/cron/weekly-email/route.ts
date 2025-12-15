// src/app/api/cron/weekly-email/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

async function getQuote(ticker: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`,
    { next: { revalidate: 300 } }
  );
  return res.json();
}

export async function GET(request: NextRequest) {
  // Security: only allow from Vercel Cron or localhost
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const { data: users } = await supabase.auth.admin.listUsers();

  for (const user of users.users) {
    if (!user.email) continue;

    const { data: holdings } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id);

    const { data: watchlist } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id);

    let totalValue = 0;
    const pricedHoldings = [];

    for (const h of holdings || []) {
      const quote = await getQuote(h.ticker);
      const price = quote.c || 0;
      const value = price * Number(h.shares);
      totalValue += value;

      pricedHoldings.push({ ...h, price, value });
    }

    const html = `
      <h1>Weekend Investor Recap</h1>
      <p>Hi ${user.email?.split('@')[0]}!</p>
      <h2>Total Portfolio Value: $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
      <h3>Your Holdings</h3>
      <ul>
        ${pricedHoldings.map(h => `<li><strong>${h.ticker}</strong>: ${h.shares} shares &times; $${h.price.toFixed(2)} = $${h.value.toFixed(2)}</li>`).join('')}
      </ul>
      ${watchlist?.length ? `<h3>Watchlist</h3><ul>${watchlist.map(w => `<li>${w.ticker}</li>`).join('')}</ul>` : ''}
      <p>See you next Friday!</p>
    `;

    await resend.emails.send({
      from: 'Weekend Investor <recap@weekendinvestor.site>',
      to: user.email,
      subject: `Your Weekly Recap — $${totalValue.toFixed(2)}`,
      html,
    });
  }

  return NextResponse.json({ success: true });
}