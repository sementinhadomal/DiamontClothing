/* list_checkout_variants.js – extracts all /checkout/ URLs from a known checkout page */
// Node.js >= 18 (fetch built‑in). Run with `node list_checkout_variants.js`.

const BASE_URL = "https://xstarkde.shop";
const START_URL = `${BASE_URL}/checkout/gray-60ps/`;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

function extractCheckoutLinks(html) {
  const regex = /href=["']([^"'>]*\/checkout\/[^"'>]*)["']/gi;
  const set = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    let link = match[1];
    // Resolve relative URLs
    if (link.startsWith("/")) link = BASE_URL + link;
    set.add(link);
  }
  return [...set];
}

(async () => {
  try {
    const html = await fetchHtml(START_URL);
    const variants = extractCheckoutLinks(html);
    console.log("Checkout variants discovered on the page:");
    variants.forEach(v => console.log(v));
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
