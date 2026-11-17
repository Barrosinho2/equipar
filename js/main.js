/* =========================================================
   EQUIPAR — interações e animações
   GSAP 3 (ScrollTrigger, SplitText, DrawSVG) + Lenis
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = {
    whatsapp: '551532517000',   // número que recebe as mensagens do formulário
    netlifyForms: false         // true só se o site for publicado na Netlify (salva uma cópia do pedido em Forms)
  };

  const html = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => window.innerWidth >= 1000;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  let lenis = null;
  let mm = null;

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- rolagem ---------- */
  const headerOffset = () => (isDesktop() ? 78 : 64) + 8;

  function scrollToY(y) {
    const top = Math.max(0, y);
    if (lenis) lenis.scrollTo(top, { duration: 1.35, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }
  function scrollToEl(el, offset = headerOffset()) {
    scrollToY(el.getBoundingClientRect().top + window.scrollY - offset);
  }

  /* =======================================================
     Recursos que funcionam mesmo sem as animações
     ======================================================= */

  /* ---------- menu mobile ---------- */
  const burger = $('.burger');
  const menu = $('#menu');
  let menuOpen = false;
  const setInert = (on) => {
    ['#conteudo', '.footer', '.wa-float', '.topbar', '.nav', '.header__cta', '.header__phone'].forEach((sel) => {
      const el = $(sel);
      if (el) el.inert = on;
    });
  };

  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menu.hidden = false;
    html.classList.add('menu-open');
    setInert(true);
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    if (hasGSAP && !reduce) {
      gsap.killTweensOf([menu, ...$$('.menu__link span, .menu__foot > *', menu)]);
      gsap.timeline()
        .fromTo(menu, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% -14%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 114%, 0% 100%)', duration: .75, ease: 'expo.inOut' })
        .fromTo($$('.menu__link span', menu), { yPercent: 110 }, { yPercent: 0, duration: .8, stagger: .06, ease: 'expo.out' }, .3)
        .fromTo($$('.menu__foot > *', menu), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06, ease: 'power3.out' }, .45);
    }
    const first = $('.menu__link', menu);
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus) {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    html.classList.remove('menu-open');
    setInert(false);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    if (lenis) lenis.start(); else document.body.style.overflow = '';
    const done = () => { menu.hidden = true; };
    if (hasGSAP && !reduce) {
      gsap.to(menu, { clipPath: 'polygon(0% 0%, 100% 0%, 100% -14%, 0% 0%)', duration: .6, ease: 'expo.inOut', onComplete: done });
    } else done();
    if (restoreFocus) burger.focus();
  }

  if (burger && menu) {
    burger.addEventListener('click', () => (menuOpen ? closeMenu(true) : openMenu()));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) closeMenu(true); });
    window.matchMedia('(min-width: 1000px)').addEventListener('change', (e) => { if (e.matches) closeMenu(false); });
  }

  /* ---------- dúvidas (acordeão) ---------- */
  $$('.faq__item').forEach((item) => {
    const btn = $('.faq__q', item);
    const answer = $('.faq__a', item);
    answer.inert = true;
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq__item.is-open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          $('.faq__q', other).setAttribute('aria-expanded', 'false');
          $('.faq__a', other).inert = true;
        }
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      answer.inert = !open;
      if (hasGSAP) window.setTimeout(() => ScrollTrigger.refresh(), 560);
    });
  });

  /* ---------- formulário → WhatsApp ---------- */
  const form = $('.form');
  const setMode = (problem) => {
    if (!form) return;
    const key = problem ? 'problem' : 'install';
    const legend = $('.chips legend', form);
    const msgLabel = $('label[for="f-msg"]', form);
    const msg = $('#f-msg', form);
    legend.textContent = legend.dataset[key];
    msgLabel.textContent = msgLabel.dataset[key];
    msg.placeholder = msg.dataset[key];
  };

  function preselectService(value) {
    if (!form) return;
    if (form.classList.contains('is-sent')) resetForm();
    const install = $('input[name="tipo"][value="Quero instalar"]', form);
    if (install && !install.checked) { install.checked = true; setMode(false); }
    const chip = $$('input[name="servicos"]', form).find((i) => i.value === value);
    if (!chip) return;
    chip.checked = true;
    if (hasGSAP && !reduce) {
      gsap.fromTo(chip.nextElementSibling, { scale: 1 }, { scale: 1.12, duration: .22, yoyo: true, repeat: 3, ease: 'power1.inOut', delay: 1.1 });
    }
  }

  function resetForm() {
    form.reset();
    setMode(false);
    form.classList.remove('is-sent');
    $('.form__success', form).hidden = true;
    $$('.field', form).forEach((f) => { f.classList.remove('is-invalid'); $('.field__error', f).textContent = ''; });
  }

  if (form) {
    const fName = $('#f-nome', form);
    const fWhats = $('#f-whats', form);
    const fCar = $('#f-carro', form);
    const fMsg = $('#f-msg', form);

    $$('input[name="tipo"]', form).forEach((r) => r.addEventListener('change', () => setMode(r.value === 'Tenho um problema' && r.checked)));

    fWhats.addEventListener('input', () => {
      const d = fWhats.value.replace(/\D/g, '').slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 6) out = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      fWhats.value = out;
    });

    const rules = [
      [fName, (v) => v.trim().length >= 2, 'Informe seu nome.'],
      [fWhats, (v) => v.replace(/\D/g, '').length >= 10, 'Informe um WhatsApp com DDD, ex.: (15) 99999-9999.'],
      [fCar, (v) => v.trim().length >= 2, 'Informe o modelo e o ano do carro.'],
      [fMsg, (v) => v.trim().length >= 5, 'Conte em poucas palavras o que você precisa.']
    ];
    const setError = (el, msg) => {
      const field = el.closest('.field');
      field.classList.toggle('is-invalid', !!msg);
      $('.field__error', field).textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    rules.forEach(([el, ok, msg]) => {
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('is-invalid') && ok(el.value)) setError(el, ''); });
      el.addEventListener('blur', () => { if (el.value && !ok(el.value)) setError(el, msg); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      rules.forEach(([el, ok, msg]) => {
        const good = ok(el.value);
        setError(el, good ? '' : msg);
        if (!good && !firstBad) firstBad = el;
      });
      if (firstBad) {
        firstBad.focus({ preventScroll: true });
        scrollToEl(firstBad.closest('.field'), headerOffset() + 40);
        return;
      }

      const data = new FormData(form);
      const problem = data.get('tipo') === 'Tenho um problema';
      const services = data.getAll('servicos');
      const lines = ['Olá, Equipar! Vim pelo site.', ''];
      lines.push(services.length
        ? `*${problem ? 'Problema em' : 'Quero instalar'}:* ${services.join(', ')}`
        : `*${problem ? 'Tenho um problema' : 'Quero instalar'}*`);
      lines.push(`*Carro:* ${String(data.get('carro')).trim()}`);
      lines.push(`*${problem ? 'O que está acontecendo' : 'O que eu quero'}:* ${String(data.get('mensagem')).trim()}`);
      lines.push('', `*Nome:* ${String(data.get('nome')).trim()}`, `*WhatsApp:* ${String(data.get('whatsapp')).trim()}`);
      const url = waLink(lines.join('\n'));

      if (CONFIG.netlifyForms && /^https?:$/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) {
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        }).catch(() => {});
      }

      const win = window.open(url, '_blank');
      if (win) { try { win.opener = null; } catch (err) { /* ignora */ } } else { window.location.href = url; }

      $('.form__success-link', form).href = url;
      form.classList.add('is-sent');
      const ok = $('.form__success', form);
      ok.hidden = false;
      if (hasGSAP && !reduce) gsap.from(ok, { y: 16, opacity: 0, duration: .6, ease: 'power3.out' });
      window.requestAnimationFrame(() => {
        if (hasGSAP) ScrollTrigger.refresh();
        const top = ok.getBoundingClientRect().top;
        if (top < headerOffset() || top > window.innerHeight * .7) scrollToEl(ok, headerOffset() + 80);
      });
    });

    $('.form__again', form).addEventListener('click', () => {
      resetForm();
      if (hasGSAP) ScrollTrigger.refresh();
      fName.focus();
    });
  }

  /* ---------- links internos (#) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = id === '#inicio' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) closeMenu(false);
      if (a.dataset.service) preselectService(a.dataset.service);
      if (id === '#inicio') scrollToY(0);
      else {
        scrollToEl(target);
        if (!target.matches('a, button, input, textarea, select, [tabindex]')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      if (history.replaceState) history.replaceState(null, '', id === '#inicio' ? window.location.pathname : id);
    });
  });

  /* =======================================================
     Animações
     ======================================================= */
  if (!hasGSAP) { html.classList.add('js-ready'); return; }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  mm = gsap.matchMedia();

  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const safe = (fn) => { try { fn(); } catch (err) { console.error('[equipar]', err); } };

  // cabeçalho, progresso, link ativo e botão flutuante não dependem de movimento
  safe(initHeader);
  safe(initFab);
  safe(initXray);   // o raio-x funciona também com movimento reduzido (só troca estados)

  if (reduce) {
    html.classList.add('js-ready');
    safe(() => $$('.step').forEach((s) => s.classList.add('is-reached')));
    return;
  }

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1800))
  ]);

  fontsReady.then(() => {
    html.classList.add('js-ready');
    safe(initIntro);
    safe(initSplitHeadings);
    safe(initMarquee);
    safe(initAbout);
    safe(initTrust);
    safe(initProcess);
    safe(initLists);
    safe(initCta);
    safe(initFooter);
    safe(initCursor);
    safe(initMagnetic);
    window.addEventListener('load', () => ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  });

  /* ---------- cabeçalho ---------- */
  function initHeader() {
    const head = $('[data-head]');
    if (!head) return;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      head.classList.toggle('is-scrolled', y > 30);
      if (!menuOpen) {
        if (y > 640 && y > lastY + 2) head.classList.add('is-hidden');
        else if (y < lastY - 2 || y <= 640) head.classList.remove('is-hidden');
      }
      lastY = y;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();

    gsap.to('.scroll-progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    ['sobre', 'servicos', 'como-funciona', 'duvidas', 'contato'].forEach((id) => {
      const sec = $(`#${id}`);
      const link = $(`.nav__link[href="#${id}"]`);
      if (!sec || !link) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: (self) => link.classList.toggle('is-current', self.isActive) });
    });
  }

  /* ---------- botão flutuante do WhatsApp ---------- */
  function initFab() {
    const fab = $('.wa-float');
    if (!fab) return;
    let pastHero = false;
    let inContact = false;
    const update = () => fab.classList.toggle('is-visible', pastHero && !inContact);
    ScrollTrigger.create({ trigger: '.hero', start: 'bottom 70%', onEnter: () => { pastHero = true; update(); }, onLeaveBack: () => { pastHero = false; update(); } });
    ScrollTrigger.create({ trigger: '#contato', start: 'top 85%', onEnter: () => { inContact = true; update(); }, onLeaveBack: () => { inContact = false; update(); } });
  }

  /* ---------- abertura + hero ---------- */
  function initIntro() {
    const pre = $('.preloader');
    const showPre = pre && window.getComputedStyle(pre).display !== 'none';
    const tl = gsap.timeline();

    if (showPre) {
      try { sessionStorage.setItem('equipar:intro', '1'); } catch (err) { /* ignora */ }
      gsap.set(pre, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 114%)' });
      tl.fromTo('.preloader__logo', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' })
        .fromTo('.preloader__bar i', { scaleX: 0 }, { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, .05)
        .to(pre, { clipPath: 'polygon(0% 0%, 100% 0%, 100% -14%, 0% 0%)', duration: .95, ease: 'expo.inOut' }, '+=.12')
        .add(() => pre.remove());
      tl.add(heroIntro(), '-=.6');
    } else {
      if (pre) pre.remove();
      tl.add(heroIntro(), .05);
    }
    heroScroll();
  }

  function heroIntro() {
    const title = $('.hero__title');
    const desktop = isDesktop();
    gsap.set([title, ...$$('[data-hero-anim]')], { opacity: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    let split = null;
    if (window.SplitText) {
      split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line', tag: 'span' });
      tl.from(split.lines, { yPercent: 112, duration: 1.25, stagger: .09 }, .1);
      tl.add(() => split.revert(), '>');
    } else {
      tl.from(title, { y: 40, opacity: 0, duration: 1 }, .1);
    }

    tl.from('.hero__kicker', { y: 18, opacity: 0, duration: .9 }, 0)
      .from('.hero__rings .ring', { scale: .72, opacity: 0, transformOrigin: '92% 70%', duration: 1.7, stagger: { each: .09, from: 'end' } }, 0)
      .from('.hero__rings .ring-accent', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: .9 }, .25);

    if (desktop) {
      tl.fromTo('.hero__photo',
        { clipPath: 'polygon(24% 0%, 24% 0%, 0% 100%, 0% 100%)' },
        { clipPath: 'polygon(24% 0%, 100% 0%, 76% 100%, 0% 100%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
        .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, .2)
        .fromTo('.hero__inset',
          { clipPath: 'polygon(24% 100%, 100% 100%, 76% 100%, 0% 100%)', y: 40 },
          { clipPath: 'polygon(24% 0%, 100% 0%, 76% 100%, 0% 100%)', y: 0, duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, .55);
    } else {
      tl.from('.hero__photo', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0)
        .from('.hero__photo img', { scale: 1.18, duration: 2.2 }, 0);
    }

    tl.from('.badge33__stripes i', { scaleX: 0, duration: 1.1, stagger: .08, ease: 'expo.inOut' }, .45)
      .fromTo('.badge33__box', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'expo.inOut', clearProps: 'clipPath' }, .8)
      .from('.badge33__box b', { yPercent: 70, opacity: 0, duration: .8 }, 1.05)
      .from('.badge33__slashes i', { x: -14, opacity: 0, duration: .5, stagger: .07 }, 1.15)
      .from('.badge33__since', { x: -10, opacity: 0, duration: .7 }, 1.25)
      .from('.hero__lead', { y: 22, opacity: 0, duration: 1 }, .75)
      .from('.hero__actions > *', { y: 22, opacity: 0, duration: .9, stagger: .08 }, .85)
      .from('.site-head', { opacity: 0, duration: .9, ease: 'power2.out' }, .35);
    return tl;
  }

  function heroScroll() {
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.fromTo('.hero__rings', { rotate: 0, scale: 1 }, { rotate: -7, scale: 1.12, ease: 'none', scrollTrigger: st });
    mm.add('(min-width: 1000px)', () => {
      gsap.fromTo('.hero__photo picture', { yPercent: 0, scale: 1.1 }, { yPercent: 6, scale: 1.1, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__inset', { yPercent: -38, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__copy', { yPercent: -10, ease: 'none', scrollTrigger: st });
    });
    mm.add('(max-width: 999px)', () => {
      gsap.fromTo('.hero__photo picture', { yPercent: 0, scale: 1.08 }, { yPercent: 3.5, scale: 1.08, ease: 'none', scrollTrigger: st });
    });
  }

  /* ---------- títulos com máscara por linha ---------- */
  function initSplitHeadings() {
    if (!window.SplitText) return;
    $$('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        tag: 'span',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.15,
            ease: 'expo.out',
            stagger: .1,
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
          });
        }
      });
    });
  }

  /* ---------- faixas que reagem à rolagem ---------- */
  function initMarquee() {
    const tracks = $$('.marquee__track');
    if (!tracks.length) return;
    tracks.forEach((t) => { t.innerHTML += t.innerHTML; });
    const tweens = tracks.map((t, i) => {
      const tw = gsap.fromTo(t, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: i % 2 ? 52 : 40, ease: 'none', repeat: -1 });
      tw.totalTime(tw.duration() * 200);
      return tw;
    });
    let dir = 1;
    let boost = 0;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        dir = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 180, 9);
      }
    });
    gsap.ticker.add(() => {
      boost *= .92;
      const ts = dir * (1 + boost);
      tweens.forEach((tw) => tw.timeScale(ts));
    });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => tweens.forEach((tw) => (self.isActive ? tw.resume() : tw.pause()))
    });
  }

  /* ---------- sobre: verbete + hodômetro ---------- */
  function initAbout() {
    gsap.from('.define__syl, .define__dot', {
      yPercent: 70, opacity: 0, rotate: -8, duration: 1.2, ease: 'expo.out', stagger: .08,
      scrollTrigger: { trigger: '.define__word', start: 'top 85%' }
    });

    if (window.SplitText) {
      $$('[data-scrub-words]').forEach((el) => {
        const split = SplitText.create(el, { type: 'words', wordsClass: 'w', tag: 'span' });
        gsap.fromTo(split.words, { opacity: .14 }, {
          opacity: 1, ease: 'none', stagger: .1,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true }
        });
      });
    }

    const reels = $$('.odo__reel');
    if (reels.length) {
      const state = { v: 0 };
      const render = () => {
        const v = state.v;
        const n = reels.length;
        reels.forEach((reel, idx) => {
          const place = n - 1 - idx;
          const p = Math.pow(10, place);
          let pos;
          if (place === 0) pos = v % 10;
          else pos = (Math.floor(v / p) % 10) + Math.max(0, (v % p) - (p - 1));
          reel.style.transform = `translate3d(0, ${-(pos / 11) * 100}%, 0)`;
        });
      };
      render();
      gsap.to(state, { v: 33, ease: 'none', onUpdate: render, scrollTrigger: { trigger: '.odo', start: 'top 90%', end: 'top 38%', scrub: .7 } });
    }

    gsap.from('.milestone', { x: -18, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.milestones', start: 'top 88%' } });
  }

  /* ---------- raio-x do carro ---------- */
  function initXray() {
    const section = $('.xray');
    if (!section) return;
    const car = $('.car', section);
    const items = $$('.svc[data-step]', section);
    const hotspots = $$('.hotspot', section);
    const nowEl = $('.xray__now', section);
    const bars = $$('.xray__bar i', section);
    const comps = $$('[data-comp]', car);
    const order = items.map((i) => i.dataset.step).filter((id) => id !== 'todos');
    const labels = {};
    items.forEach((i) => { labels[i.dataset.step] = $('.svc__title', i).textContent.trim(); });
    labels.todos = 'Seu carro, equipado';

    const q = (s) => $$(s, car);
    const loops = {};
    if (!reduce) {
      loops.som = gsap.timeline({ paused: true, repeat: -1 })
        .fromTo(q('.wave'), { scale: .55, opacity: .95, transformOrigin: '50% 50%' }, { scale: 2.3, opacity: 0, duration: 1.5, stagger: .5, ease: 'power1.out' });
      loops.alarme = gsap.timeline({ paused: true, repeat: -1 })
        .fromTo(q('.alarm-ring'), { scale: .9, opacity: 1, transformOrigin: '50% 50%' }, { scale: 1.14, opacity: 0, duration: 1.7, stagger: .6, ease: 'power1.out' }, 0)
        .fromTo(q('.blink'), { opacity: 0 }, { opacity: 1, duration: .12, repeat: 5, yoyo: true, ease: 'none' }, 0);
      loops.travas = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .5 })
        .fromTo(q('.lock'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, stagger: .12, ease: 'back.out(2)' })
        .to(q('.lock__shackle'), { y: -4, duration: .22, ease: 'power2.out' }, '+=.35')
        .to(q('.lock__shackle'), { y: 0, duration: .18, ease: 'power2.in' }, '+=.35');
      loops.vidros = gsap.timeline({ paused: true, repeat: -1, yoyo: true, repeatDelay: .45 })
        .fromTo(q('.pane'), { y: 74 }, { y: 0, duration: 1.3, ease: 'power2.inOut' })
        .fromTo(q('.pane-arrows'), { opacity: .3 }, { opacity: 1, duration: .4 }, 0);
      loops.insulfilm = gsap.timeline({ paused: true })
        .fromTo(q('.tint'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
        .fromTo(q('.squeegee'), { x: 0, opacity: 1 }, { x: 430, duration: 1.4, ease: 'power2.inOut' }, 0)
        .to(q('.squeegee'), { opacity: 0, duration: .2 });
      loops.led = gsap.timeline({ paused: true })
        .fromTo(q('.led-beam, .headlight-on'), { opacity: 0 }, { opacity: 1, duration: .07, repeat: 5, yoyo: true, ease: 'none' })
        .to(q('.led-beam, .headlight-on'), { opacity: 1, duration: .25 });
      const mmTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .4 })
        .fromTo(q('.screen rect'), { opacity: .35 }, { opacity: 1, duration: .3 });
      if (window.DrawSVGPlugin) {
        mmTl.fromTo(q('.route'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'power1.inOut' })
          .to(q('.route'), { drawSVG: '100% 100%', duration: .6, ease: 'power1.in' }, '+=.35');
      }
      loops.multimidia = mmTl;
      loops.camera = gsap.timeline({ paused: true })
        .fromTo(q('.cam-cone'), { opacity: 0, scaleX: .2, transformOrigin: '100% 50%' }, { opacity: 1, scaleX: 1, duration: .9, ease: 'expo.out' })
        .fromTo(q('.cam-guide'), { opacity: 0 }, { opacity: 1, duration: .5 }, '-=.5');
      loops.engate = gsap.timeline({ paused: true, repeat: -1 })
        .fromTo(q('.hitch-glow'), { scale: .55, opacity: 1, transformOrigin: '50% 50%' }, { scale: 2.1, opacity: 0, duration: 1.2, ease: 'power1.out' });
      loops.bagageiros = gsap.timeline({ paused: true })
        .fromTo(q('.roofbox'), { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'bounce.out' });
    }

    let current = null;
    let scrollStep = null;

    function setLabel(text) {
      if (!nowEl) return;
      const old = $$('span', nowEl);
      const span = document.createElement('span');
      span.textContent = text;
      nowEl.appendChild(span);
      if (reduce) { old.forEach((o) => o.remove()); return; }
      gsap.fromTo(span, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'expo.out' });
      old.forEach((o) => gsap.to(o, { yPercent: -100, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => o.remove() }));
    }

    function clearStep() {
      current = null;
      items.forEach((el) => el.classList.remove('is-active'));
      hotspots.forEach((h) => { h.classList.remove('is-active'); h.setAttribute('aria-pressed', 'false'); });
      comps.forEach((c) => c.classList.remove('is-on'));
      bars.forEach((b) => b.classList.remove('is-done'));
      Object.values(loops).forEach((tl) => tl.pause(0));
      setLabel('Seu carro, ponto a ponto');
    }

    function setStep(id, fromScroll) {
      if (fromScroll) scrollStep = id;
      if (!id || id === current) return;
      current = id;
      const all = id === 'todos';
      items.forEach((el) => el.classList.toggle('is-active', el.dataset.step === id));
      hotspots.forEach((h) => {
        const on = h.dataset.step === id;
        h.classList.toggle('is-active', on);
        h.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      comps.forEach((c) => c.classList.toggle('is-on', all || c.dataset.comp === id));
      const idx = order.indexOf(id);
      bars.forEach((b, i) => b.classList.toggle('is-done', all || i <= idx));
      setLabel(labels[id] || '');
      Object.entries(loops).forEach(([key, tl]) => {
        if (all) { tl.pause(); tl.progress(tl.repeat() === -1 ? .3 : 1); }
        else if (key === id) tl.restart();
        else tl.pause(0);
      });
    }

    const activationLine = () => (isDesktop() ? .55 : .74);
    const makeTriggers = (line) => {
      items.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: `top ${line}`,
          end: `bottom ${line}`,
          onToggle: (self) => { if (self.isActive) setStep(el.dataset.step, true); }
        });
      });
    };
    mm.add('(min-width: 1000px)', () => makeTriggers('55%'));
    mm.add('(max-width: 999px)', () => makeTriggers('74%'));

    hotspots.forEach((h) => {
      h.setAttribute('aria-pressed', 'false');
      h.addEventListener('click', () => {
        const el = $(`#svc-${h.dataset.step}`);
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * activationLine() + Math.min(90, el.offsetHeight * .35);
        scrollToY(y);
      });
      if (fine) {
        h.addEventListener('pointerenter', () => setStep(h.dataset.step));
        h.addEventListener('pointerleave', () => { if (scrollStep) setStep(scrollStep); else clearStep(); });
      }
    });

    if (reduce) return;

    // o carro se desenha quando entra na tela
    const st = { trigger: '.xray__car', start: 'top 85%' };
    if (window.DrawSVGPlugin) {
      gsap.from(q('.draw'), { drawSVG: '0%', duration: 1.9, ease: 'power2.inOut', stagger: .025, scrollTrigger: st });
    }
    gsap.from(q('.wheel'), { scale: 0, transformOrigin: '50% 50%', duration: 1, ease: 'back.out(1.7)', stagger: .12, delay: .7, scrollTrigger: st });
    gsap.from(q('.glass'), { fillOpacity: 0, duration: 1, delay: 1, scrollTrigger: st });
    gsap.from(q('.xray-line'), { opacity: 0, duration: .8, stagger: .04, delay: 1.2, scrollTrigger: st });
    gsap.from(hotspots, { scale: 0, opacity: 0, duration: .6, ease: 'back.out(2.6)', stagger: .06, delay: 1.35, scrollTrigger: st });
    gsap.from('.car__speed path', { x: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: 1.4, scrollTrigger: st });

    // rodas giram conforme a rolagem
    q('.wheel').forEach((w) => {
      gsap.to(w, { rotation: 720, transformOrigin: '50% 50%', ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: .4 } });
    });
  }

  /* ---------- diferenciais: revelação tipo rodo de insulfilm ---------- */
  function initTrust() {
    $$('[data-squeegee]').forEach((fig) => {
      const clip = $('.feature__clip', fig);
      const img = $('img', fig);
      const blade = $('.feature__blade', fig);
      const feature = fig.closest('.feature');
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 80%' } });
      tl.fromTo(clip, { clipPath: 'polygon(7% 0%, 7% 0%, 0% 100%, 0% 100%)' },
        { clipPath: 'polygon(7% 0%, 100% 0%, 93% 100%, 0% 100%)', duration: 1.5, ease: 'power3.inOut' })
        .fromTo(blade, { left: '3.5%', opacity: 1 }, { left: '96.5%', duration: 1.5, ease: 'power3.inOut' }, 0)
        .to(blade, { opacity: 0, duration: .25 })
        .from(img, { scale: 1.28, duration: 2, ease: 'expo.out' }, 0)
        .from($$('.feature__title, .feature__text', feature), { y: 26, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' }, .7);

      gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    gsap.from('.fact', {
      y: 30, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out',
      scrollTrigger: { trigger: '.facts', start: 'top 85%' }
    });
  }

  /* ---------- como funciona: o carrinho percorre a estrada ---------- */
  function initProcess() {
    const track = $('.process__track');
    if (!track) return;
    const road = $('.road', track);
    const carEl = $('.road__car', track);
    const fill = $('.road__fill', track);
    const steps = $$('.step', track);
    const nums = steps.map((s) => $('.step__num', s));

    gsap.from(steps, { y: 34, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: track, start: 'top 82%' } });

    mm.add({ d: '(min-width: 1000px)', m: '(max-width: 999px)' }, (ctx) => {
      const d = ctx.conditions.d;
      const prop = d ? 'x' : 'y';
      const scale = d ? 'scaleX' : 'scaleY';
      const travel = () => (d ? road.offsetWidth - carEl.offsetWidth - 10 : road.offsetHeight - carEl.offsetHeight - 10);
      const mark = () => {
        const r = carEl.getBoundingClientRect();
        const head = d ? r.left + r.width * .8 : r.top + r.height * .8;
        nums.forEach((n, i) => {
          const nr = n.getBoundingClientRect();
          const c = d ? nr.left + nr.width / 2 : nr.top + nr.height / 2;
          steps[i].classList.toggle('is-reached', head >= c);
        });
      };
      gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: d ? 'top 72%' : 'top 62%',
          end: d ? 'bottom 62%' : 'bottom 72%',
          scrub: .8,
          invalidateOnRefresh: true,
          onUpdate: mark,
          onRefresh: mark
        }
      })
        .fromTo(carEl, { [prop]: 0 }, { [prop]: travel, ease: 'none' }, 0)
        .fromTo(fill, { [scale]: 0 }, { [scale]: 1, ease: 'none' }, 0);
      return () => steps.forEach((s) => s.classList.remove('is-reached'));
    });
  }

  /* ---------- listas: dúvidas e formulário ---------- */
  function initLists() {
    gsap.from('.faq__item', { y: 22, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } });
    gsap.from('.form > :not(.form__success):not(.visually-hidden)', { y: 24, opacity: 0, duration: .8, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.form', start: 'top 86%' } });
    gsap.from('.info__item, .map', { x: 24, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.contact__info', start: 'top 85%' } });
  }

  /* ---------- chamada final ---------- */
  function initCta() {
    $$('.cta-band__line').forEach((line, i) => {
      gsap.fromTo(line, { xPercent: i % 2 ? 16 : -16 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'center 58%', scrub: .6 }
      });
    });
    gsap.from('.cta-band__rings .ring', {
      scale: .8, opacity: 0, transformOrigin: '92% 70%', duration: 1.4, ease: 'expo.out', stagger: { each: .07, from: 'end' },
      scrollTrigger: { trigger: '.cta-band', start: 'top 75%' }
    });
  }

  /* ---------- rodapé: a palavra gigante "enche" de amarelo ---------- */
  function initFooter() {
    gsap.fromTo('.footer__giant-fill', { clipPath: 'inset(-40% 100% -40% 0%)' }, {
      clipPath: 'inset(-40% 0% -40% 0%)', ease: 'none',
      scrollTrigger: { trigger: '.footer__giant', start: 'top 98%', end: 'bottom bottom', scrub: .5 }
    });
  }

  /* ---------- cursor (só com mouse) ---------- */
  function initCursor() {
    if (!fine) return;
    const cur = $('.cursor');
    if (!cur) return;
    const dot = $('.cursor__dot', cur);
    const ring = $('.cursor__ring', cur);
    html.classList.add('has-cursor');
    gsap.set([dot, ring], { x: -100, y: -100 });
    const dx = gsap.quickSetter(dot, 'x', 'px');
    const dy = gsap.quickSetter(dot, 'y', 'px');
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      cur.classList.toggle('is-hover', !!t.closest('a, button, label, .hotspot'));
      cur.classList.toggle('is-hidden', !!t.closest('input, textarea, iframe'));
    });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    document.documentElement.addEventListener('pointerenter', () => cur.classList.remove('is-hidden'));
  }

  /* ---------- botões magnéticos ---------- */
  function initMagnetic() {
    if (!fine) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: .7, ease: 'elastic.out(1, .45)' });
      const yTo = gsap.quickTo(el, 'y', { duration: .7, ease: 'elastic.out(1, .45)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .28);
        yTo((e.clientY - (r.top + r.height / 2)) * .38);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }
})();
