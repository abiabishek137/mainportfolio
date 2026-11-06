(function () {
  "use strict";
  var doc = document.documentElement, body = document.body;
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var wait = function (ms, fn) { return setTimeout(fn, ms); };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ------------------------------------------------------------------
     Hero API console
     ------------------------------------------------------------------ */
  var pre = document.getElementById("json");
  if (pre) {
    var data = {
      about: { url: "localhost:8000/api/abishek", ms: 18, body: {
        name: "Abishek P", role: "Python Full Stack Developer", location: "Nagercoil, Tamil Nadu",
        degree: "B.E. ECE, 2026", cgpa: 7.6, currently: "Trainee @ IPCS Global",
        stack: ["Python", "Django", "Flask", "React", "MySQL", "AWS"] } },
      stack: { url: "localhost:8000/api/stack", ms: 11, body: {
        frontend: ["HTML", "CSS", "Bootstrap", "jQuery", "React"],
        backend: ["Python", "Django", "Flask", "REST API"],
        database: ["MySQL", "SQLite"], cloud: ["AWS"], vcs: ["Git", "GitHub"] } },
      projects: { url: "localhost:8000/api/projects", ms: 24, body: [
        { name: "SeedSwap", type: "Seed sharing platform", features: 5 },
        { name: "MediTrack", type: "Medical inventory", features: 4 },
        { name: "CRP", type: "Community issue reporting", features: 4 } ] }
    };
    var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    var render = function (v, ind) {
      var pad = "  ".repeat(ind), padIn = "  ".repeat(ind + 1);
      if (Array.isArray(v)) {
        var flat = v.every(function (x) { return typeof x !== "object"; });
        if (flat && v.length <= 4) return '<span class="p">[</span>' + v.map(function (x) { return render(x, 0); }).join('<span class="p">, </span>') + '<span class="p">]</span>';
        return '<span class="p">[</span>\n' + v.map(function (x) { return padIn + render(x, ind + 1); }).join('<span class="p">,</span>\n') + '\n' + pad + '<span class="p">]</span>';
      }
      if (v && typeof v === "object") {
        return '<span class="p">{</span>\n' + Object.keys(v).map(function (k) {
          return padIn + '<span class="k">"' + esc(k) + '"</span><span class="p">: </span>' + render(v[k], ind + 1);
        }).join('<span class="p">,</span>\n') + '\n' + pad + '<span class="p">}</span>';
      }
      if (typeof v === "number") return '<span class="n">' + v + '</span>';
      return '<span class="s">"' + esc(v) + '"</span>';
    };
    var tabs = document.querySelectorAll(".console-tabs button");
    var show = function (ep) {
      var d = data[ep];
      pre.innerHTML = render(d.body, 0) + ' <span class="caret" aria-hidden="true"></span>';
      pre.classList.remove("scan"); void pre.offsetWidth; pre.classList.add("scan");
      document.getElementById("req-url").textContent = d.url;
      document.getElementById("ms").textContent = d.ms;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-ep") === ep;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on) pre.setAttribute("aria-labelledby", t.id);
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t.getAttribute("data-ep")); });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); show(n.getAttribute("data-ep"));
      });
    });
    show("about");
  }

  /* ------------------------------------------------------------------
     Copy buttons
     ------------------------------------------------------------------ */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var label = b.querySelector("span") || b, old = label.textContent;
      var done = function (msg) { label.textContent = msg; setTimeout(function () { label.textContent = old; }, 1600); };
      try {
        navigator.clipboard.writeText(b.getAttribute("data-copy")).then(function () { done("Copied"); }, function () { done("Copy blocked"); });
      } catch (err) { done("Copy blocked"); }
    });
  });

  /* ------------------------------------------------------------------
     Motion
     ------------------------------------------------------------------ */
  try { motion(); } catch (err) { doc.classList.remove("enter"); if (window.console) console.error(err); }

  function motion() {
    var wipe = document.querySelector(".wipe");
    var isHome = body.getAttribute("data-page") === "home";
    var internal = ss.get("ap-internal") === "1"; ss.del("ap-internal");
    var canIO = "IntersectionObserver" in window;
    var playIntro = isHome && !reduce && !internal && canIO;

    /* scroll progress line */
    var bar = document.createElement("div");
    bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
    body.appendChild(bar);
    var ticking = false;
    var progress = function () {
      var h = doc.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.pageYOffset / h)) : 0;
      bar.style.transform = "scaleY(" + p + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
    window.addEventListener("resize", progress);
    progress();

    /* hover selection boxes on cards */
    $$(".card, .explore a, .channel, .edu").forEach(function (el) {
      var label = el.classList.contains("card") || el.tagName === "A" || el.classList.contains("channel") ? "Card" : "Frame";
      var s = document.createElement("div");
      s.className = "sel hov"; s.setAttribute("aria-hidden", "true");
      s.innerHTML = "<i></i><i></i><i></i><i></i><b></b>";
      el.classList.add("has-hov"); el.appendChild(s);
      el.addEventListener("mouseenter", function () {
        s.lastChild.textContent = label + " · " + Math.round(el.offsetWidth) + " × " + Math.round(el.offsetHeight);
      });
    });

    if (reduce) { doc.classList.remove("enter"); body.classList.add("hl-go"); return; }

    var layer = document.createElement("div");
    layer.className = "sel-layer"; layer.setAttribute("aria-hidden", "true");
    body.appendChild(layer);

    /* ---------------- selection box helper ---------------- */
    var DY = 16; // matches the translateY of .reveal
    function selectBox(el, label) {
      var r = el.getBoundingClientRect(), pad = 5;
      var b = document.createElement("div");
      b.className = "sel";
      b.style.left = (r.left + window.pageXOffset - pad) + "px";
      b.style.top = (r.top + window.pageYOffset - pad - DY) + "px";
      b.style.width = (r.width + pad * 2) + "px";
      b.style.height = (r.height + pad * 2) + "px";
      b.innerHTML = "<i></i><i></i><i></i><i></i><b>" + label + " · " + Math.round(r.width) + " × " + Math.round(r.height) + "</b>";
      layer.appendChild(b);
      return b;
    }

    /* ---------------- floating cursors ---------------- */
    var Cursors = (function () {
      var cv = document.createElement("canvas");
      cv.className = "cursors"; cv.setAttribute("aria-hidden", "true");
      body.appendChild(cv);
      var ctx = cv.getContext("2d"), W = 0, H = 0;
      function size() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      size(); window.addEventListener("resize", size);

      var colors = ["#f08a4b", "#ffcf8a", "#8fd6c8", "#5fb3a6", "#b5dc9a", "#e8b49a", "#ffffff"];
      var n = window.innerWidth < 700 ? 4 : 7, list = [], i;
      for (i = 0; i < n; i++) {
        list.push({
          c: colors[i % colors.length],
          fx: .07 + Math.random() * .12, fy: .06 + Math.random() * .12,
          px: Math.random() * 6.28, py: Math.random() * 6.28,
          x: W / 2, y: H / 2, ang: 0, m: 0,
          r: 48 + i * 17, sp: (1.1 + i * .12) * (i % 2 ? 1 : -1), ph: Math.random() * 6.28
        });
      }
      var target = 0, pt = { x: W / 2, y: H / 2 }, follow = null, last = 0;

      function frame(ts) {
        requestAnimationFrame(frame);
        var t = ts / 1000, dt = Math.min(.05, last ? t - last : .016); last = t;
        if (follow) {
          var r = follow.getBoundingClientRect();
          pt.x = Math.min(r.right, W - 150); pt.y = r.top + r.height / 2;
        }
        ctx.clearRect(0, 0, W, H);
        for (var k = 0; k < list.length; k++) {
          var c = list[k];
          c.m += (target - c.m) * Math.min(1, dt * 2.4);
          var wx = W * (.5 + .44 * Math.sin(t * c.fx + c.px) + .06 * Math.sin(t * c.fx * 3.1 + c.py));
          var wy = H * (.5 + .42 * Math.sin(t * c.fy + c.py) + .06 * Math.sin(t * c.fy * 2.7 + c.px));
          var a = t * c.sp + c.ph;
          var sx = pt.x + Math.cos(a) * c.r, sy = pt.y + Math.sin(a) * c.r * .8;
          var e = c.m * c.m * (3 - 2 * c.m);
          var nx = wx + (sx - wx) * e, ny = wy + (sy - wy) * e;
          var dx = nx - c.x, dy = ny - c.y;
          if (dx * dx + dy * dy > .01) {
            var ta = Math.atan2(dy, dx), da = ta - c.ang;
            da = Math.atan2(Math.sin(da), Math.cos(da));
            c.ang += da * .12;
          }
          c.x = nx; c.y = ny;
          ctx.save();
          ctx.translate(c.x, c.y); ctx.rotate(c.ang + 2.356); ctx.scale(.85, .85);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, 17); ctx.lineTo(4.3, 13); ctx.lineTo(7.5, 20);
          ctx.lineTo(10, 19); ctx.lineTo(7, 12.5); ctx.lineTo(12.5, 12.5); ctx.closePath();
          ctx.fillStyle = c.c; ctx.fill();
          ctx.lineWidth = 1.3; ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.stroke();
          ctx.restore();
        }
      }
      requestAnimationFrame(frame);

      return {
        swarm: function (x, y) { follow = null; pt.x = x; pt.y = y; target = 1; },
        orbit: function (el) { follow = el; target = 1; },
        release: function () { follow = null; target = 0; }
      };
    })();

    /* ---------------- reveal targets ---------------- */
    var TARGETS = [
      [".page-head h1", "Heading"], [".page-head .lede", "Text"],
      [".hero .kicker", "Text"], [".hero h1", "Heading"], [".hero .lede", "Text"], [".hero .ctas", "Buttons"], [".hero .console", "Frame"],
      [".sec-head h2", "Heading"], [".about p", "Text"], [".job", "Frame"], [".card", "Card"], [".edu", "Frame"],
      [".explore a", "Card"], [".contact h2.big", "Heading"], [".contact .lede", "Text"], [".channel", "Card"]
    ];
    var SOFT = [".fact", ".skill"];
    var all = [];
    function prep(el, label, soft) {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal"); el._label = label; el._soft = !!soft;
      all.push(el);
    }
    TARGETS.forEach(function (t) { $$(t[0]).forEach(function (el) { prep(el, t[1], false); }); });
    SOFT.forEach(function (s) { $$(s).forEach(function (el) { prep(el, "", true); }); });

    var heroEls = [];
    if (playIntro) {
      all = all.filter(function (el) {
        var inHero = !!el.closest(".hero");
        if (inHero) heroEls.push(el);
        return !inHero;
      });
    }

    var HOLD = 420;
    function clean(el) { el.classList.remove("reveal", "in"); }
    function play(el, delay) {
      wait(delay, function () {
        if (el._soft) { el.classList.add("in"); wait(900, function () { clean(el); }); return; }
        var box = selectBox(el, el._label);
        wait(HOLD, function () {
          el.classList.add("in"); box.classList.add("gone");
          wait(950, function () { if (box.parentNode) box.parentNode.removeChild(box); clean(el); });
        });
      });
    }
    function observeAll() {
      if (!canIO) { all.forEach(clean); return; }
      var io = new IntersectionObserver(function (entries) {
        var hit = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
        hit.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
        hit.forEach(function (el, i) { io.unobserve(el); play(el, i * (el._soft ? 60 : 110)); });
      }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
      all.forEach(function (el) { io.observe(el); });

      var flock = document.querySelector("[data-flock]");
      if (flock) {
        new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) Cursors.orbit(flock); else Cursors.release();
        }, { threshold: .4 }).observe(flock);
      }
    }

    /* ---------------- page-in / page-out wipe ---------------- */
    function uncover(instant) {
      if (wipe) {
        if (instant) wipe.style.transition = "none";
        wipe.classList.add("out"); void wipe.offsetHeight;
        doc.classList.remove("enter");
        if (instant) wait(60, function () { wipe.style.transition = ""; });
      } else { doc.classList.remove("enter"); }
    }
    window.addEventListener("pageshow", function (e) {
      if (e.persisted && wipe) { wipe.classList.remove("on"); wipe.classList.add("out"); doc.classList.remove("enter"); }
    });
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || !wipe) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      var h = a.getAttribute("href");
      if (!h || h.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(h)) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.protocol !== location.protocol || u.host !== location.host) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      e.preventDefault();
      ss.set("ap-internal", "1");
      wipe.style.transition = "none"; wipe.classList.remove("out"); void wipe.offsetHeight;
      wipe.style.transition = ""; wipe.classList.add("on");
      wait(620, function () { location.href = a.href; });
    });

    /* ---------------- intro ---------------- */
    function intro() {
      var root = document.createElement("div");
      root.className = "intro";
      root.innerHTML = '<div class="badge">AP</div><div class="skip">click or press any key to skip</div>';
      body.appendChild(root);
      try { history.scrollRestoration = "manual"; } catch (e) {}
      window.scrollTo(0, 0);
      doc.style.overflow = "hidden";
      uncover(true);

      var timers = [], boxes = [], done = false;
      var at = function (ms, fn) { timers.push(wait(ms, fn)); };

      Cursors.swarm(window.innerWidth / 2, window.innerHeight / 2);
      at(80, function () { root.classList.add("on"); });

      at(1500, function () {
        root.classList.add("marks");
        for (var i = 0; i < 16; i++) {
          var s = document.createElement("span");
          s.className = "xm"; s.textContent = "+";
          s.style.left = (5 + Math.random() * 90) + "%"; s.style.top = (8 + Math.random() * 84) + "%";
          s.style.animationDelay = (i * 35) + "ms";
          root.appendChild(s);
        }
        for (var j = 0; j < 5; j++) {
          var c = document.createElement("span");
          c.className = "xc";
          c.textContent = (8 + Math.round(Math.random() * 40)) + " × " + (8 + Math.round(Math.random() * 40));
          c.style.left = (6 + Math.random() * 84) + "%"; c.style.top = (10 + Math.random() * 78) + "%";
          c.style.animationDelay = (200 + j * 70) + "ms";
          root.appendChild(c);
        }
        Cursors.release();
      });

      at(2150, function () {
        root.classList.add("clear");
        heroEls.forEach(function (el, i) {
          timers.push(wait(i * 90, function () { boxes.push(selectBox(el, el._label)); }));
        });
      });

      at(3350, function () { finish(false); });

      function finish(skipped) {
        if (done) return; done = true;
        timers.forEach(clearTimeout);
        document.removeEventListener("keydown", skip);
        if (skipped) root.style.transitionDuration = ".25s";
        root.classList.add("done");
        Cursors.release();
        heroEls.forEach(function (el, i) { wait(skipped ? 0 : i * 110, function () { el.classList.add("in"); }); });
        boxes.forEach(function (b) { b.classList.add("gone"); });
        doc.style.overflow = "";
        wait(skipped ? 200 : 450, function () { body.classList.add("hl-go"); });
        wait(skipped ? 700 : 1500, function () {
          if (root.parentNode) root.parentNode.removeChild(root);
          boxes.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
          heroEls.forEach(clean);
        });
        observeAll();
      }
      function skip() { finish(true); }
      root.addEventListener("click", skip);
      document.addEventListener("keydown", skip);
    }

    if (playIntro) {
      intro();
    } else {
      wait(90, function () { uncover(false); });
      wait(460, function () { body.classList.add("hl-go"); observeAll(); });
    }
  }
})();

