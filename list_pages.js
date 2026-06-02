/* list_pages.js – simple script to discover page variants on xstarkde.shop */
// Requires Node.js >= 18 (has built‑in fetch). Run with `node list_pages.js`.

const BASE_URL = "https://xstarkde.shop";

async function getHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

function extractLinks(html) {
  const aTagRegex = /<a[^>]+href=["']([^"'>]+)["'][^>]*>/gi;
  const links = new Set();
  let match;
  while ((match = aTagRegex.exec(html)) !== null) {
    let href = match[1];
    // Normalise relative URLs
    if (href.startsWith("/")) href = BASE_URL + href;
    if (href.startsWith(BASE_URL)) links.add(href);
  }
  return [...links];
}

function extractCheckoutVariants(html) {
  const planIdRegex = /data-whop-checkout-plan-id=["']([^"']+)["']/gi;
  const variants = new Set();
  let match;
  while ((match = planIdRegex.exec(html)) !== null) {
    const planId = match[1];
    // Whop checkout URLs follow the pattern /checkout/<slug>/
    // We can try to guess the slug from the surrounding markup.
    const surrounding = html.slice(Math.max(0, match.index - 100), match.index + 200);
    const slugMatch = surrounding.match(/\/checkout\/([^\"'\s>]+)/);
    if (slugMatch) {
      const slug = slugMatch[1];
      variants.add(`${BASE_URL}/checkout/${slug}/`);
    }
  }
  return [...variants];
}

(async () => {
  try {
    const homepage = await getHtml(BASE_URL);
    const links = extractLinks(homepage);
    console.log("=== Links found on homepage ===");
    links.forEach(l => console.log(l));

    // Also fetch a known checkout page to discover other variants
    const knownCheckout = `${BASE_URL}/checkout/gray-60ps/`;
    const checkoutHtml = await getHtml(knownCheckout);
    const checkoutVariants = extractCheckoutVariants(checkoutHtml);
    console.log("\n=== Checkout variants discovered ===");
    checkoutVariants.forEach(v => console.log(v));
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
