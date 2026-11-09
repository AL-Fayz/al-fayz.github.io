# AL-FAYZ — elektron menyu

Halal o'zbek restorani AL-FAYZ uchun mobil menyu (경기도 시흥시 정왕동 1594-12, 2층 · 010-8126-0990).

Oddiy statik sayt: `index.html`, `style.css`, `app.js`, `menu.json`, `images/`.

## Narxni o'zgartirish
`menu.json` faylini oching, taomni toping va `"price"` raqamini o'zgartiring (vergulsiz yozing: `12000`).

## Rasmni almashtirish
Yangi rasmni `images/` papkasiga **aynan shu nom bilan** qo'ying (masalan `images/plov.webp`) — eskisining ustidan yozing.
Rasm 4:3 nisbatda (masalan 800×600) bo'lsa eng chiroyli ko'rinadi. `.jpg` ishlatmoqchi bo'lsangiz, `menu.json` dagi `"image"` yo'lini ham `images/plov.jpg` qilib o'zgartiring.

## Yangi taom qo'shish
`menu.json` dagi `"items"` ro'yxatiga bitta taomni nusxalab qo'ying, `id`ni yangi qiling, `cat`ni tanlang
(`main`, `soups`, `salads`, `drinks`, `extras`, `desserts`, `preorder`) va 4 tildagi nom/tavsifni yozing.
Taomni vaqtincha yashirish uchun unga `"hidden": true` qo'shing.

Link oxiriga `?lang=ko` (yoki `uz`, `en`, `ru`) qo'shsangiz, menyu o'sha tilda ochiladi.

## Oshpaz paneli — taomni vaqtincha o'chirish, video qo'shish
Manzili: **https://al-fayz.github.io/oshpaz.html** (menyuda havolasi yo'q, qidiruv tizimlari ko'rsatmaydi).

- Birinchi kirishda GitHub kaliti (fine-grained token: owner **AL-Fayz**, faqat **al-fayz.github.io**,
  *Contents: Read and write*) va PIN-kod kiritiladi. Kalit telefonning o'zida, PIN bilan shifrlangan holda saqlanadi.
- **Taomlar**: taomni bosish uni BOR ↔ YO'Q qiladi. O'chirilgan taomlar `status.json` faylida turadi va mijozlarga ko'rinmaydi.
- **Videolar**: YouTube (oddiy video, Shorts) yoki Instagram (Reels) havolasi qo'shiladi va `videos.json` fayliga yoziladi.
- Har bir saqlash GitHub'da alohida commit bo'ladi va saytda 1–2 daqiqada ko'rinadi.
- PIN esdan chiqsa: "qaytadan sozlash" tugmasini bosing va kalitni qayta kiriting.
- Telefon yo'qolsa: GitHub → Settings → Developer settings → Personal access tokens sahifasida kalitni o'chiring.
