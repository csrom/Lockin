/* Lock In · logika appky (Supabase) */
(function () {
  "use strict";

  // ─── Obsah ────────────────────────────────────────────
  const ICON = {
    clean: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    move: '<path d="M2 12h2M20 12h2M6.5 8v8M17.5 8v8M4 9.5v5M20 9.5v5M6.5 12h11"/>',
    mind: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M12 6.5v5M9.8 8.5h4.4"/>',
    deep: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M10 2.5h4M12 2.5V5.5"/>',
    cold: '<path d="M4 4h7a3 3 0 0 1 3 3v1M11 8h6"/><path d="M12 12v1.5M15 12.5v1.5M18 12v1.5M13 16.5v1.5M16 17v1.5M14.5 20v1"/>',
    scroll: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M10.5 18.5h3M12 7.5v4l2 1.5"/>'
  };
  const HABITS = [
    { id: "clean", t: "Čistý deň" }, { id: "move", t: "Cvičenie" }, { id: "mind", t: "Modlitba alebo Písmo" },
    { id: "deep", t: "Deep work", dur: true }, { id: "cold", t: "Studená sprcha alebo ponor" }, { id: "scroll", t: "Scrollovanie max 30 min" }
  ];
  const NEED = 5, CH = 30;
  const STAGES = [
    { at: 0, n: "Úpätie", theme: "Rozhodnutie", img: "/media/stage1.webp", v: "„Buď silný a odvážny! Neboj sa a nestrachuj.“ Joz 1,9", t: "Kríž si zdvihol. Hora je vysoká a ty ideš aj tak." },
    { at: 7, n: "Svah", theme: "Zaprenie", img: "/media/stage2.webp", v: "„Bijem svoje telo a podrobujem ho.“ 1 Kor 9,27", t: "Telo bude kričať, že chce späť. Ty rozhoduješ, nie ono." },
    { at: 14, n: "Polovica hory", theme: "Vytrvalosť", img: "/media/stage3.webp", v: "„Budú bežať a neustanú.“ Iz 40,31", t: "Nadšenie je preč, ostala disciplína. Teraz sa ukáže, kto naozaj ide." },
    { at: 21, n: "Hrebeň", theme: "Boj", img: "/media/stage4.webp", v: "„Vezmite si Božiu výzbroj, aby ste odolali v zlý deň.“ Ef 6,13", t: "Búrka je najsilnejšia tesne pod vrcholom. Stoj. Neotáčaj sa." },
    { at: 30, n: "Vrchol", theme: "Víťazstvo", img: "/media/vrchol.webp", v: "„Dobrý boj som bojoval, beh som dokončil.“ 2 Tim 4,7", t: "Zapichol si kríž na vrchole. Nie si tým, kým si bol pred 30 dňami." }
  ];
  const ROT = [
    ["Večer pri hre", "Zaslúžený večer bez výčitiek. Zahrajte si spolu klasiku priamo v prehliadači:", true],
    ["Otužovanie alebo sauna", "Každý podľa možností, dôkaz fotkou parťákovi."],
    ["List sebe o rok", "Napíš, kým chceš byť o rok, a pošli to parťákovi. Otvoríte ho na vrchole."],
    ["Svitanie", "V jeden deň vstaňte pred východom slnka, vyjdite von a pošlite si fotku. Vrchol je blízko."],
    ["Výbeh na vrchol alebo túra", "Finále 30 dní. Spolu hore na vrchol, debrief na vrchole a otvorenie listov."]
  ];
  const GAMES = [
    ["Counter-Strike 1.6", "https://cs-online.club/en/servers", "klasika, servery v Európe, bez inštalácie"],
    ["Need for Speed Underground 2", "https://nfsu2.xyz/", "fanúšikovská verzia v prehliadači, online s kamošmi"],
    ["Azeroth Survivors", "https://wow.aethus.pl/", "roguelike vo svete WoW, fanúšikovský projekt, zadarmo"],
    ["World of ClaudeCraft", "https://worldofclaudecraft.com/", "MMORPG vo štýle WoW vytvorené s AI, zadarmo"]
  ];
  const DN = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const DNL = ["v pondelok", "v utorok", "v stredu", "vo štvrtok", "v piatok", "v sobotu", "v nedeľu"];

  // ─── Pomocníci ────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s || "").trim().toLowerCase();
  const DAY = 864e5;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const fromIso = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const between = (a, b) => Math.round((b - a) / DAY);
  const dn = d => DN[(d.getDay() + 6) % 7];

  // ─── Supabase ─────────────────────────────────────────
  const cfg = window.LOCKIN_CONFIG || {};
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" }
  });

  // ─── Stav ─────────────────────────────────────────────
  let user = null, me = null, partner = null;
  const days = {};          // user_id -> { iso: habits }
  let tab = "dnes", sel = null, viewing = "me";

  const docOf = p => ({ start: p.start_date, days: days[p.id] || {} });
  const pm = () => partner ? [docOf(me), docOf(partner)] : [docOf(me)];
  const pairStart = docs => docs.map(d => d.start).sort().slice(-1)[0];
  const cnt = (doc, d) => { const r = doc.days[iso(d)] || {}; return HABITS.filter(h => r[h.id] === true).length; };
  const good = (doc, d) => cnt(doc, d) >= (d.getDay() === 0 ? 1 : NEED);
  const dayIdx = (d, docs) => { const x = between(fromIso(pairStart(docs)), d); return ((x % CH) + CH) % CH; };
  const cycleStart = (d, docs) => add(d, -dayIdx(d, docs));
  const blockStart = (d, docs) => add(d, -(dayIdx(d, docs) % 7));
  const blockLen = (b, docs) => Math.min(7, CH - dayIdx(b, docs));
  const nowOrStart = docs => { const s = fromIso(pairStart(docs)); return today < s ? s : today; };
  const goodInCycle = docs => {
    const c = cycleStart(nowOrStart(docs), docs); let n = 0;
    for (let i = 0; i < CH; i++) { const x = add(c, i); if (x <= today && docs.every(dc => good(dc, x))) n++; }
    return n;
  };

  // ─── Navigácia ────────────────────────────────────────
  const VIEWS = ["intro", "login", "join", "dnes", "vystup", "skupina", "profil"];
  function show(view) {
    VIEWS.forEach(v => $("v-" + v).hidden = v !== view);
    const inApp = ["dnes", "vystup", "skupina", "profil"].includes(view);
    $("tabs").hidden = !inApp;
    document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-current", b.dataset.tab === view ? "page" : "false"));
    const vid = $("heroVideo"); if (vid) { if (view === "intro") vid.play().catch(() => {}); else vid.pause(); }
    window.scrollTo(0, 0);
  }
  function go(t) { tab = t; render(); show(t); }
  document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => go(b.dataset.tab));

  // ─── Načítanie dát ────────────────────────────────────
  async function loadAll() {
    const { data: prof, error } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) throw error;
    me = prof;
    if (!me) return false;
    partner = null;
    if (norm(me.pair_code)) {
      const { data: ps } = await sb.from("profiles").select("*").neq("id", user.id).limit(5);
      partner = (ps || []).find(p => norm(p.pair_code) === norm(me.pair_code)) || null;
    }
    const ids = [me.id].concat(partner ? [partner.id] : []);
    const since = iso(add(today, -70));
    const { data: rows, error: e2 } = await sb.from("days").select("user_id,day,habits").in("user_id", ids).gte("day", since);
    if (e2) throw e2;
    ids.forEach(id => days[id] = {});
    (rows || []).forEach(r => { days[r.user_id][r.day] = r.habits || {}; });
    return true;
  }

  let booting = null;
  function boot() { if (!booting) booting = doBoot().finally(() => { booting = null; }); return booting; }
  async function doBoot() {
    $("loading").hidden = false;
    try {
      const { data } = await sb.auth.getSession();
      user = data.session ? data.session.user : null;
      if (!user) {
        show("intro");
        // chyba z prihlasovacieho odkazu (napr. vypršaný) príde v adrese
        const h = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
        if (h.get("error_description")) {
          show("login");
          $("loginMsg").textContent = "Odkaz nefungoval (" + h.get("error_description").replace(/\+/g, " ") + "). Pošli si nový.";
          history.replaceState(null, "", location.pathname);
        }
        return;
      }
      if (location.hash.includes("access_token")) history.replaceState(null, "", location.pathname);
      const ok = await loadAll();
      if (!ok) { show("join"); return; }
      sel = null; render(); show(tab);
    } catch (e) {
      console.error(e);
      show("intro");
      $("loginMsg").textContent = "Nepodarilo sa načítať dáta. Skontroluj pripojenie a skús to znova.";
    } finally { $("loading").hidden = true; }
  }
  sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_IN" || ev === "SIGNED_OUT") boot(); });

  // ─── Úvod a prihlásenie ───────────────────────────────
  $("goLogin").onclick = $("goLogin2").onclick = () => { show("login"); $("lEmail").focus(); };
  $("loginBack").onclick = () => show("intro");
  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("lEmail").value.trim();
    $("loginBtn").disabled = true;
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: cfg.siteUrl || location.origin } });
    $("loginBtn").disabled = false;
    $("loginMsg").textContent = error
      ? "Odkaz sa nepodarilo poslať: " + error.message
      : "Hotovo. Otvor e-mail na " + email + " a klikni na odkaz. Ak ho nevidíš, pozri spam.";
  });

  $("joinForm").addEventListener("submit", async e => {
    e.preventDefault();
    const row = { id: user.id, nick: $("fNick").value.trim(), pair_code: $("fPair").value.trim() || null, group_name: $("fGroup").value.trim() || null, start_date: iso(today) };
    const { error } = await sb.from("profiles").insert(row);
    if (error) { $("joinErr").hidden = false; $("joinErr").textContent = "Neuložilo sa: " + error.message; return; }
    boot();
  });

  // ─── DNES ─────────────────────────────────────────────
  function renderDnes() {
    const docs = pm();
    const showPartner = viewing === "partner" && partner;
    const doc = showPartner ? docOf(partner) : docOf(me);
    const ro = !!showPartner;
    $("who").hidden = !partner;
    if (partner) {
      $("whoMe").textContent = me.nick; $("whoPartner").textContent = partner.nick;
      $("whoMe").setAttribute("aria-pressed", !showPartner); $("whoPartner").setAttribute("aria-pressed", !!showPartner);
    }
    const ref = nowOrStart(docs), b = blockStart(ref, docs), L = blockLen(b, docs);
    if (!sel || sel < b || sel >= add(b, L)) sel = ref;
    const d = sel, future = d > today, r = doc.days[iso(d)] || {}, c = cnt(doc, d), g = good(doc, d);
    $("dayTag").textContent = "Deň " + (dayIdx(d, docs) + 1) + " / " + CH + (+d === +today ? "" : " · " + dn(d) + " " + d.getDate() + "." + (d.getMonth() + 1) + ".");
    $("scoreN").textContent = c + "/6";
    const cap = $("scoreCap"); cap.className = "cap" + (g ? " good" : "");
    cap.textContent = future ? "tento deň ešte nezačal" : g ? "dobrý deň" : (d.getDay() === 0 ? "voľná nedeľa, stačí 1 bod" : "ešte " + (NEED - c) + " do dobrého dňa");
    let wk = "";
    for (let i = 0; i < L; i++) {
      const x = add(b, i), fut = x > today, cl = good(doc, x) ? "good" : cnt(doc, x) > 0 ? "part" : "";
      wk += `<button class="wd ${cl}${+x === +d ? " sel" : ""}" data-i="${i}" ${fut ? "disabled" : ""} aria-label="${dn(x)} ${x.getDate()}."><span class="d">${dn(x)}</span><span class="dot"></span></button>`;
    }
    $("week").innerHTML = wk;
    $("week").style.gridTemplateColumns = `repeat(${Math.max(L, 5)},minmax(0,1fr))`;
    const dis = future || ro;
    $("list").innerHTML = HABITS.map(h => `<label class="item"><input type="checkbox" id="h-${h.id}" data-h="${h.id}" ${r[h.id] === true ? "checked" : ""} ${dis ? "disabled" : ""}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[h.id]}</svg>
      <span class="t">${h.t}</span>
      ${h.dur ? `<select id="dur" data-dur aria-label="Dĺžka deep work" ${dis ? "disabled" : ""}><option value="30" ${r.dur !== "60" ? "selected" : ""}>30 min</option><option value="60" ${r.dur === "60" ? "selected" : ""}>60 min</option></select>` : ""}</label>`).join("");
    $("fallBtn").hidden = ro; if (ro) $("fallNote").hidden = true;
    $("fallText").textContent = "Pád nie je koniec. Jeden bod denne môžeš vynechať, takže keď dnes dáš všetko ostatné, deň je stále dobrý. " +
      (partner ? "Napíš parťákovi a zajtra ideš ďalej." : "Zajtra ideš ďalej. Každý ďalší dobrý deň ťa ťahá dopredu.");
  }
  $("whoMe").onclick = () => { viewing = "me"; renderDnes(); };
  $("whoPartner").onclick = () => { viewing = "partner"; renderDnes(); };
  $("week").addEventListener("click", e => {
    const w = e.target.closest(".wd"); if (!w || w.disabled) return;
    const docs = pm(); sel = add(blockStart(nowOrStart(docs), docs), +w.dataset.i); renderDnes();
  });

  const timers = {};
  $("list").addEventListener("change", e => {
    if (viewing === "partner") return;
    const k = iso(sel), mine = days[me.id];
    mine[k] = Object.assign({}, mine[k]);
    if (e.target.dataset.h) mine[k][e.target.dataset.h] = e.target.checked;
    if (e.target.hasAttribute("data-dur")) mine[k].dur = e.target.value;
    renderDnes();
    $("savedMsg").textContent = "Ukladám…";
    clearTimeout(timers[k]);
    timers[k] = setTimeout(async () => {
      const { error } = await sb.from("days").upsert({ user_id: me.id, day: k, habits: mine[k], updated_at: new Date().toISOString() });
      $("savedMsg").textContent = error ? "Neuložilo sa, skús to znova." : "Uložené";
    }, 450);
  });
  $("fallBtn").onclick = () => { $("fallNote").hidden = !$("fallNote").hidden; };

  // ─── VÝSTUP ───────────────────────────────────────────
  const blockWon = (bb, docs) => { const L = blockLen(bb, docs); for (let i = 0; i < L; i++) { const x = add(bb, i); if (!docs.every(dc => good(dc, x))) return false; } return true; };
  function renderVystup() {
    const docs = pm(), gd = goodInCycle(docs), si = STAGES.filter(s => gd >= s.at).length - 1, s = STAGES[si];
    const wk = Math.floor(dayIdx(nowOrStart(docs), docs) / 7);
    $("stageImg").style.backgroundImage = `url("${s.img}")`;
    $("stageTitle").textContent = (si === 4 ? "Vrchol" : "Týždeň " + Math.min(wk + 1, 4)) + " · " + s.theme;
    $("stageVerse").textContent = s.v;
    $("stageText").textContent = s.t;
    $("path").innerHTML = '<span class="fill" id="pathFill"></span>' + STAGES.map((x, i) =>
      `<div class="stop ${i < si ? "on" : ""}${i === si ? " now" : ""}"><i></i>${x.n}<small>${x.at === 0 ? "štart" : "deň " + x.at}</small></div>`).join("");
    requestAnimationFrame(() => { const p = $("path"), st = p.querySelectorAll(".stop"); $("pathFill").style.height = Math.max(0, p.offsetHeight - st[si].offsetTop - 20) + "px"; });
    $("progBar").style.width = (gd / CH * 100) + "%"; $("progTxt").textContent = gd + " / " + CH;

    const b = blockStart(nowOrStart(docs), docs), prevB = blockStart(add(b, -1), docs), hasPrev = prevB >= fromIso(pairStart(docs));
    const sec = $("secret"), seen = me.seen || {};
    if (hasPrev && blockWon(prevB, docs) && !seen[iso(prevB)]) {
      sec.className = "card secret open";
      sec.innerHTML = `<div class="q" aria-hidden="true">!</div><b>Týždeň zamknutý</b><div class="hint">Tvoja odmena čaká.</div><button class="btn" id="revealBtn" style="margin-top:14px">Odhaliť odmenu</button>`;
      $("revealBtn").onclick = () => openReveal(prevB, docs);
    } else {
      const L = blockLen(b, docs), end = add(b, L); let ok = 0;
      for (let i = 0; i < L; i++) { const x = add(b, i); if (x <= today && docs.every(dc => good(dc, x))) ok++; }
      sec.className = "card secret";
      sec.innerHTML = `<div class="q" aria-hidden="true">?</div><b>Tajná odmena</b><div class="hint">Odhalí sa ${DNL[(end.getDay() + 6) % 7]}, ak zamkne${partner ? "te obaja" : "š"} týždeň. Zatiaľ ${ok}/${L} dobrých dní${partner ? " spolu" : ""}.</div>`;
    }
  }
  function openReveal(bb, docs) {
    const slot = Math.min(4, Math.floor(dayIdx(bb, docs) / 7));
    $("mImg").style.backgroundImage = `url("${STAGES[Math.min(4, slot + 1)].img}")`;
    $("mLabel").textContent = slot === 4 ? "Finále" : "Odmena · týždeň " + (slot + 1);
    $("mTitle").textContent = ROT[slot][0]; $("mText").textContent = ROT[slot][1];
    $("mGames").hidden = !ROT[slot][2];
    $("mGames").innerHTML = GAMES.map(g => `<a class="game" href="${g[1]}" target="_blank" rel="noopener noreferrer"><b>${esc(g[0])}</b><span>${esc(g[2])}</span></a>`).join("");
    $("mVerse").textContent = STAGES[Math.min(4, slot + 1)].v;
    $("modal").hidden = false; $("mClose").focus();
    me.seen = Object.assign({}, me.seen, { [iso(bb)]: true });
    sb.from("profiles").update({ seen: me.seen }).eq("id", me.id).then(() => {});
  }
  $("mClose").onclick = () => { $("modal").hidden = true; renderVystup(); };

  // ─── SKUPINA ──────────────────────────────────────────
  async function renderSkupina() {
    const [g, p] = await Promise.all([sb.rpc("leaderboard_groups"), sb.rpc("leaderboard_pairs")]);
    const mg = norm(me.group_name);
    if (g.error) $("groups").innerHTML = `<div class="row"><span></span><span class="nm"><small>Rebríček sa nepodarilo načítať.</small></span><span></span></div>`;
    else {
      const rows = g.data || [];
      $("groups").innerHTML = rows.length ? rows.map((x, i) => `<div class="row${i === 0 ? " top" : ""}${norm(x.group_name) === mg ? " me" : ""}"><span class="rk">${i + 1}</span><span class="nm">${esc(x.group_name)}${norm(x.group_name) === mg ? '<span class="tag">tvoja</span>' : ""}<small>${x.members} ${x.members === 1 ? "člen" : x.members < 5 ? "členovia" : "členov"}</small></span><span class="sc">${x.pct} %</span></div>`).join("")
        : `<div class="row"><span></span><span class="nm"><small>Zatiaľ žiadna skupina. Zadaj názov skupiny v profile.</small></span><span></span></div>`;
    }
    if (p.error) $("pairs").innerHTML = `<div class="row"><span></span><span class="nm"><small>Rebríček sa nepodarilo načítať.</small></span><span></span></div>`;
    else {
      const rows = p.data || [], myNames = partner ? [me.nick, partner.nick] : [];
      $("pairs").innerHTML = rows.length ? rows.map((x, i) => { const mine = myNames.length && myNames.every(n => (x.names || "").includes(n));
        return `<div class="row${i === 0 ? " top" : ""}${mine ? " me" : ""}"><span class="rk">${i + 1}</span><span class="nm">${esc(x.names)}<small>${esc(x.group_name || "")}</small></span><span class="sc">${x.days}/30</span></div>`; }).join("")
        : `<div class="row"><span></span><span class="nm"><small>Zatiaľ žiadna kompletná dvojica.</small></span><span></span></div>`;
    }
  }

  // ─── PROFIL ───────────────────────────────────────────
  function renderProfil() {
    $("pNick").value = me.nick; $("pPair").value = me.pair_code || ""; $("pGroup").value = me.group_name || "";
    $("profMsg").textContent = ""; $("acct").textContent = "Prihlásený ako " + (user.email || "");
  }
  $("profForm").addEventListener("submit", async e => {
    e.preventDefault();
    const upd = { nick: $("pNick").value.trim() || me.nick, pair_code: $("pPair").value.trim() || null, group_name: $("pGroup").value.trim() || null };
    const { error } = await sb.from("profiles").update(upd).eq("id", me.id);
    if (error) { $("profMsg").textContent = "Neuložilo sa: " + error.message; return; }
    const pairChanged = norm(upd.pair_code) !== norm(me.pair_code);
    Object.assign(me, upd);
    if (pairChanged) { await loadAll(); viewing = "me"; }
    $("profMsg").textContent = "Uložené";
  });
  $("logoutBtn").onclick = async () => { await sb.auth.signOut(); user = me = partner = null; show("intro"); };

  function render() {
    if (!me) return;
    ({ dnes: renderDnes, vystup: renderVystup, skupina: renderSkupina, profil: renderProfil })[tab]();
  }

  boot();
})();
