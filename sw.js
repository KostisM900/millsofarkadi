/* =====================================================================
   Φάκελοι πελατών · Μύλοι Αρκαδίου
   Service worker ΜΟΝΟ για τα κουμπιά μέσα στην ειδοποίηση του υπολογιστή
   («Δόθηκε», «Σε 30′»). Ο browser δεν επιτρέπει κουμπιά σε ειδοποίηση
   που φτιάχνεται απευθείας από τη σελίδα — χρειάζεται αυτό το αρχείο.

   Ανέβασέ το ΔΙΠΛΑ στο index.html, στον ίδιο φάκελο.

   Δεν αποθηκεύει τίποτα και δεν παρεμβαίνει στη σελίδα: ούτε cache, ούτε
   fetch. Αν λείψει, η εφαρμογή δουλεύει κανονικά — απλώς η ειδοποίηση
   βγαίνει χωρίς κουμπιά και πατάς τα κουμπιά μέσα στη σελίδα.
   ===================================================================== */
'use strict';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', event => {
  const action = event.action || 'open';
  const data = event.notification.data || {};
  event.notification.close();

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const msg = { type: 'notif-action', action, ids: data.ids || '', payload: data };

    for (const client of all) {
      if ('focus' in client) {
        try { await client.focus(); } catch (e) {}
        client.postMessage(msg);
        return;
      }
    }
    /* Καμία ανοιχτή καρτέλα: ανοίγει την εφαρμογή και στέλνει το μήνυμα
       μόλις είναι έτοιμη. */
    const win = await self.clients.openWindow('./');
    if (win) setTimeout(() => { try { win.postMessage(msg); } catch (e) {} }, 1500);
  })());
});