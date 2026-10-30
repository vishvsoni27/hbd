/* =====================================================================
   ✏️  YAHAN SE SAB EDIT KARO — sirf is file me text/photos badalna hai.
   Tokens:  {name} = Hetaxii   {nick} = Hetiee   {from} = tumhara naam
   ===================================================================== */
const CONFIG = {
  name: 'Hetaxii',
  nick: 'Hetiee',
  from: 'Vishv',

  // Birthday (month 1-12). Countdown isi se banta hai.
  birthday: { month: 10, day: 31 },

  // Cake pe kitni candles (age ya jo bhi number pasand ho, 3 se 7 best lagta hai)
  candles: 5,

  // Apna favourite song chahiye? mp3 file music/ folder me daalo, bas naam yehi rakho.
  // File na mile to site khud ka emotional music bajati hai.
  music: { bgm: 'music/bgm.mp3', party: 'music/party.mp3' },

  welcome: [
    'Hey {nick}... 🌸',
    'Aaj ka din bahut khaas hai.',
    'Kyunki aaj meri favourite insaan ka birthday hai 🎀',
    'Main thoda door hu, to kya hua... tumhare liye ek chhota sa surprise bana ke laya hu 💌'
  ],

  // Photos: photos/ folder me 1.jpg, 2.jpg ... 8.jpg naam se daalo (png/jpeg/webp bhi chalega).
  // Jo photo nahi milegi uski jagah cute dummy dikhega.
  photos: [
    { caption: 'Pehli mulaqaat 🥹', note: 'Us din ke baad se mera har din thoda better ho gaya.' },
    { caption: 'Tumhari smile ✨', note: 'Isi smile pe toh dil haar baitha.' },
    { caption: 'Pagal hum dono 😜', note: 'Tum aur main = ek number ke pagal.' },
    { caption: 'Doosri mulaqaat 💗', note: 'Kaash time ruk jaata us din.' },
    { caption: 'Selfie time 📸', note: 'Ye wali photo meri phone ki favourite hai.' },
    { caption: 'Tumhari hasi 🌷', note: 'Isse pyaari awaaz kuch nahi.' },
    { caption: 'Hamari yaadein 🎞️', note: 'Aur bahut saari banani baaki hain.' },
    { caption: 'Jaldi phir milenge 🤍', note: 'Ye promise hai. Pakka wala.' }
  ],

  // Hamari kahani (timeline). photo = upar wali photos list ka index (0 se start)
  story: [
    { title: 'Jab baat shuru hui 28-feb-2026 📱', text: 'Ek chhota sa message, aur pata nahi kab wo roz ki aadat ban gayi. Ab din tumse baat kiye bina adhura lagta hai.', photo: 0 },
    { title: 'Phir hum mile 🥹', text: 'Screen ke us paar se ek din tum saamne aa gayi. Dil ne bola, "yahi hai woh." Aur dil galat nahi tha.', photo: 1 },
    { title: 'Doosri baar bhi 💞', text: 'Doosri mulaqaat me toh jaise saalon ki pehchaan thi. Waqt ka pata hi nahi chala, bas tum thi aur main tha.', photo: 2 },
    { title: 'Aur aaj... 🎂', text: 'Aaj meri sabse pyaari insaan ka birthday hai. Door hu, par dil se ekdum paas.', photo: 3 }
  ],

  stats: [
    { value: 2, label: 'baar mile hum' },
    { value: '∞', label: 'baatein, calls aur memes' },
    { value: 0, label: 'km dil ke beech' }
  ],

  // Love quiz — sab answers pyaare hain, koi galat nahi 😌 (edit karke apne jawab daal sakte ho)
  quiz: [
    {
      q: '{from} ka sabse favourite insaan kaun hai?',
      a: [['{nick} 💗', 'Obviously! Ye bhi koi poochne wali baat hai 😌'],
      ['{name} 🎀', 'Sahi pakde hain! Full marks.'],
      ['Meri Mummy 😂', 'Mummy number 2 pe, pehla number tumhara 🫶'],
      ['Khud {from} 😎', 'Haha! Chalo, tab bhi tum meri doosri favourite ho 😜']]
    },
    {
      q: 'Hum dono ki sabse badi superpower kya hai?',
      a: [['Door reh ke bhi paas rehna 💫', 'Bilkul! Yahi toh hamara jaadu hai.'],
      ['Bina baat ke hasna 🤭', 'Aur phir baat pe bhi hasna 😂'],
      ['Ghanto baatein karna 📞', 'Aur phir bhi "aur bata" bolna 😌'],
      ['Sab kuch 😎', 'Correct answer! 🎉']]
    },
    {
      q: 'Agar abhi mil jaayein to pehle kya karenge?',
      a: [['Tight wala hug 🤗', 'Aur itna tight ki chhodne ka mann hi na kare.'],
      ['Ice cream khane jaayenge 🍦', 'Deal! Treat meri taraf se.'],
      ['Dher saari selfies 📸', 'Phone ki gallery full karni hai.'],
      ['Bas baithke dekhte rahenge 🥹', 'Mera answer bhi yehi tha 💗']]
    },
    {
      q: 'Birthday girl ko kya milna chahiye?',
      a: [['Bada sa cake 🎂', 'Pehle se hi kaat diya, next stage me 😉'],
      ['Gift 🎁', 'Coupons ready hain, games me milenge!'],
      ['Ek lamba hug 🫂', 'Ye toh pending hai, jaldi milega.'],
      ['Sab kuch + mujhe 😌', 'Package deal approved ✅']]
    },
    {
      q: 'Hetiee ki sabse pyaari cheez?',
      a: [['Smile 😊', 'Dil gaya isi pe.'],
      ['Awaaz 🎶', 'Mera favourite sound.'],
      ['Pagalpan 🤪', 'Same to same, hum dono pagal hain.'],
      ['Sab kuch 💖', 'Perfect score! Tum jeet gayi 🏆']]
    }
  ],

  // Scratch coupons (games me)
  coupons: [
    { emoji: '🤗', title: 'Ek Tight Hug', sub: 'Valid forever, milte hi redeem hoga' },
    { emoji: '🍽️', title: 'Dinner Date', sub: 'Menu tumhara, bill mera' },
    { emoji: '🎬', title: 'Movie + Popcorn', sub: 'Video call pe bhi chalega 😌' }
  ],

  // Love letter — apni baatein add/edit karna mat bhoolna ✍️
  letter: [
    'Meri pyaari {nick},',
    'Happy Birthday meri jaan! 🎂 Aaj ka din sirf tumhara hai, aur mera bas ek hi wish hai: tumhari har wish poori ho.',
    'Hum door hain, itne door ki kabhi kabhi ye doori bahut chubhti hai. Do baar hi toh mile hain hum, par un do mulaqaaton ne meri life me itni yaadein bhar di hain jitni kuch logon ko saalon me nahi milti.',
    'Tumse baat karte hue din kab nikal jaata hai pata hi nahi chalta. Tumhari hansi, tumhara pagalpan, tumhara har chhota sa "sunn na..." mere din ko khaas bana deta hai.',
    'Mujhe pata hai aaj main tumhare saath nahi hu, aur ye baat mujhe bahut khalti hai. Par ye promise hai ki ek din ye doori bhi khatam hogi, aur tab is cake ka asli wala piece main khud khilaunga 😌🍰',
    'Tab tak mera dil tumhare paas hi hai.',
    'Tum hamesha aise hi hasti raho, chamakti raho, aur meri life ka sabse pyaara hissa banke raho. Happy Birthday once again, meri {nick}! 💗',
    'Hamesha tumhara,',
    '{from}'
  ],

  finale: 'Aur haan... next time ye party sach me karenge, saath me, bina screen ke 🥹💗'
};

