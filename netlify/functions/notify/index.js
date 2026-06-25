const webpush = require('web-push');

const SB_URL = 'https://gexhkzqdsrhetdlymlug.supabase.co';
const SB_KEY = 'sb_publishable_mv_5MeKiLLeErdeGBzAOZw_feYpEWw1';
const VAPID_PUBLIC  = 'BDvbHb24PHGPoKACdSI4E5oESYZVCRSrvoYsYv7l8-q1oSHKDC6wu3EwIdfYXwW46tvgKiFo4ImuuRkr2go473I';
const VAPID_PRIVATE = 'vOjGxOEU9-g7AoDWImxuSzpQSotk6V3jjVsLFima1b4';

webpush.setVapidDetails('mailto:fransissco76@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    const booking = body.record || {};

    // Fetch all push subscriptions
    const res = await fetch(`${SB_URL}/rest/v1/push_subscriptions?select=*`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    const subs = await res.json();
    if (!Array.isArray(subs) || subs.length === 0) return { statusCode: 200, body: 'no subs' };

    const payload = JSON.stringify({
      title: '🚗 Booking Baru Masuk!',
      body: `${booking.nama || 'Customer'} — ${booking.jenis || 'Booking'}`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'booking-' + booking.id,
      data: { url: '/admin.html' }
    });

    await Promise.all(subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Expired subscription — delete it
          await fetch(`${SB_URL}/rest/v1/push_subscriptions?id=eq.${row.id}`, {
            method: 'DELETE',
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
          });
        }
      }
    }));

    return { statusCode: 200, body: JSON.stringify({ sent: subs.length }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err.message };
  }
};
