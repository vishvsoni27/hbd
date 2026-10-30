# 🎀 Hetaxii Birthday Website

Pure HTML + CSS + JS. Koi build step ya library nahi chahiye.

## Kaise chalayein
- Computer pe: `index.html` double-click karo (Chrome/Edge).
- Phone pe bhejna hai to **hosting** karo (neeche dekho). Hosted `https` link pe hi mic se candle phoonkna kaam karta hai.

## Photos kaise daalein
`photos/` folder me apni photos is naam se rakho:

```
photos/1.jpg  photos/2.jpg  ...  photos/8.jpg
```
(png / jpeg / webp bhi chalega.) Jo photo nahi milegi uski jagah cute dummy dikhega, to 3-4 hi ho to bhi chalega.
Photo ka caption aur peeche wali line `js/config.js` me `photos:` ke andar badal sakte ho.

## Text / letter / quiz badalna
Sab kuch **`js/config.js`** me hai: welcome lines, kahani, love quiz, coupons, love letter (apni baatein zaroor likhna!), finale.
`{name}` = Hetaxii, `{nick}` = Hetiee, `{from}` = tumhara naam.

## Apna music daalna (optional)
- `music/bgm.mp3`: peeche chalne wala emotional song
- `music/party.mp3`: last page ki party

Na daalo to site khud ka emotional music-box + party beat bajati hai.

## Free hosting (2 minute)
**Netlify Drop** (sabse easy): https://app.netlify.com/drop pe poora `hetaxii-birthday` folder drag-drop karo. Link mil jayega, WhatsApp pe bhej do.
Ya **GitHub Pages / Vercel** bhi chalega.

## Tips
- Phone me **silent mode off** rakhna, warna iPhone pe sound nahi aayega.
- Pehle page pe gift pe tap karte hi music shuru hota hai (browser ki rule hai ki sound tap ke baad hi chalta hai).
- Seedha kisi page pe jaake test karna ho: `index.html?all=1` (sab unlock) ya `index.html?s=cake` (cake page se start). Pages: `welcome decor cake story gallery games letter party`.