/* ---------------- helpers (edit karne ki zaroorat nahi) ---------------- */
const T = (s) => String(s)
  .replace(/\{name\}/g, CONFIG.name)
  .replace(/\{nick\}/g, CONFIG.nick)
  .replace(/\{from\}/g, CONFIG.from);

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Dummy photo (SVG) + real photo loader with extension fallback */
function placeholderPhoto(i) {
  const hues = [335, 345, 355, 325, 315, 350, 340, 330];
  const emo = ['🌸', '🧸', '💌', '🎀', '🍰', '✨', '🌙', '💖'];
  const h = hues[i % hues.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='700' viewBox='0 0 600 700'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
  <stop offset='0' stop-color='hsl(${h},100%,92%)'/><stop offset='1' stop-color='hsl(${h + 15},95%,80%)'/></linearGradient></defs>
  <rect width='600' height='700' fill='url(#g)'/>
  <circle cx='90' cy='90' r='60' fill='#fff' opacity='.35'/><circle cx='520' cy='620' r='90' fill='#fff' opacity='.3'/>
  <text x='300' y='350' font-size='170' text-anchor='middle'>${emo[i % emo.length]}</text>
  <text x='300' y='450' font-family='Georgia,serif' font-size='40' font-style='italic' text-anchor='middle' fill='#b0125f'>Yaha hamari photo</text>
  <text x='300' y='505' font-family='Georgia,serif' font-size='40' font-style='italic' text-anchor='middle' fill='#b0125f'>aayegi 📸</text>
  <text x='300' y='580' font-family='monospace' font-size='26' text-anchor='middle' fill='#d6558f'>photos/${i + 1}.jpg</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function photoEl(i, alt) {
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];
  const img = new Image();
  let k = 0;
  img.alt = alt || '';
  img.draggable = false;
  const next = () => {
    if (k < exts.length) img.src = `photos/${i + 1}.${exts[k++]}`;
    else { img.onerror = null; img.src = placeholderPhoto(i); img.classList.add('is-dummy'); }
  };
  img.onerror = next;
  next();
  return img;
}
