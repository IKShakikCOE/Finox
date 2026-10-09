import sys
import os
import json
import re
import urllib.parse
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

DEFAULT_KEYWORDS = [
    "বিনিয়োগ",
    "হালাল লাভ",
    "শেয়ার ক্রাউডফান্ডিং",
    "এগ্রো খামার পার্টনার",
    "হোটেল শেয়ার"
]

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'[\r\n\t]+', ' ', text).strip()

def extract_phone(text):
    m = re.search(r'(?:\+?880\s?|0)1[3-9]\d{2}[-\s]?\d{6}', text)
    return m.group(0) if m else None

def extract_url(text, links):
    for link in links:
        if "facebook.com/ads/library" not in link and "l.facebook.com" in link:
            # decode facebook redirect
            m = re.search(r'u=([^&]+)', link)
            if m:
                try:
                    return urllib.parse.unquote(m.group(1))
                except Exception:
                    pass
        elif "facebook.com/ads/library" not in link:
            return link

    m = re.search(r'https?://[^\s<>"]+', text)
    return m.group(0).rstrip('.,)]') if m else None

def scrape_ads(keywords=None, target_count=30):
    if not keywords:
        keywords = DEFAULT_KEYWORDS

    collected_ads = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = context.new_page()

        for kw in keywords:
            if len(collected_ads) >= target_count:
                break

            encoded_q = urllib.parse.quote(kw)
            url = f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BD&q={encoded_q}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all"

            try:
                page.goto(url, wait_until="domcontentloaded", timeout=40000)
                page.wait_for_timeout(6000)

                # Scroll 4 times to trigger infinite scroll
                for _ in range(4):
                    page.mouse.wheel(0, 1500)
                    page.wait_for_timeout(1800)

                raw_cards = page.evaluate('''() => {
                    const results = [];
                    const containers = document.querySelectorAll('div');
                    const seen = new Set();

                    for (const div of containers) {
                        const text = div.innerText || '';
                        const m = text.match(/Library ID:\\s*(\\d+)/);
                        if (m) {
                            const adId = m[1];
                            if (seen.has(adId)) continue;
                            if (text.length > 50 && text.length < 3500) {
                                seen.add(adId);
                                const lines = text.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
                                let pageName = '';
                                let adCopy = [];
                                let isAfterSponsored = false;

                                for (let i = 0; i < lines.length; i++) {
                                    const line = lines[i];
                                    if (line === 'Sponsored' && i > 0) {
                                        pageName = lines[i - 1];
                                        isAfterSponsored = true;
                                        continue;
                                    }
                                    if (isAfterSponsored) {
                                        if (line.includes('Library ID') || line.includes('Started running') || line.includes('See ad details')) {
                                            continue;
                                        }
                                        adCopy.push(line);
                                    }
                                }

                                const links = Array.from(div.querySelectorAll('a')).map(a => a.href);

                                results.push({
                                    adId: adId,
                                    pageName: pageName || 'Facebook Advertiser',
                                    adText: adCopy.join('\\n').trim() || text.substring(0, 500),
                                    links: links
                                });
                            }
                        }
                    }
                    return results;
                }''')

                for c in raw_cards:
                    ad_id = c['adId']
                    if ad_id not in collected_ads:
                        raw_text = c['adText']
                        links = c.get('links', [])
                        page_name = c['pageName']
                        phone = extract_phone(raw_text)
                        primary_url = extract_url(raw_text, links)
                        
                        collected_ads[ad_id] = {
                            "adId": ad_id,
                            "pageName": page_name,
                            "pageId": None,
                            "adText": raw_text,
                            "primaryLinkUrl": primary_url,
                            "phoneNumber": phone,
                            "facebookAdUrl": f"https://www.facebook.com/ads/library/?id={ad_id}",
                            "startDate": None
                        }

                        if len(collected_ads) >= target_count:
                            break

            except Exception as e:
                # Log error to stderr so stdout remains clean JSON
                sys.stderr.write(f"Error crawling keyword '{kw}': {e}\n")

        browser.close()

    return list(collected_ads.values())

if __name__ == "__main__":
    count = 25
    keywords = None

    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        count = int(sys.argv[1])
    elif len(sys.argv) > 1:
        keywords = [sys.argv[1]]
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            count = int(sys.argv[2])

    ads = scrape_ads(keywords, target_count=count)
    # Output pure JSON to stdout
    print(json.dumps(ads, ensure_ascii=False, indent=2))
