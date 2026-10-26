/* AL-FAYZ e-menu. Dishes, prices and descriptions live in menu.json — edit them there. */
(function () {
  "use strict";

  const LANGS = ["uz", "en", "ko", "ru"];
  const LANG_KEY = "alfayz_lang";
  const CART_KEY = "alfayz_cart";

  // interface texts (dish texts are in menu.json)
  const T = {
    uz: { tagline: "Milliy taomlar · Halal", cart: "Savatcha", yourOrder: "Buyurtmangiz", total: "Jami", call: "Qo'ng'iroq qilish", sms: "SMS orqali buyurtma",
          hint: "Buyurtma berish uchun qo'ng'iroq qiling yoki SMS yuboring.", clear: "Savatchani tozalash", empty: "Savatcha bo'sh", soon: "Tez orada",
          soonText: "Bu bo'lim tez orada to'ldiriladi.", added: "savatchaga qo'shildi", naver: "Naver xarita", kakao: "Kakao xarita",
          footnote: "Narxlar o'zgarishi mumkin. Barcha taomlar halol.", smsHead: "Assalomu alaykum! AL-FAYZ buyurtma:", smsTotal: "Jami", more: "batafsil" },
    en: { tagline: "Uzbek cuisine · Halal", cart: "Cart", yourOrder: "Your order", total: "Total", call: "Call to order", sms: "Order by SMS",
          hint: "Call us or send an SMS to place your order.", clear: "Clear cart", empty: "Your cart is empty", soon: "Coming soon",
          soonText: "This section will be filled soon.", added: "added to cart", naver: "Naver Map", kakao: "Kakao Map",
          footnote: "Prices may change. All dishes are halal.", smsHead: "Hello! AL-FAYZ order:", smsTotal: "Total", more: "more" },
    ko: { tagline: "우즈벡 전통 요리 · 할랄", cart: "장바구니", yourOrder: "주문 내역", total: "합계", call: "전화 주문", sms: "문자로 주문",
          hint: "전화 또는 문자로 주문해 주세요.", clear: "장바구니 비우기", empty: "장바구니가 비어 있습니다", soon: "곧 준비됩니다",
          soonText: "이 메뉴는 곧 추가됩니다.", added: "장바구니에 담았습니다", naver: "네이버 지도", kakao: "카카오맵",
          footnote: "가격은 변동될 수 있습니다. 모든 요리는 할랄입니다.", smsHead: "안녕하세요! AL-FAYZ 주문:", smsTotal: "합계", more: "더보기" },
    ru: { tagline: "Узбекская кухня · Халяль", cart: "Корзина", yourOrder: "Ваш заказ", total: "Итого", call: "Позвонить", sms: "Заказать по SMS",
          hint: "Позвоните или отправьте SMS, чтобы сделать заказ.", clear: "Очистить корзину", empty: "Корзина пуста", soon: "Скоро",
          soonText: "Этот раздел скоро будет заполнен.", added: "добавлено в корзину", naver: "Naver Карта", kakao: "Kakao Карта",
          footnote: "Цены могут меняться. Все блюда халяль.", smsHead: "Здравствуйте! Заказ AL-FAYZ:", smsTotal: "Итого", more: "ещё" }
  };

  const $ = (s, el = document) => el.querySelector(s);
  const won = (n) => n.toLocaleString("en-US") + "원";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  let data = null;
  // ?lang=ko in the link opens the menu straight in that language
  let lang = new URLSearchParams(location.search).get("lang") || store.get(LANG_KEY);
  let cart = {};
  try { cart = JSON.parse(store.get(CART_KEY) || "{}") || {}; } catch (e) { cart = {}; }

  const itemById = (id) => data.items.find((i) => i.id === id);
  const tx = (obj) => (obj && (obj[lang] || obj.en || obj.uz)) || "";
  const t = (k) => T[lang][k];

  /* ---------- language ---------- */
  function openLang() {
    const scr = $("#lang-screen");
    scr.querySelectorAll("button").forEach((b) => b.classList.toggle("current", b.dataset.lang === lang));
    scr.hidden = false;
  }
  function setLang(l) {
    lang = LANGS.includes(l) ? l : "uz";
    store.set(LANG_KEY, lang);
    document.documentElement.lang = lang;
    $("#lang-screen").hidden = true;
    render();
  }

  /* ---------- render ---------- */
  function placeholder(item) {
    const icon = (data.categories.find((c) => c.id === item.cat) || {}).icon || "🍽️";
    return `<div class="ph">${icon}</div>`;
  }

  function cardHTML(item) {
    const qty = cart[item.id] || 0;
    const img = item.image
      ? `<img src="${esc(item.image)}" alt="${esc(tx(item.name))}" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'🍽️'}))">`
      : placeholder(item);
    // show the Korean name as a second line for non-Korean readers (helps when ordering by phone)
    const alt = lang === "ko" ? item.name.en : item.name.ko;
    return `<article class="card${qty ? " in-cart" : ""}" data-id="${item.id}">
      <svg class="corner tl"><use href="#corner"/></svg>
      <div class="thumb">${img}</div>
      <div class="body">
        <h3 class="name">${esc(tx(item.name))}</h3>
        <div class="alt">${esc(alt)}</div>
        <p class="desc">${esc(tx(item.desc))}</p>
        <div class="foot"><span class="price">${won(item.price)}</span>${controlHTML(item.id, qty)}</div>
      </div>
    </article>`;
  }

  function controlHTML(id, qty) {
    return qty
      ? `<div class="stepper"><button data-act="dec" data-id="${id}" aria-label="-">−</button><b>${qty}</b><button data-act="inc" data-id="${id}" aria-label="+">+</button></div>`
      : `<button class="add" data-act="inc" data-id="${id}" aria-label="+">+</button>`;
  }

  function soonHTML(cat) {
    return `<div class="soon"><svg viewBox="0 0 40 40"><use href="#star"/></svg><h3>${t("soon")}</h3><p>${esc(tx(cat.note) || t("soonText"))}</p></div>`;
  }

  function render() {
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $("#lang-code").textContent = lang.toUpperCase();
    document.title = "AL-FAYZ — " + t("tagline");
    $("#f-address").textContent = tx(data.restaurant.address);

    $("#tabs-inner").innerHTML = data.categories
      .map((c) => `<a class="tab" href="#cat-${c.id}" data-cat="${c.id}"><span>${c.icon}</span>${esc(tx(c.name))}</a>`).join("");

    $("#menu").innerHTML = data.categories.map((c) => {
      const items = data.items.filter((i) => i.cat === c.id && !i.hidden);
      let body;
      if (!items.length) body = soonHTML(c);
      else if (items.some((i) => i.group)) {
        const groups = [...new Set(items.map((i) => i.group))];
        body = groups.map((g) => `<h3 class="group-title">${esc(tx(data.groups[g]))}</h3>
          <div class="grid">${items.filter((i) => i.group === g).map(cardHTML).join("")}</div>`).join("");
      } else body = `<div class="grid">${items.map(cardHTML).join("")}</div>`;
      const note = items.length && c.note ? `<p class="section-note">${esc(tx(c.note))}</p>` : "";
      return `<section class="section" id="cat-${c.id}">
        <div class="section-head"><span class="icon">${c.icon}</span><h2>${esc(tx(c.name))}</h2><div class="ornament-line"></div></div>${note}${body}</section>`;
    }).join("");

    observeCards();
    observeSections();
    updateCart();
  }

  /* ---------- animations / scroll-spy ---------- */
  let cardObs, secObs;
  function observeCards() {
    if (cardObs) cardObs.disconnect();
    if (!("IntersectionObserver" in window)) { document.querySelectorAll(".card").forEach((c) => c.classList.add("in")); return; }
    cardObs = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); cardObs.unobserve(e.target); }
    }), { rootMargin: "0px 0px -30px 0px" });
    document.querySelectorAll(".card").forEach((c) => cardObs.observe(c));
  }

  function setActiveTab(id) {
    document.querySelectorAll(".tab").forEach((tab) => {
      const on = tab.dataset.cat === id;
      if (on && !tab.classList.contains("active")) tab.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      tab.classList.toggle("active", on);
    });
  }
  function observeSections() {
    if (secObs) secObs.disconnect();
    if (!("IntersectionObserver" in window)) return;
    secObs = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) setActiveTab(e.target.id.replace("cat-", ""));
    }), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".section").forEach((s) => secObs.observe(s));
    setActiveTab(data.categories[0].id);
  }

  /* ---------- cart ---------- */
  function change(id, delta) {
    const q = Math.max(0, (cart[id] || 0) + delta);
    if (q) cart[id] = q; else delete cart[id];
    store.set(CART_KEY, JSON.stringify(cart));
    document.querySelectorAll(`.card[data-id="${id}"]`).forEach((card) => {
      card.classList.toggle("in-cart", !!q);
      $(".foot", card).lastElementChild.outerHTML = controlHTML(id, q);
    });
    if (delta > 0) {
      const bar = $("#cart-bar");
      bar.classList.remove("bump"); void bar.offsetWidth; bar.classList.add("bump");
      if (q === 1) toast(`${tx(itemById(id).name)} — ${t("added")}`);
      if (navigator.vibrate) navigator.vibrate(12);
    }
    updateCart();
  }

  function cartLines() {
    return Object.keys(cart).map((id) => ({ item: itemById(id), qty: cart[id] })).filter((l) => l.item);
  }

  function updateCart() {
    const lines = cartLines();
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
    $("#cart-bar").hidden = count === 0;
    $("#cb-count").textContent = count;
    $(".cb-label").textContent = `${t("cart")} (${count})`;
    $("#cb-total").textContent = won(total);
    $("#sheet-total").textContent = won(total);

    $("#sheet-list").innerHTML = lines.length ? lines.map(({ item, qty }) => `<li>
        ${item.image ? `<img src="${esc(item.image)}" alt="">` : `<div class="mini-ph">🍽️</div>`}
        <div class="info"><b>${esc(tx(item.name))}</b><span>${won(item.price)} × ${qty} = ${won(item.price * qty)}</span></div>
        ${controlHTML(item.id, qty)}</li>`).join("")
      : `<li class="sheet-empty">${t("empty")}</li>`;

    // SMS body: Korean name helps the staff, the chosen language helps the guest
    const body = [t("smsHead"), ...lines.map((l, i) => {
      const n = lang === "ko" ? l.item.name.ko : `${tx(l.item.name)} (${l.item.name.ko})`;
      return `${i + 1}. ${n} x${l.qty} = ${won(l.item.price * l.qty)}`;
    }), `${t("smsTotal")}: ${won(total)}`].join("\n");
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    $("#sms-btn").href = `sms:${data.restaurant.phoneRaw}${ios ? "&" : "?"}body=${encodeURIComponent(body)}`;
    if (!lines.length) closeSheet();
  }

  function openSheet() {
    $("#sheet").classList.add("open"); $("#sheet").setAttribute("aria-hidden", "false");
    $("#sheet-backdrop").hidden = false; document.body.classList.add("lock");
  }
  function closeSheet() {
    $("#sheet").classList.remove("open"); $("#sheet").setAttribute("aria-hidden", "true");
    $("#sheet-backdrop").hidden = true; document.body.classList.remove("lock");
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (btn) { change(btn.dataset.id, btn.dataset.act === "inc" ? 1 : -1); return; }
    const langBtn = e.target.closest("[data-lang]");
    if (langBtn) { setLang(langBtn.dataset.lang); return; }
    const desc = e.target.closest(".desc");
    if (desc) desc.closest(".card").classList.toggle("open");
  });
  $("#lang-btn").addEventListener("click", openLang);
  $("#cart-bar").addEventListener("click", openSheet);
  $("#sheet-close").addEventListener("click", closeSheet);
  $("#sheet-backdrop").addEventListener("click", closeSheet);
  $("#clear-cart").addEventListener("click", () => { cart = {}; store.set(CART_KEY, "{}"); render(); closeSheet(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  // swipe the sheet down to close
  let startY = null;
  $("#sheet").addEventListener("touchstart", (e) => { if (!$("#sheet-list").contains(e.target) || $("#sheet-list").scrollTop === 0) startY = e.touches[0].clientY; }, { passive: true });
  $("#sheet").addEventListener("touchend", (e) => { if (startY !== null && e.changedTouches[0].clientY - startY > 80) closeSheet(); startY = null; }, { passive: true });

  /* ---------- boot ---------- */
  fetch("menu.json", { cache: "no-cache" })
    .then((r) => r.json())
    .then((json) => {
      data = json;
      const q = encodeURIComponent(data.restaurant.mapQuery);
      $("#naver").href = `https://map.naver.com/p/search/${q}`;
      $("#kakao").href = `https://map.kakao.com/link/search/${q}`;
      if (LANGS.includes(lang)) { document.documentElement.lang = lang; store.set(LANG_KEY, lang); render(); }
      else { lang = "uz"; render(); openLang(); }
      const target = location.hash && document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    })
    .catch(() => { $("#menu").innerHTML = '<p style="text-align:center;padding:40px">menu.json could not be loaded.</p>'; });
})();
