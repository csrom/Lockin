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
    { id: "clean", t: "Čistý deň", d: "Bez porna a masturbácie" },
    { id: "move", t: "Beh alebo cvičenie", d: "Poriadne, nech tečie pot" },
    { id: "mind", t: "Modlitba a Písmo", d: "Oboje: modlitba aj kapitola z Biblie" },
    { id: "deep", t: "Deep work", d: "Sústredená práca bez mobilu a notifikácií", dur: true },
    { id: "cold", t: "Studená sprcha alebo ponor", d: "Aspoň 1 minúta studenej vody" },
    { id: "scroll", t: "Obmedzenie scrollovania", d: "Sociálne siete a videá max 30 min za deň" }
  ];
  // Nedeľné bonusy (rátajú sa do bodov v rebríčku, nie do úspešného dňa)
  const BONUS = [
    { id: "b_deed", t: "Dobrý skutok", d: "Pomôž niekomu, ideálne bez toho, aby to vedel: zavolaj starkej, pomôž susedovi, zaplať niekomu kávu, napíš kamošovi povzbudenie, daruj niečo, čo už nepotrebuješ." },
    { id: "b_self", t: "Niečo pekné pre seba", d: "Sprav niečo, čo ťa robí šťastným. Nie preto, že je to praktické, ale preto, že ťa to teší. Aj to je láska k sebe." }
  ];
  const bonusFor = d => d.getDay() === 0 ? BONUS : [];
  const NEED = 5, CH = 30;
  const STAGES = [
    { at: 0, n: "Úpätie", theme: "Rozhodnutie", img: "/media/stage1.webp", v: "„Buď silný a odvážny! Neboj sa a nestrachuj.“ Joz 1,9", t: "Kríž si zdvihol. Hora je vysoká a ty ideš aj tak." },
    { at: 7, n: "Svah", theme: "Zaprenie", img: "/media/stage2.webp", v: "„Bijem svoje telo a podrobujem ho.“ 1 Kor 9,27", t: "Telo bude kričať, že chce späť. Ty rozhoduješ, nie ono." },
    { at: 14, n: "Polovica hory", theme: "Vytrvalosť", img: "/media/stage3.webp", v: "„Budú bežať a neustanú.“ Iz 40,31", t: "Nadšenie je preč, ostala disciplína. Teraz sa ukáže, kto naozaj ide." },
    { at: 21, n: "Hrebeň", theme: "Boj", img: "/media/stage4.webp", v: "„Vezmite si Božiu výzbroj, aby ste odolali v zlý deň.“ Ef 6,13", t: "Búrka je najsilnejšia tesne pod vrcholom. Stoj. Neotáčaj sa." },
    { at: 30, n: "Vrchol", theme: "Víťazstvo", img: "/media/vrchol.webp", v: "„Dobrý boj som bojoval, beh som dokončil.“ 2 Tim 4,7", t: "Zapichol si kríž na vrchole. Nie si tým, kým si bol pred 30 dňami." }
  ];
  const ROT = [
    ["Večer pri hre", "Zaslúžený večer bez výčitiek. Zahraj si sám, s parťákom alebo s celou partiou klasiku priamo v prehliadači:", true],
    ["Otužovanie alebo sauna", "Sám, vo dvojici alebo s partiou, každý podľa možností. Pošli fotku parťákovi alebo do chatu."],
    ["List sebe o rok", "Napíš, kým chceš byť o rok. Ak ideš s niekým, pošlite si listy navzájom a otvorte ich na vrchole. Ak ideš sám, odlož si ho na finále."],
    ["Svitanie", "V jeden deň vstaň pred východom slnka a vyjdi von. Sám, s parťákom alebo s partiou, fotku pošli do chatu. Vrchol je blízko."],
    ["Výbeh na vrchol alebo túra", "Finále 30 dní. Vyjdi na vrchol sám, s parťákom alebo s celou partiou. Hore si povedz, čo ti výzva dala, a otvor list sebe."]
  ];

  const GAMES = [
    ["Counter-Strike 1.6", "https://play-cs.com/en/servers", "klasika v prehliadači, bez inštalácie"],
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
  let today = new Date(); today.setHours(0, 0, 0, 0);
  // Po polnoci sa deň uzavrie: prepočítame „dnes“ a prekreslíme.
  function tick() {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    if (+t !== +today) { today = t; sel = null; if (me) render(); }
    else if (me && tab === "dnes") deadlineUi();
  }
  setInterval(tick, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  function deadlineUi() {
    const el = $("deadline"); if (!el) return;
    el.innerHTML = "";
  }
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
  let user = null, me = null, partner = null, isAdmin = null;
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
  const VIEWS = ["intro", "login", "join", "dnes", "vystup", "skupina", "chat", "profil"];
  function show(view) {
    VIEWS.forEach(v => $("v-" + v).hidden = v !== view);
    const inApp = ["dnes", "vystup", "skupina", "chat", "profil"].includes(view);
    $("tabs").hidden = !inApp;
    document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-current", b.dataset.tab === view ? "page" : "false"));
    if (view !== "vystup") $("stageVid").pause();
    if (view !== "intro") $("tapGate").hidden = true;
    setTimeout(moreUi, 0);
    if (typeof installUi === "function") setTimeout(installUi, 0);
    const vid = $("heroVideo"); if (vid) { if (view === "intro") heroPlay(); else vid.pause(); }
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

  let recovering = location.hash.includes("type=recovery");
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
      if (recovering) {
        show("login"); $("loginForm").hidden = true; $("newPassForm").hidden = false;
        history.replaceState(null, "", location.pathname);
        return;
      }
      if (location.hash.includes("access_token")) history.replaceState(null, "", location.pathname);
      if (isAdmin === null) { const { data } = await sb.rpc("is_admin"); isAdmin = data === true; }
    const ok = await loadAll();
      if (!ok) { show("join"); return; }
      sel = null; render(); show(tab); chatBadge().catch(() => {});
    } catch (e) {
      console.error(e);
      show("intro");
      $("loginMsg").textContent = "Nepodarilo sa načítať dáta. Skontroluj pripojenie a skús to znova.";
    } finally { $("loading").hidden = true; }
  }
  // Volania Supabase priamo v tomto callbacku by sa zasekli (zámok knižnice), preto setTimeout.
  // SIGNED_IN prichádza aj pri návrate do záložky; znova načítavame len pri zmene používateľa.
  sb.auth.onAuthStateChange((ev, session) => {
    const uid = session && session.user ? session.user.id : null;
    if (ev === "SIGNED_OUT" || (ev === "SIGNED_IN" && uid !== (user && user.id))) setTimeout(boot, 0);
  });

  // ─── Úvod a prihlásenie ───────────────────────────────
  $("goLogin").onclick = $("goLogin2").onclick = () => { show("login"); $("lEmail").focus(); };
  const msg = t => { $("loginMsg").textContent = t; };
  const skErr = e => {
    const m = (e && e.message) || "";
    if (/invalid login credentials/i.test(m)) return "Nesprávny e-mail alebo heslo.";
    if (/already registered|already exists/i.test(m)) return "Tento e-mail už má účet. Prihlás sa, alebo klikni na Zabudol som heslo.";
    if (/at least 6|password should/i.test(m)) return "Heslo musí mať aspoň 6 znakov.";
    if (/email not confirmed/i.test(m)) return "E-mail ešte nie je potvrdený.";
    const w = /after (\d+) seconds/.exec(m); if (w) return "Počkaj " + w[1] + " s a skús znova.";
    return "Nepodarilo sa: " + m;
  };
  const creds = () => ({ email: $("lEmail").value.trim(), password: $("lPass").value });
  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("loginBtn").disabled = true; msg("Prihlasujem…");
    const { error } = await sb.auth.signInWithPassword(creds());
    $("loginBtn").disabled = false;
    if (error) msg(skErr(error));
  });
  $("signupBtn").onclick = async () => {
    if (!$("loginForm").reportValidity()) return;
    $("signupBtn").disabled = true; msg("Vytváram účet…");
    const { data, error } = await sb.auth.signUp(creds());
    $("signupBtn").disabled = false;
    if (error) return msg(skErr(error));
    if (!data.session) msg("Účet je vytvorený. Prihlás sa.");
  };
  $("forgotBtn").onclick = async () => {
    const email = $("lEmail").value.trim();
    if (!email) { msg("Najprv napíš svoj e-mail."); $("lEmail").focus(); return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: cfg.siteUrl || location.origin });
    msg(error ? skErr(error) : "Poslali sme ti e-mail s odkazom na nové heslo. Ak ho nevidíš, pozri spam.");
  };
  sb.auth.onAuthStateChange(ev => {
    if (ev !== "PASSWORD_RECOVERY") return;
    recovering = true;
    setTimeout(() => show("login"), 0); $("loginForm").hidden = true; $("newPassForm").hidden = false; $("lNewPass").focus();
  });
  $("newPassForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("newPassBtn").disabled = true;
    const { error } = await sb.auth.updateUser({ password: $("lNewPass").value });
    $("newPassBtn").disabled = false;
    if (error) { $("newPassMsg").textContent = skErr(error); return; }
    recovering = false; $("newPassForm").hidden = true; $("loginForm").hidden = false;
    boot();
  });
  $("loginBack").onclick = () => show("intro");

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
    const bon = bonusFor(d), bc = bon.filter(h => r[h.id] === true).length;
    $("scoreN").textContent = c + "/6";
    $("scoreN").dataset.bonus = bc ? "+" + bc + " bonus" : "";
    const cap = $("scoreCap"); cap.className = "cap" + (g ? " good" : "");
    cap.textContent = future ? "tento deň ešte nezačal" : (d < today && !g && !isAdmin) ? "deň je uzamknutý" : g ? "úspešný deň" : (d.getDay() === 0 ? "voľná nedeľa, stačí 1 bod" : "ešte " + (NEED - c) + " do úspešného dňa");
    let wk = "";
    for (let i = 0; i < L; i++) {
      const x = add(b, i), fut = x > today, cl = good(doc, x) ? "good" : cnt(doc, x) > 0 ? "part" : "";
      wk += `<button class="wd ${cl}${+x === +d ? " sel" : ""}" data-i="${i}" ${fut ? "disabled" : ""} aria-label="${dn(x)} ${x.getDate()}."><span class="d">${dn(x)}</span><span class="dot"></span></button>`;
    }
    $("week").innerHTML = wk;
    $("week").style.gridTemplateColumns = `repeat(${Math.max(L, 5)},minmax(0,1fr))`;
    const closed = d < today && !isAdmin;
    const dis = future || ro || closed;
    // Body, ktoré splnili úspešný deň, sú zamknuté (admin môže meniť)
    const locked = isAdmin ? [] : (Array.isArray(r.lock) ? r.lock : g ? HABITS.filter(h => r[h.id] === true).map(h => h.id) : []);
    $("list").innerHTML = HABITS.map(h => { const lk = r[h.id] === true && locked.includes(h.id); return `<label class="item${lk ? " locked" : ""}"><input type="checkbox" id="h-${h.id}" data-h="${h.id}" ${r[h.id] === true ? "checked" : ""} ${dis || lk ? "disabled" : ""}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[h.id]}</svg>
      <span class="t">${h.t}${lk ? '<span class="lk" title="Zamknuté – splnilo úspešný deň">🔒</span>' : ""}<small>${h.d}</small></span>
      ${h.dur ? `<select id="dur" data-dur aria-label="Dĺžka deep work" ${dis ? "disabled" : ""}><option value="30" ${r.dur !== "60" ? "selected" : ""}>30 min</option><option value="60" ${r.dur === "60" ? "selected" : ""}>60 min</option></select>` : ""}</label>`; }).join("");
    if (bon.length) $("list").innerHTML += `<div class="bonus-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5v19M7 8h10"/></svg>Nedeľný bonus</div>` + bon.map(h => `<label class="item bonus"><input type="checkbox" id="h-${h.id}" data-h="${h.id}" ${r[h.id] === true ? "checked" : ""} ${dis ? "disabled" : ""}>
      <span class="star"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5v19M7 8h10"/></svg></span><span class="t">${h.t}<small>${h.d}</small></span></label>`).join("");
    $("doneBox").hidden = !(g && !future);
    if (g && !future) {
      $("doneTitle").textContent = ro ? "Parťák má úspešný deň" : "Úspešný deň";
      $("doneSub").textContent = c + "/6 bodov" + (ro ? "" : " · " + streakOf(doc) + " " + dniWord(streakOf(doc)) + " v rade") + (ro || c >= 6 || closed ? "" : " · pokračuj, každý bod sa ráta do rebríčka");
    }
    $("lockNote").textContent = ro || future ? "" : closed ? "Tento deň je uzamknutý." : (+d === +today ? "Deň sa uzamkne o polnoci." : "");
    deadlineUi();
    $("fallBtn").hidden = ro; if (ro) $("fallNote").hidden = true;
    $("fallText").textContent = "Pád nie je koniec. Jeden bod denne môžeš vynechať, takže keď dnes dáš všetko ostatné, deň je stále úspešný. " +
      (partner ? "Napíš parťákovi a zajtra ideš ďalej." : "Zajtra ideš ďalej. Každý ďalší úspešný deň ťa ťahá dopredu.");
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
    const was = good(docOf(me), sel);
    if (e.target.dataset.h) mine[k][e.target.dataset.h] = e.target.checked;
    if (e.target.hasAttribute("data-dur")) mine[k].dur = e.target.value;
    const now = good(docOf(me), sel);
    if (!was && now) mine[k].lock = HABITS.filter(h => mine[k][h.id] === true).map(h => h.id);
    if (was && !now && isAdmin) delete mine[k].lock;
    renderDnes();
    if (!was && now) setTimeout(() => celebrate(sel), 250);
    $("savedMsg").textContent = "Ukladám…";
    clearTimeout(timers[k]);
    timers[k] = setTimeout(async () => {
      const { error } = await sb.from("days").upsert({ user_id: me.id, day: k, habits: mine[k], updated_at: new Date().toISOString() });
      $("savedMsg").textContent = error ? "Neuložilo sa, skús to znova." : "Uložené";
    }, 450);
  });

  // ─── Úspešný deň: zbalenie a oslava ───
  const expanded = {};
  const dniWord = n => n === 1 ? "deň" : n >= 2 && n <= 4 ? "dni" : "dní";
  function streakOf(doc) {
    let n = 0, x = new Date(today);
    if (!good(doc, x)) x = add(x, -1);
    while (good(doc, x) && x >= fromIso(doc.start)) { n++; x = add(x, -1); }
    return n;
  }
  function celebrate(d) {
    const docs = pm(), doc = docOf(me);
    $("winK").textContent = "Deň " + (dayIdx(d, docs) + 1) + " / " + CH;
    const st = STAGES.filter(x => goodInCycle(docs) >= x.at).length - 1;
    $("winV").textContent = STAGES[Math.max(0, st)].v;
    const k = streakOf(doc);
    $("winS").textContent = k > 1 ? "🔥 " + k + " " + dniWord(k) + " v rade" : "Prvý úspešný deň. Takto ďalej.";
    const w = $("win"); w.querySelectorAll(".spark").forEach(x => x.remove());
    const cols = ["#e9a15b", "#6f9cc9", "#ffffff", "#b9c6d4"];
    for (let i = 0; i < 46; i++) {
      const sp = document.createElement("i"), a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 260;
      sp.className = "spark"; sp.style.background = cols[i % 4];
      sp.style.setProperty("--dx", Math.cos(a) * r + "px"); sp.style.setProperty("--dy", Math.sin(a) * r + "px");
      sp.style.setProperty("--r", (Math.random() * 720 - 360) + "deg"); sp.style.animationDelay = (0.35 + Math.random() * 0.25) + "s";
      w.appendChild(sp);
    }
    w.hidden = false; $("winClose").focus();
    fanfare();
    try { navigator.vibrate && navigator.vibrate([40, 60, 120]); } catch (e) {}
  }
  // Krátka oslavná fanfára cez Web Audio (bez súboru)
  let actx = null;
  function fanfare() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t0 = actx.currentTime + 0.05, out = actx.createGain(); out.gain.value = 0.22; out.connect(actx.destination);
      const tone = (f, t, d, type = "triangle", v = 1) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.05);
      };
      // ta-ta-ta-táá (G4 C5 E5 G5) + akord C dur
      [[392, 0], [523.25, 0.13], [659.25, 0.26]].forEach(([f, dt]) => { tone(f, t0 + dt, 0.22, "square", 0.35); tone(f, t0 + dt, 0.25); });
      [523.25, 659.25, 783.99, 1046.5].forEach(f => { tone(f, t0 + 0.42, 1.6); tone(f / 2, t0 + 0.42, 1.6, "sine", 0.6); });
      tone(783.99, t0 + 0.42, 0.5, "square", 0.25);
      // trblietky
      for (let i = 0; i < 10; i++) tone(1568 + Math.random() * 1400, t0 + 0.55 + i * 0.07, 0.25, "sine", 0.25);
    } catch (e) {}
  }
  $("winClose").onclick = $("win").onclick = e => { if (e.target.closest(".btn") || e.target === $("win") || e.target.classList.contains("rays")) $("win").hidden = true; };
  $("fallBtn").onclick = () => { $("fallNote").hidden = !$("fallNote").hidden; };

  // ─── VÝSTUP ───────────────────────────────────────────
  const blockWon = (bb, docs) => { const L = blockLen(bb, docs); for (let i = 0; i < L; i++) { const x = add(bb, i); if (!docs.every(dc => good(dc, x))) return false; } return true; };
  function renderVystup() {
    const docs = pm(), gd = goodInCycle(docs), si = STAGES.filter(s => gd >= s.at).length - 1, s = STAGES[si];
    const wk = Math.floor(dayIdx(nowOrStart(docs), docs) / 7);
    $("stageImg").style.backgroundImage = `url("${s.img}")`;
    const sv = $("stageVid"); sv.pause(); sv.hidden = true;
    $("stagePlay").hidden = si < 1;
    $("stagePlay").onclick = () => {
      sv.src = si === 4 ? "/media/finale.mp4" : "/media/odmena" + si + ".mp4";
      sv.poster = si === 4 ? "/media/finale.webp" : "/media/odmena" + si + ".webp";
      sv.hidden = false; sv.muted = false; $("stagePlay").hidden = true;
      sv.play().catch(() => { sv.muted = true; sv.play(); });
    };
    sv.onended = () => { $("stagePlay").hidden = false; };
    $("stageTitle").textContent = (si === 4 ? "Vrchol" : "Týždeň " + Math.min(wk + 1, 4)) + " · " + s.theme;
    $("stageVerse").textContent = s.v;
    $("stageText").textContent = s.t;
    // Odmeny pri bodoch: Svah = 1. týždeň, Polovica = 2., Hrebeň = 3., Vrchol = 4. týždeň a finále.
    // Tlačidlo sa ukáže, keď je odmena už odhalená alebo zaslúžená.
    const cs = cycleStart(nowOrStart(docs), docs), seenAll = me.seen || {};
    const earned = k => {
      const bb = add(cs, 7 * k); if (bb < fromIso(pairStart(docs))) return null;
      const ended = add(bb, blockLen(bb, docs)) <= today;
      return seenAll[iso(bb)] || (ended && blockWon(bb, docs)) ? bb : null;
    };
    const tags = i => (i === 0 ? [] : i < 4 ? [[i - 1, "odmena"]] : [[3, "odmena"], [4, "finále"]])
      .map(([k, t]) => { const bb = earned(k); return bb ? `<button class="gtag" type="button" data-rb="${iso(bb)}" aria-label="Pozrieť odmenu: ${ROT[k][0]}">${t}</button>` : ""; }).join("");
    $("path").innerHTML = '<span class="fill" id="pathFill"></span>' + STAGES.map((x, i) =>
      `<div class="stop ${i < si ? "on" : ""}${i === si ? " now" : ""}"><i></i>${x.n}${tags(i)}<small>${x.at === 0 ? "štart" : "deň " + x.at}</small></div>`).join("");
    $("path").onclick = e => { const t = e.target.closest("[data-rb]"); if (t) openReveal(fromIso(t.dataset.rb), docs); };
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
      sec.innerHTML = `<div class="q" aria-hidden="true">?</div><b>Tajná odmena</b><div class="hint">Odhalí sa ${DNL[(end.getDay() + 6) % 7]}, ak zamkne${partner ? "te obaja" : "š"} týždeň. Zatiaľ ${ok}/${L} úspešných dní${partner ? " spolu" : ""}.</div>`;
    }
  }
  function openReveal(bb, docs) {
    const slot = Math.min(4, Math.floor(dayIdx(bb, docs) / 7));
    $("mImg").style.backgroundImage = `url("${STAGES[Math.min(4, slot + 1)].img}")`;
    const mv = $("mVid");
    mv.src = slot === 4 ? "/media/finale.mp4" : "/media/odmena" + (slot + 1) + ".mp4";
    mv.poster = slot === 4 ? "/media/finale.webp" : "/media/odmena" + (slot + 1) + ".webp";
    mv.muted = false; $("mReplay").hidden = true;
    mv.play().catch(() => { mv.muted = true; mv.play().catch(() => {}); });
    $("mLabel").textContent = slot === 4 ? "Finále" : "Odmena · týždeň " + (slot + 1);
    $("mTitle").textContent = ROT[slot][0]; $("mText").textContent = ROT[slot][1];
    $("mGames").hidden = !ROT[slot][2];
    $("mGames").innerHTML = GAMES.map(g => `<a class="game" href="${g[1]}" target="_blank" rel="noopener noreferrer"><b>${esc(g[0])}</b><span>${esc(g[2])}</span></a>`).join("");
    $("mVerse").textContent = STAGES[Math.min(4, slot + 1)].v;
    $("modal").hidden = false; $("mClose").focus();
    me.seen = Object.assign({}, me.seen, { [iso(bb)]: true });
    sb.from("profiles").update({ seen: me.seen }).eq("id", me.id).then(() => {});
  }
  $("mClose").onclick = () => { $("mVid").pause(); $("modal").hidden = true; renderVystup(); };
  $("mVid").onended = () => { $("mReplay").hidden = false; };
  $("mReplay").onclick = () => { const v = $("mVid"); v.currentTime = 0; v.muted = false; v.play(); $("mReplay").hidden = true; };

  // Úvodné video: zvuk je predvolene zapnutý. Ak prehliadač nedovolí zvuk bez interakcie,
  // video ide potichu a zvuk sa zapne pri prvom dotyku/kliknutí kdekoľvek na stránke.
  let heroWantSound = true;
  try { heroWantSound = localStorage.getItem("lockinSound") !== "off"; } catch (e) {}
  const heroUi = () => {
    const on = !$("heroVideo").muted;
    $("heroSound").classList.toggle("on", on);
    $("heroSound").setAttribute("aria-label", on ? "Stlmiť zvuk" : "Zapnúť zvuk");
  };
  function heroPlay() {
    const v = $("heroVideo");
    v.muted = !heroWantSound;
    v.play().then(() => { $("tapGate").hidden = true; heroUi(); }).catch(() => {
      // Prehliadač nedovolil zvuk bez interakcie: video ide potichu a ukážeme výzvu na ťuknutie.
      v.muted = true; heroUi(); v.play().catch(() => {});
      $("tapGate").hidden = !heroWantSound;
    });
  }
  function heroUnmute() {
    const v = $("heroVideo");
    $("tapGate").hidden = true;
    if (!heroWantSound || !v.muted || $("v-intro").hidden) return;
    v.muted = false; v.currentTime = 0; v.play().catch(() => {}); heroUi();
  }
  $("tapGate").onclick = heroUnmute;
  // Záloha: prvá interakcia kdekoľvek na úvode zapne zvuk.
  const unlock = e => {
    if (e.target.closest && e.target.closest("#heroSound, #tapGate")) return;
    const v = $("heroVideo");
    if (heroWantSound && v.muted && !$("v-intro").hidden) { $("tapGate").hidden = true; v.muted = false; v.play().catch(() => {}); heroUi(); }
  };
  ["pointerdown", "mousedown", "touchend", "keydown"].forEach(t => document.addEventListener(t, unlock, { capture: true, once: false }));
  $("heroSound").onclick = () => {
    const v = $("heroVideo");
    heroWantSound = v.muted;
    try { localStorage.setItem("lockinSound", heroWantSound ? "on" : "off"); } catch (e) {}
    v.muted = !heroWantSound; if (heroWantSound) v.play().catch(() => {});
    $("tapGate").hidden = true; heroUi();
  };

  // „Pravidlá nižšie“ zmizne, keď sa začne posúvať
  const moreUi = () => { const m = document.querySelector(".more"); if (m) m.classList.toggle("gone", window.scrollY > 60 || $("v-intro").hidden); };
  window.addEventListener("scroll", moreUi, { passive: true });
  window.addEventListener("load", () => setTimeout(moreUi, 50));

  // ─── SKUPINA ──────────────────────────────────────────
  let lbTab = "players", lbData = null;
  document.querySelectorAll("[data-lb]").forEach(bt => bt.onclick = () => { lbTab = bt.dataset.lb; drawLb(); });
  async function renderSkupina() {
    if (!lbData) $("lbList").innerHTML = '<div class="row"><span></span><span class="nm"><small>Načítavam…</small></span><span></span></div>';
    const [g, p, pl] = await Promise.all([sb.rpc("leaderboard_groups"), sb.rpc("leaderboard_pairs"), sb.rpc("leaderboard_players")]);
    lbData = { groups: g, pairs: p, players: pl };
    drawLb();
  }
  function drawLb() {
    document.querySelectorAll("[data-lb]").forEach(bt => bt.setAttribute("aria-selected", bt.dataset.lb === lbTab));
    if (!lbData) return;
    const res = lbData[lbTab], mg = norm(me.group_name), myNames = partner ? [me.nick, partner.nick] : [];
    const has = (res.data || []).some(x => x.points !== undefined && x.points !== null);
    const b = n => n + " b";
    const usp = n => n + (n === 1 ? " úspešný deň" : n >= 2 && n <= 4 ? " úspešné dni" : " úspešných dní");
    const cfg = {
      players: { note: has ? "Body = odkliknuté aktivity vo výzve. Kto má viac, vedie." : "Úspešné dni v aktuálnej výzve", empty: "Zatiaľ nikto.",
        map: x => has
          ? ({ name: x.nick, sub: (x.group_name || "sólo") + " · " + usp(x.days), score: b(x.points), val: x.points / 180, mine: x.nick === me.nick && norm(x.group_name) === mg })
          : ({ name: x.nick, sub: (x.group_name || "sólo") + " · " + x.pct + " % za 7 dní", score: x.days + "/30", val: x.days / 30, mine: x.nick === me.nick && norm(x.group_name) === mg }) },
      pairs: { note: has ? "Body oboch spolu za posledných 30 dní" : "Dni, keď boli úspešní obaja · posledných 30 dní", empty: "Zatiaľ žiadna kompletná dvojica. Zadajte s parťákom rovnaký kód dvojice v profile.",
        map: x => has
          ? ({ name: x.names, sub: (x.group_name ? x.group_name + " · " : "") + x.days + " " + dniWord(x.days) + " úspešní obaja", score: b(x.points), val: x.points / 360, mine: myNames.length && myNames.every(n => (x.names || "").includes(n)) })
          : ({ name: x.names, sub: x.group_name || "", score: x.days + "/30", val: x.days / 30, mine: myNames.length && myNames.every(n => (x.names || "").includes(n)) }) },
      groups: { note: has ? "Priemerné body na člena · posledných 7 dní" : "Percento úspešných dní · posledných 7 dní", empty: "Zatiaľ žiadna skupina. Zadaj názov skupiny v profile.",
        map: x => {
          const m = x.members + " " + (x.members === 1 ? "člen" : x.members < 5 ? "členovia" : "členov");
          return has
            ? ({ name: x.group_name, sub: m + " · " + x.pct + " % úspešných dní", score: String(x.points).replace(".", ",") + " b", val: x.points / 42, mine: norm(x.group_name) === mg })
            : ({ name: x.group_name, sub: m, score: x.pct + " %", val: x.pct / 100, mine: norm(x.group_name) === mg });
        } }
    }[lbTab];
    $("lbNote").textContent = cfg.note;
    if (res.error) { $("podium").innerHTML = ""; $("myPos").hidden = true; $("lbList").innerHTML = '<div class="row"><span></span><span class="nm"><small>Rebríček sa nepodarilo načítať.</small></span><span></span></div>'; return; }
    const rows = (res.data || []).map(cfg.map);
    const ini = n => esc((n || "?").trim().charAt(0).toUpperCase());
    const pod = (r, i) => r ? `<div class="pod p${i + 1}${r.mine ? " me" : ""}"><div class="av">${i === 0 ? '<span class="crown">👑</span>' : ""}${ini(r.name)}</div><div class="nm">${esc(r.name)}</div><div class="sc">${esc(r.score)}</div><div class="step">${i + 1}</div></div>` : "<div></div>";
    $("podium").innerHTML = rows.length ? pod(rows[1], 1) + pod(rows[0], 0) + pod(rows[2], 2) : "";
    const myI = rows.findIndex(r => r.mine);
    $("myPos").hidden = myI < 0;
    if (myI >= 0) $("myPos").innerHTML = `<span>${lbTab === "groups" ? "Tvoja skupina" : lbTab === "pairs" ? "Vaša dvojica" : "Tvoje miesto"}</span><b>#${myI + 1}</b>`;
    const rest = rows.slice(3);
    $("lbList").hidden = !rows.length ? false : !rest.length;
    $("lbList").innerHTML = !rows.length ? `<div class="row"><span></span><span class="nm"><small>${cfg.empty}</small></span><span></span></div>`
      : rest.map((r, k) => `<div class="row${r.mine ? " me" : ""}"><span class="rk">${k + 4}</span><span class="nm">${esc(r.name)}${r.mine ? '<span class="tag">ty</span>' : ""}<small>${esc(r.sub)}</small></span><span class="sc">${esc(r.score)}</span><span class="bar"><i style="width:${Math.round(Math.min(1, r.val) * 100)}%"></i></span></div>`).join("");
  }


  // ─── CHAT ─────────────────────────────────────────────
  let room = null, chatSub = null, chatMsgs = [], chatSeen = {};
  try { chatSeen = JSON.parse(localStorage.getItem("lockinChatSeen") || "{}"); } catch (e) {}
  const roomsOf = () => {
    const r = [{ id: "all", n: "Všetci" }];
    if (norm(me.group_name)) r.push({ id: "g:" + norm(me.group_name), n: me.group_name.trim() });
    if (norm(me.pair_code)) r.push({ id: "p:" + norm(me.pair_code), n: partner ? "Ja + " + partner.nick : "Dvojica" });
    return r;
  };
  function renderChat() {
    const rs = roomsOf();
    if (!room || !rs.some(r => r.id === room)) room = rs[rs.length > 1 ? 1 : 0].id;
    $("rooms").innerHTML = rs.map(r => `<button role="tab" data-room="${esc(r.id)}" aria-selected="${r.id === room}">${esc(r.n)}</button>`).join("");
    loadRoom();
  }
  $("rooms").onclick = e => { const b = e.target.closest("[data-room]"); if (b && b.dataset.room !== room) { room = b.dataset.room; renderChat(); } };
  async function loadRoom() {
    const r = room;
    $("msgs").innerHTML = '<div class="empty">Načítavam…</div>';
    const { data, error } = await sb.from("messages").select("id,user_id,nick,body,created_at,room").eq("room", r).order("created_at", { ascending: false }).limit(80);
    if (r !== room) return;
    if (error) { $("msgs").innerHTML = '<div class="empty">' + (/messages/.test(error.message || "") ? "Chat sa ešte pripravuje. Skús to o chvíľu." : "Chat sa nepodarilo načítať.") + '</div>'; return; }
    chatMsgs = (data || []).reverse(); drawMsgs(true);
    subscribe();
  }
  function subscribe() {
    if (chatSub) { sb.removeChannel(chatSub); chatSub = null; }
    const rooms = roomsOf().map(x => x.id);
    chatSub = sb.channel("chat-" + me.id).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, pl => {
      const m = pl.new; if (!rooms.includes(m.room)) return;
      if (m.room === room && tab === "chat") { if (!chatMsgs.some(x => x.id === m.id)) { chatMsgs.push(m); drawMsgs(true); } }
      else if (m.user_id !== me.id) $("chatDot").hidden = false;
    }).subscribe();
  }
  const hhmm = t => { const d = new Date(t); return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"); };
  function drawMsgs(scroll) {
    if (!chatMsgs.length) { $("msgs").innerHTML = '<div class="empty">Zatiaľ ticho. Napíš prvý — povzbuď chalanov alebo sa priznaj, že je to ťažké.</div>'; return; }
    let last = "", h = "";
    chatMsgs.forEach(m => {
      const d = new Date(m.created_at), key = d.toDateString();
      if (key !== last) { last = key; h += `<div class="daysep">${key === new Date().toDateString() ? "Dnes" : d.toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "numeric" })}</div>`; }
      h += `<div class="msg${m.user_id === me.id ? " mine" : ""}"><div class="who">${esc(m.nick)}</div><div class="tx">${esc(m.body)}</div><time>${hhmm(m.created_at)}</time></div>`;
    });
    $("msgs").innerHTML = h;
    chatSeen[room] = chatMsgs[chatMsgs.length - 1].created_at;
    try { localStorage.setItem("lockinChatSeen", JSON.stringify(chatSeen)); } catch (e) {}
    $("chatDot").hidden = true;
    if (scroll) requestAnimationFrame(() => window.scrollTo(0, document.documentElement.scrollHeight));
  }
  $("chatForm").addEventListener("submit", async e => {
    e.preventDefault();
    const body = $("chatIn").value.trim(); if (!body) return;
    $("chatIn").value = "";
    const { data, error } = await sb.from("messages").insert({ room, body }).select("id,user_id,nick,body,created_at,room").single();
    if (error) { $("chatIn").value = body; alertChat("Správa sa neodoslala. Skús znova."); return; }
    if (!chatMsgs.some(x => x.id === data.id)) { chatMsgs.push(data); drawMsgs(true); }
  });
  function alertChat(t) { const el = document.createElement("div"); el.className = "empty"; el.textContent = t; $("msgs").appendChild(el); setTimeout(() => el.remove(), 3000); }
  $("fallChat").onclick = () => go("chat");
  // Bodka pri Chate: je niečo nové od poslednej návštevy?
  async function chatBadge() {
    if (!me || tab === "chat") return;
    const rs = roomsOf().map(x => x.id);
    const { data, error } = await sb.from("messages").select("room,created_at,user_id").in("room", rs).neq("user_id", me.id).order("created_at", { ascending: false }).limit(20);
    if (error) return;
    $("chatDot").hidden = !(data || []).some(m => !chatSeen[m.room] || m.created_at > chatSeen[m.room]);
    if (!chatSub) subscribe();
  }

  // ─── PROFIL ───────────────────────────────────────────
  function renderProfil() {
    $("pNick").value = me.nick; $("pPair").value = me.pair_code || ""; $("pGroup").value = me.group_name || "";
    $("profMsg").textContent = ""; $("acct").textContent = "Prihlásený ako " + (user.email || "");
    renderAdmin();
  }

  // ─── ADMIN ────────────────────────────────────────────
  async function renderAdmin() {
    if (isAdmin === null) { const { data } = await sb.rpc("is_admin"); isAdmin = data === true; }
    $("admin").hidden = !isAdmin;
    if (!isAdmin) return;
    $("aStart").textContent = "Tvoj štart: " + fromIso(me.start_date).toLocaleDateString("sk-SK") + " · deň " + (between(fromIso(me.start_date), today) + 1);
    const { data, error } = await sb.rpc("admin_overview");
    $("aUsers").innerHTML = error ? '<div class="row"><span></span><span class="nm"><small>Nepodarilo sa načítať.</small></span><span></span></div>'
      : (data || []).map((u, i) => `<div class="row"><span class="rk">${i + 1}</span><span class="nm">${esc(u.nick)}<small>${esc(u.email)}${u.pair_code ? " · dvojica " + esc(u.pair_code) : ""}${u.group_name ? " · " + esc(u.group_name) : ""}</small><small>štart ${esc(u.start_date)}${u.last_day ? " · naposledy " + esc(u.last_day) : ""}</small></span><span class="sc">${u.good_days}</span></div>`).join("")
        || '<div class="row"><span></span><span class="nm"><small>Zatiaľ nikto.</small></span><span></span></div>';
  }
  const aMsg = t => { $("aMsg").textContent = t; };
  document.querySelectorAll("[data-shift]").forEach(b => b.onclick = async () => {
    const n = +b.dataset.shift;
    const start = n === 0 ? iso(today) : iso(add(fromIso(me.start_date), n));
    const { error } = await sb.from("profiles").update({ start_date: start }).eq("id", me.id);
    if (error) return aMsg("Nepodarilo sa: " + error.message);
    me.start_date = start; aMsg("Štart posunutý na " + fromIso(start).toLocaleDateString("sk-SK")); renderAdmin();
  });
  async function fillAll() {
    const all = Object.fromEntries(HABITS.map(h => [h.id, true]));
    const rows = [];
    for (let d = fromIso(me.start_date); d <= today; d = add(d, 1)) rows.push({ user_id: me.id, day: iso(d), habits: all, updated_at: new Date().toISOString() });
    const { error } = await sb.from("days").upsert(rows);
    if (error) throw error;
    await loadAll(); return rows.length;
  }
  $("aWeek").onclick = async () => {
    const start = iso(add(fromIso(me.start_date), -7));
    const { error } = await sb.from("profiles").update({ start_date: start }).eq("id", me.id);
    if (error) return aMsg("Nepodarilo sa: " + error.message);
    me.start_date = start;
    try { await fillAll(); } catch (e) { return aMsg("Nepodarilo sa: " + e.message); }
    aMsg("Si na " + (between(fromIso(start), today) + 1) + ". dni, všetko odkliknuté. Choď do Výstupu a odhaľ odmenu."); renderAdmin();
  };
  $("aFill").onclick = async () => {
    const all = Object.fromEntries(HABITS.map(h => [h.id, true]));
    const rows = [];
    for (let d = fromIso(me.start_date); d <= today; d = add(d, 1)) rows.push({ user_id: me.id, day: iso(d), habits: all, updated_at: new Date().toISOString() });
    const { error } = await sb.from("days").upsert(rows);
    if (error) return aMsg("Nepodarilo sa: " + error.message);
    await loadAll(); aMsg("Odkliknutých " + rows.length + " dní. Pozri Výstup."); renderAdmin();
  };
  $("aHide").onclick = async () => {
    const { error } = await sb.from("profiles").update({ seen: {} }).eq("id", me.id);
    if (error) return aMsg("Nepodarilo sa: " + error.message);
    me.seen = {}; aMsg("Odmeny sú znova skryté. Odhalia sa pri otvorení Výstupu.");
  };
  $("aClear").onclick = async () => {
    const { error } = await sb.from("days").delete().eq("user_id", me.id);
    if (error) return aMsg("Nepodarilo sa: " + error.message);
    await loadAll(); aMsg("Odkliknutia vymazané."); renderAdmin();
  };
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
  $("logoutBtn").onclick = async () => { await sb.auth.signOut(); user = me = partner = null; isAdmin = null; show("intro"); };

  function render() {
    if (!me) return;
    ({ dnes: renderDnes, vystup: renderVystup, skupina: renderSkupina, chat: renderChat, profil: renderProfil })[tab]();
  }

  // ─── APPKA NA PLOCHU (PWA) ────────────────────────────
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; installUi(); });
  window.addEventListener("appinstalled", () => { installEvt = null; installUi(); });
  function installUi() {
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua), inApp = /FBAN|FBAV|Instagram|Messenger|Line\//.test(ua);
    const safari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua) && !inApp;
    const android = /Android/.test(ua), samsung = /SamsungBrowser/.test(ua);
    const txt = inApp
      ? "Otvor túto stránku v Safari (iPhone) alebo Chrome (Android) a pridaj si ju na plochu. Z Messengera sa to nedá."
      : ios ? (safari ? "V Safari ťukni na ⋯ dole, potom Zdieľať, Zobraziť viac a Pridať na plochu." : "Otvor stránku v Safari, ťukni na ⋯ dole, potom Zdieľať, Zobraziť viac a Pridať na plochu.")
      : installEvt ? "Jedno ťuknutie a máš Lock In na ploche ako appku."
      : samsung ? "V Samsung prehliadači ťukni na ≡ dole, potom Pridať stránku do a Domovská obrazovka. Alebo otvor stránku v Chrome."
      : android ? "V Chrome ťukni na ⋮ vpravo hore, potom Pridať na plochu a Inštalovať."
      : "V prehliadači otvor menu (⋮) a vyber Inštalovať aplikáciu alebo Pridať na plochu.";
    $("install").hidden = standalone; $("installIntro").hidden = standalone;
    $("installBtn").hidden = $("installBtn2").hidden = standalone || !installEvt;
    $("installTxt").textContent = txt;
    // Na úvode: na Androide stačí tlačidlo, text len keď tlačidlo nie je k dispozícii
    $("installTxt2").textContent = installEvt ? "" : (inApp || ios || android ? txt : "");
    // iPhone v Safari: bublina so šípkou na Zdieľať, kým ju nezavrie
    let dismissed = false; try { dismissed = localStorage.getItem("lockinIosTip") === "x"; } catch (e) {}
    $("iosTip").hidden = !(safari && !standalone && !dismissed && !$("v-intro").hidden);
    // Na Dnes: karta s inštaláciou pre prihlásených, kým ju nezavrie
    let dayX = false; try { dayX = localStorage.getItem("lockinInstallX") === "x"; } catch (e) {}
    $("installDay").hidden = standalone || dayX;
    $("installTxt3").textContent = installEvt ? "Jedno ťuknutie a máš ju na ploche s vlastnou ikonou." : txt;
    $("installBtn3").hidden = !installEvt;
    if (!$("iosTip").hidden) $("installTxt2").textContent = "";
  }
  $("iosTipX").onclick = () => { $("iosTip").hidden = true; try { localStorage.setItem("lockinIosTip", "x"); } catch (e) {} };
  $("installBtn2").onclick = $("installBtn3").onclick = () => $("installBtn").onclick();
  $("installDayX").onclick = () => { $("installDay").hidden = true; try { localStorage.setItem("lockinInstallX", "x"); } catch (e) {} };
  installUi();

  boot();
})();