/* Drifting light motes, like the specks of light in the forest mist */
(function () {
  "use strict";
  try { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch (e) {}
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:5;pointer-events:none";
  document.body.appendChild(cv);
  var ctx = cv.getContext("2d"), W = 0, H = 0, motes = [];
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function make(initial) {
    return {
      x: Math.random() * W, y: initial ? Math.random() * H : -10,
      r: .6 + Math.random() * 1.8, vy: 6 + Math.random() * 16, sway: 8 + Math.random() * 22,
      ph: Math.random() * 6.28, tw: .6 + Math.random() * 1.4,
      warm: Math.random() < .25
    };
  }
  size(); window.addEventListener("resize", size);
  var n = W < 700 ? 28 : 55;
  for (var i = 0; i < n; i++) motes.push(make(true));
  var last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    var t = ts / 1000, dt = Math.min(.05, last ? t - last : .016); last = t;
    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < motes.length; k++) {
      var m = motes[k];
      m.y += m.vy * dt;
      if (m.y > H + 10) motes[k] = m = make(false);
      var x = m.x + Math.sin(t * .5 + m.ph) * m.sway;
      var a = .25 + .55 * (.5 + .5 * Math.sin(t * m.tw + m.ph));
      ctx.beginPath(); ctx.arc(x, m.y, m.r, 0, 6.283);
      ctx.fillStyle = (m.warm ? "rgba(255,196,140," : "rgba(225,245,238,") + a + ")";
      ctx.shadowColor = m.warm ? "rgba(255,170,100,.8)" : "rgba(200,240,230,.8)";
      ctx.shadowBlur = 6; ctx.fill();
    }
  }
  requestAnimationFrame(frame);
})();
