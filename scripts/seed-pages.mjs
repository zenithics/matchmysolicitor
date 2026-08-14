const BASE = 'http://localhost:3000';

async function login() {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ryan@zenithics.com', password: 'beachHUT67!' }),
  });
  const d = await res.json();
  return d.token;
}

const lexical = (text) => ({
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: [{
      type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1,
      children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }]
    }]
  }
});

const PAGES = [
  {
    title: 'Shipping and Returns',
    slug: 'shipping',
    _status: 'published',
    hero: { type: 'lowImpact', richText: lexical('Shipping and Returns') },
    layout: [{
      blockType: 'faq',
      heading: 'Shipping and Returns',
      description: lexical('Everything you need to know about our delivery and returns process.'),
      items: [
        { question: 'How much does shipping cost?', answer: lexical('Standard UK delivery is FREE on all orders over 30 GBP. Orders under 30 GBP are charged at 2.99 GBP. Next-day tracked delivery is available for 4.99 GBP.') },
        { question: 'How long does delivery take?', answer: lexical('Standard delivery takes 2 to 3 business days. Next-day delivery is available if ordered before 2pm Monday to Friday. International orders take 5 to 10 business days.') },
        { question: 'Do you ship internationally?', answer: lexical('Yes, we ship to most countries worldwide. International shipping rates are calculated at checkout based on your location.') },
        { question: 'What is your return policy?', answer: lexical('We accept returns on all unopened, unused products within 30 days of purchase. Items must be in their original packaging. To initiate a return, please contact us at hello@pressednailzz.co.uk.') },
        { question: 'My order arrived damaged - what do I do?', answer: lexical('We are so sorry! Please contact us within 14 days with a photo of the damage and we will send a replacement free of charge or issue a full refund.') }
      ]
    }],
    meta: { title: 'Shipping and Returns | Pressed Nailzz', description: 'Free UK delivery on orders over 30 GBP. Easy 30-day returns on all unopened sets.' }
  },
  {
    title: 'Size Guide',
    slug: 'size-guide',
    _status: 'published',
    hero: { type: 'lowImpact', richText: lexical('Size Guide') },
    layout: [{
      blockType: 'content',
      columns: [{
        size: 'full',
        richText: lexical('Each Pressed Nailzz set includes 24 nails in sizes 0 to 9 (smallest to largest). To find your size: use a tape measure or ruler to measure the widest part of each nail bed in millimetres. Match your measurements to our size chart. When between sizes, we recommend sizing up for comfort.')
      }]
    }],
    meta: { title: 'Size Guide | Pressed Nailzz', description: 'Find your perfect press-on nail size with our easy measurement guide.' }
  },
  {
    title: 'How to Apply',
    slug: 'how-to-apply',
    _status: 'published',
    hero: { type: 'lowImpact', richText: lexical('How to Apply') },
    layout: [{
      blockType: 'howItWorks',
      heading: 'How to Apply Your Press-On Nails',
      description: lexical('Follow these simple steps for a flawless, long-lasting finish every time.'),
      steps: [
        { title: 'Prep Your Nails', description: lexical('Push back your cuticles, buff the nail surface lightly, and wipe with the included prep pad to remove any oils. Dry nails = longer wear.'), icon: '1' },
        { title: 'Size and Select', description: lexical('Lay out the press-ons and find the best fit for each finger. The nail should cover your nail bed without touching your skin.'), icon: '2' },
        { title: 'Apply', description: lexical('Peel the backing from an adhesive tab, press the nail firmly from the cuticle down, and hold for 30 seconds.'), icon: '3' },
        { title: 'Shape and Style', description: lexical('Use the included file to shape the free edge and adjust the length to your liking. Slay away!'), icon: '4' }
      ]
    }],
    meta: { title: 'How to Apply | Pressed Nailzz', description: 'Step-by-step guide to applying your Pressed Nailzz press-on nails.' }
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    _status: 'published',
    hero: { type: 'lowImpact', richText: lexical('Privacy Policy') },
    layout: [{
      blockType: 'content',
      columns: [{
        size: 'full',
        richText: lexical('Pressed Nailzz is committed to protecting your privacy. We collect your name, email address, and delivery details solely to process and fulfil your orders. We will never sell your personal data to third parties. For marketing emails, you can opt out at any time via the unsubscribe link in any email. To request deletion of your data, email hello@pressednailzz.co.uk. Last updated: June 2026.')
      }]
    }],
    meta: { title: 'Privacy Policy | Pressed Nailzz', description: 'Read the Pressed Nailzz privacy policy.' }
  },
  {
    title: 'Terms and Conditions',
    slug: 'terms',
    _status: 'published',
    hero: { type: 'lowImpact', richText: lexical('Terms and Conditions') },
    layout: [{
      blockType: 'content',
      columns: [{
        size: 'full',
        richText: lexical('By purchasing from Pressed Nailzz, you agree to our terms of sale. Products are intended for personal use only. We reserve the right to refuse service or cancel orders at our discretion. Prices are shown in GBP and include VAT where applicable. All content on this website is owned by Pressed Nailzz and may not be reproduced without permission. These terms are governed by the laws of England and Wales. Last updated: June 2026.')
      }]
    }],
    meta: { title: 'Terms and Conditions | Pressed Nailzz', description: 'Read the Pressed Nailzz terms and conditions.' }
  },
  {
    title: 'Cookie Policy',
    slug: 'cookies',
    _status: 'published',
    hero: { type: 'lowImpact', richText: lexical('Cookie Policy') },
    layout: [{
      blockType: 'content',
      columns: [{
        size: 'full',
        richText: lexical('We use essential cookies to make our website work (shopping cart, login sessions). We also use analytics cookies (via Vercel Analytics) to understand how visitors use our site - these are anonymous and never linked to personal data. We do not use advertising cookies. By continuing to use our site, you consent to our use of essential cookies. You can disable analytics cookies in your browser settings. Last updated: June 2026.')
      }]
    }],
    meta: { title: 'Cookie Policy | Pressed Nailzz', description: 'Read the Pressed Nailzz cookie policy.' }
  }
];

async function main() {
  const token = await login();
  console.log('Logged in.');

  for (const page of PAGES) {
    const res = await fetch(`${BASE}/api/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
      body: JSON.stringify(page),
    });
    const d = await res.json();
    if (d.errors) {
      console.log(`ERROR [${page.slug}]:`, d.errors[0]?.message);
    } else {
      console.log(`Created: ${d.doc?.slug}`);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
