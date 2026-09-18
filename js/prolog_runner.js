/* ============================================================
   prolog_runner.js
   Prolog μέσα στη σελίδα (Tau Prolog 0.3.4, js/vendor/tau).
   Κάθε <div class="plx"> γίνεται ένας μικρός «διερμηνέας»:
   editor προγράμματος, ερώτηση ?-, απαντήσεις με ; (backtracking),
   αυτόματος έλεγχος απέναντι στη λύση αναφοράς.

   Markup:
   <div class="plx" data-id="b1" data-query="maxage(P)." data-title="...">
     <script type="text/plain" class="plx-src">...αρχικός κώδικας...</script>
     <script type="text/plain" class="plx-ref">...λύση αναφοράς...</script>        (προαιρετικό)
     <script type="application/json" class="plx-tests">[{"q":"...","n":10}]</script> (προαιρετικό)
     <script type="text/plain" class="plx-stdin">why.\nyes.</script>             (προαιρετικό, για read/1)
   </div>
   ============================================================ */
(function () {
  'use strict';

  var SLICE = 40000;          // βήματα ανά «φέτα» (μετά δίνουμε τον έλεγχο στον browser)
  var RUN_BUDGET = 25000000;  // μέγιστα βήματα για ένα «Τρέξε / ;»
  var CHECK_BUDGET = 40000000;
  var MAX_ALL = 30;           // «Όλες»: το πολύ τόσες απαντήσεις

  var PRELUDE = [
    ':- use_module(library(lists)).',
    ':- use_module(library(format)).',
    ':- op(900, fy, not).',
    'not(G) :- \\+ call(G).',
    'writeln(X) :- write(X), nl.',
    'assert(C) :- assertz(C).',
    'print(X) :- write(X).',
    'tab(N) :- N > 0, !, put_char(\' \'), N1 is N - 1, tab(N1).',
    'tab(_).',
    'numlist(L, H, []) :- L > H, !.',
    'numlist(L, H, [L|T]) :- L1 is L + 1, numlist(L1, H, T).',
    'sumlist(L, S) :- sum_list(L, S).',
    'delete([], _, []).',
    'delete([X|Xs], Y, Zs) :- \\+ X \\= Y, !, delete(Xs, Y, Zs).',
    'delete([X|Xs], Y, [X|Zs]) :- delete(Xs, Y, Zs).',
    'subtract([], _, []).',
    'subtract([X|Xs], L, R) :- memberchk(X, L), !, subtract(Xs, L, R).',
    'subtract([X|Xs], L, [X|R]) :- subtract(Xs, L, R).',
    'flatten(List, Flat) :- plx_flat(List, [], Flat0), !, Flat = Flat0.',
    'plx_flat(V, T, [V|T]) :- var(V), !.',
    'plx_flat([], T, T) :- !.',
    'plx_flat([H|Rest], T, L) :- !, plx_flat(H, FT, L), plx_flat(Rest, T, FT).',
    'plx_flat(X, T, [X|T]).',
    'max_member(M, L) :- plx_maxm(L, M).',
    'plx_maxm([H|T], M) :- plx_maxm(T, H, M).',
    'plx_maxm([], M, M).',
    'plx_maxm([H|T], M0, M) :- ( H @> M0 -> M1 = H ; M1 = M0 ), plx_maxm(T, M1, M).',
    'min_member(M, L) :- plx_minm(L, M).',
    'plx_minm([H|T], M) :- plx_minm(T, H, M).',
    'plx_minm([], M, M).',
    'plx_minm([H|T], M0, M) :- ( H @< M0 -> M1 = H ; M1 = M0 ), plx_minm(T, M1, M).',
    'partition(_, [], [], []).',
    'partition(P, [H|T], I, E) :- ( call(P, H) -> I = [H|I1], E = E1 ; I = I1, E = [H|E1] ), partition(P, T, I1, E1).',
    'aggregate_all(count, G, C) :- findall(x, G, L), length(L, C).',
    'aggregate_all(sum(E), G, S) :- findall(E, G, L), sum_list(L, S).',
    'aggregate_all(max(E), G, M) :- findall(E, G, L), max_list(L, M).',
    'aggregate_all(min(E), G, M) :- findall(E, G, L), min_list(L, M).'
  ].join('\n');

  var CONSULT_OPTS = { file: false, url: false, script: false, html: false };

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }
  function childText(root, cls) {
    var s = root.querySelector(':scope > script.' + cls);
    if (!s) return null;
    return s.textContent.replace(/^\n/, '').replace(/\s+$/, '') + '\n';
  }
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      if (val === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }
  function normAnswer(s) {
    return String(s)
      .replace(/\b_+[A-Z]?\d+\b/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ---------- ελληνικά μηνύματα για τα συνήθη σφάλματα ---------- */
  function explainError(raw) {
    var m;
    raw = String(raw);
    if ((m = raw.match(/existence_error\(procedure,\(?([^)]*?)\)?\/(\d+)\)/))) {
      return 'Δεν υπάρχει ορισμός για ' + m[1] + '/' + m[2] +
        '. Ξέχασες να το ορίσεις, ή το όνομα / το πλήθος των ορισμάτων δεν ταιριάζει με τον ορισμό σου;';
    }
    if (/instantiation_error/.test(raw)) {
      return 'instantiation_error: μια μεταβλητή ήταν ελεύθερη εκεί που χρειαζόταν τιμή ' +
        '(π.χ. X < Y ή N is M + 1 με ελεύθερο Y / M). Κοίτα τη σειρά των στόχων στο σώμα.';
    }
    if ((m = raw.match(/type_error\(evaluable,([^)]*)\)/))) {
      return 'type_error: το ' + m[1] + ' δεν είναι αριθμητική έκφραση. Μήπως έβαλες όρο (π.χ. λίστα) σε is ή σε σύγκριση;';
    }
    if (/type_error/.test(raw)) {
      return 'type_error: ένα όρισμα δεν έχει τον τύπο που περιμένει το ενσωματωμένο κατηγόρημα.';
    }
    if ((m = raw.match(/syntax_error\((.*)\),\[line\((\d+)\),column\((\d+)\)(?:,found\((.*)\))?\]/))) {
      return 'Συντακτικό λάθος στη γραμμή ' + m[2] + ', στήλη ' + m[3] + ': ' + m[1] +
        (m[4] ? ' (βρέθηκε: ' + m[4] + ')' : '') + '. Έλεγξε τελείες, κόμματα και παρενθέσεις.';
    }
    if (/syntax_error/.test(raw)) return 'Συντακτικό λάθος: ' + raw;
    if (/permission_error/.test(raw)) {
      return 'permission_error: προσπάθησες να αλλάξεις ενσωματωμένο κατηγόρημα (π.χ. ορισμός για =/2 ή is/2).';
    }
    return raw;
  }

  /* ---------- δημιουργία session με prelude + πρόγραμμα ---------- */
  function newSession(program, io, done) {
    var s = pl.create(SLICE);
    s.streams.user_output.stream = {
      put: function (t) { io.out(t); return true; },
      flush: function () { return true; }
    };
    s.streams.user_error.stream = s.streams.user_output.stream;
    var inbuf = { text: io.stdin || '' };
    s.streams.user_input.stream = {
      get: function (length) {
        while (inbuf.text.length < length) {
          if (io.noPrompt) {
            if (!inbuf.text.length) return 'end_of_stream';
            length = inbuf.text.length;
            break;
          }
          var t = window.prompt('Η Prolog περιμένει είσοδο για read/1.\nΓράψε έναν όρο με τελεία στο τέλος (π.χ. yes.)', '');
          if (t === null) return 'end_of_stream';
          inbuf.text += t + '\n';
        }
        var r = inbuf.text.substr(0, length);
        inbuf.text = inbuf.text.substr(length);
        return r;
      },
      eof: function () { return false; }
    };
    s.consult(PRELUDE, Object.assign({}, CONSULT_OPTS, {
      success: function () {
        s.consult(program, Object.assign({}, CONSULT_OPTS, {
          success: function () { done(null, s); },
          error: function (err) { done('Σφάλμα στο πρόγραμμα: ' + explainError(s.format_answer(err)), s); }
        }));
      },
      error: function (err) { done('Σφάλμα prelude: ' + s.format_answer(err), s); }
    }));
  }

  /* Τρέχει ερώτηση και επιστρέφει «δρομέα» που δίνει απαντήσεις μία-μία */
  function openQuery(s, query, cb) {
    var q = query.trim();
    if (!/\.\s*$/.test(q)) q += '.';
    s.query(q, {
      success: function () { cb(null); },
      error: function (err) { cb('Λάθος στην ερώτηση: ' + explainError(s.format_answer(err))); }
    });
  }

  function nextAnswer(s, state, budget, cb) {
    // cb(kind, text): kind in 'answer' | 'false' | 'error' | 'budget' | 'cancel'
    var stepsHere = 0;
    function go() {
      if (state.cancelled) { cb('cancel'); return; }
      s.answer({
        success: function (a) { cb('answer', s.format_answer(a)); },
        fail: function () { cb('false'); },
        error: function (e) { cb('error', explainError(s.format_answer(e))); },
        limit: function () {
          stepsHere += SLICE;
          state.steps = (state.steps || 0) + SLICE;
          if (state.onProgress) state.onProgress(state.steps);
          if (stepsHere >= budget) { cb('budget'); return; }
          setTimeout(go, 0);
        }
      });
    }
    go();
  }

  /* Συλλογή έως n απαντήσεων (για τον έλεγχο) */
  function collect(program, query, n, stdin, done) {
    var out = '';
    var res = { answers: [], end: '', output: '' };
    newSession(program, { out: function (t) { out += t; }, stdin: stdin, noPrompt: true }, function (err, s) {
      if (err) { res.end = 'consult-error'; res.error = err; res.output = out; done(res); return; }
      openQuery(s, query, function (qerr) {
        if (qerr) { res.end = 'query-error'; res.error = qerr; done(res); return; }
        var state = {};
        (function loop() {
          if (res.answers.length >= n) { res.end = 'more'; res.output = out; done(res); return; }
          nextAnswer(s, state, CHECK_BUDGET, function (kind, text) {
            if (kind === 'answer') { res.answers.push(normAnswer(text)); loop(); return; }
            res.end = kind;
            if (kind === 'error') res.error = text;
            res.output = out;
            done(res);
          });
        })();
      });
    });
  }

  /* ---------- UI ---------- */
  var blockSeq = 0;
  function initBlock(root) {
    if (root.dataset.plxReady) return;
    root.dataset.plxReady = '1';
    blockSeq++;
    var id = root.dataset.id || ('b' + blockSeq);
    var storeKey = 'plx:' + location.pathname.split('/').pop() + ':' + id;
    var src = childText(root, 'plx-src') || '';
    var ref = childText(root, 'plx-ref');
    var stdin = childText(root, 'plx-stdin');
    var testsNode = root.querySelector(':scope > script.plx-tests');
    var tests = null;
    if (testsNode) { try { tests = JSON.parse(testsNode.textContent); } catch (e) { tests = null; } }
    var defQuery = root.dataset.query || '';
    if (!tests && ref && defQuery) tests = [{ q: defQuery, n: 20 }];

    var head = el('div', 'plx-hd');
    head.appendChild(el('span', 'plx-badge', 'Prolog'));
    head.appendChild(el('span', 'plx-title', root.dataset.title || 'Γράψε, τρέξε, έλεγξε'));
    root.appendChild(head);

    var ta = el('textarea', 'plx-prog');
    ta.spellcheck = false;
    ta.setAttribute('autocapitalize', 'off');
    ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('aria-label', 'Κώδικας Prolog');
    var saved = store(storeKey);
    ta.value = saved !== null && saved !== undefined ? saved : src;
    root.appendChild(ta);
    function fit() {
      ta.style.height = 'auto';
      ta.style.height = Math.min(Math.max(ta.scrollHeight + 4, 90), 640) + 'px';
    }
    ta.addEventListener('input', function () { fit(); store(storeKey, ta.value); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var a = ta.selectionStart, b = ta.selectionEnd;
        ta.value = ta.value.slice(0, a) + '    ' + ta.value.slice(b);
        ta.selectionStart = ta.selectionEnd = a + 4;
        store(storeKey, ta.value);
      }
    });

    var stdinBox = null;
    if (stdin !== null) {
      var sl = el('label', 'plx-stdin-lbl', 'Είσοδος για read/1 (μία απάντηση ανά γραμμή, με τελεία):');
      stdinBox = el('textarea', 'plx-stdin-box');
      stdinBox.value = stdin.replace(/\n$/, '');
      stdinBox.rows = 2;
      stdinBox.spellcheck = false;
      root.appendChild(sl);
      root.appendChild(stdinBox);
    }

    var qrow = el('div', 'plx-qrow');
    qrow.appendChild(el('span', 'plx-prompt', '?-'));
    var qin = el('input', 'plx-query');
    qin.type = 'text';
    qin.value = defQuery;
    qin.spellcheck = false;
    qin.setAttribute('aria-label', 'Ερώτηση');
    qrow.appendChild(qin);
    root.appendChild(qrow);

    var bar = el('div', 'plx-bar');
    function btn(label, cls, title) {
      var b = el('button', 'plx-btn ' + (cls || ''), label);
      b.type = 'button';
      if (title) b.title = title;
      bar.appendChild(b);
      return b;
    }
    var bRun = btn('▶ Τρέξε', 'go', 'Πρώτη απάντηση (Enter στην ερώτηση)');
    var bNext = btn('; επόμενη', '', 'Backtracking: ζήτα την επόμενη απάντηση');
    var bAll = btn('Όλες', '', 'Όλες οι απαντήσεις (έως ' + MAX_ALL + ')');
    var bStop = btn('■ Διακοπή', 'stop', 'Σταμάτα την εκτέλεση');
    var bCheck = tests && ref ? btn('✔ Έλεγχος', 'check', 'Σύγκρινε με τη λύση αναφοράς') : null;
    var bSol = ref ? btn('Λύση στον editor', 'sol', 'Φόρτωσε τη λύση αναφοράς (ο δικός σου κώδικας κρατιέται)') : null;
    var bReset = btn('↺ Αρχικό', 'reset', 'Επαναφορά στον αρχικό κώδικα της άσκησης');
    bNext.disabled = true;
    bStop.disabled = true;
    root.appendChild(bar);

    var out = el('pre', 'plx-out');
    out.setAttribute('aria-live', 'polite');
    root.appendChild(out);

    var cur = null;     // { s, state }
    var mineBackup = null;

    function print(text, cls) {
      var span = el('span', cls || '', text);
      out.appendChild(span);
      out.scrollTop = out.scrollHeight;
    }
    function busy(on) {
      bRun.disabled = on; bAll.disabled = on;
      if (bCheck) bCheck.disabled = on;
      bStop.disabled = !on;
      if (on) bNext.disabled = true;
      root.classList.toggle('plx-busy', on);
    }
    function stopCurrent() {
      if (cur && cur.state) cur.state.cancelled = true;
      cur = null;
      bNext.disabled = true;
    }

    function startRun(all) {
      stopCurrent();
      var program = ta.value;
      var query = qin.value;
      out.textContent = '';
      if (/\.{4,}|…/.test(program)) {
        print('Υπάρχουν ακόμα κενά (.....) στον κώδικα. Συμπλήρωσέ τα και ξανατρέξε.\n', 'plx-warn');
        return;
      }
      if (!query.trim()) { print('Γράψε μια ερώτηση δίπλα στο ?-\n', 'plx-warn'); return; }
      print('?- ' + query.trim().replace(/\.?\s*$/, '.') + '\n', 'plx-q');
      busy(true);
      var state = { steps: 0 };
      var pending = '';
      var io = {
        out: function (t) { pending += t; },
        stdin: stdinBox ? stdinBox.value + '\n' : ''
      };
      newSession(program, io, function (err, s) {
        if (err) { print(err + '\n', 'plx-err'); busy(false); return; }
        openQuery(s, query, function (qerr) {
          if (qerr) { print(qerr + '\n', 'plx-err'); busy(false); return; }
          cur = { s: s, state: state };
          var count = 0;
          step();
          function flushOut() { if (pending) { print(pending, 'plx-io'); pending = ''; } }
          function step() {
            nextAnswer(s, state, RUN_BUDGET, function (kind, text) {
              if (!cur || cur.state !== state) return;
              flushOut();
              if (kind === 'answer') {
                count++;
                print(text, 'plx-a');
                if (all && count < MAX_ALL) { print(' ;\n', 'plx-dim'); step(); return; }
                if (all) print(' ;\n… (σταματάω στις ' + MAX_ALL + ' απαντήσεις)\n', 'plx-dim');
                else print('\n', '');
                busy(false);
                bNext.disabled = false;
                cur.next = step;
                return;
              }
              busy(false);
              bNext.disabled = true;
              if (kind === 'false') print('false.\n', 'plx-no');
              else if (kind === 'error') print('ERROR: ' + text + '\n', 'plx-err');
              else if (kind === 'budget') print('Σταμάτησα μετά από ' + state.steps.toLocaleString('el-GR') +
                ' βήματα. Πιθανός ατέρμονος βρόχος (ή πολύ ακριβός υπολογισμός για τον browser).\n', 'plx-warn');
              else if (kind === 'cancel') print('Διακόπηκε.\n', 'plx-warn');
              cur = null;
            });
          }
          cur.next = step;
        });
      });
    }

    function nextRun() {
      if (!cur || !cur.next) return;
      var lastSpan = out.lastChild;
      if (lastSpan && lastSpan.textContent === '\n') out.removeChild(lastSpan);
      print(' ;\n', 'plx-dim');
      busy(true);
      cur.next();
    }

    function runCheck() {
      stopCurrent();
      out.textContent = '';
      var program = ta.value;
      if (/\.{4,}|…/.test(program)) {
        print('Υπάρχουν ακόμα κενά (.....) στον κώδικα. Συμπλήρωσέ τα πρώτα.\n', 'plx-warn');
        return;
      }
      busy(true);
      var i = 0, passed = 0;
      var stdinText = stdinBox ? stdinBox.value + '\n' : '';
      print('Έλεγχος σε ' + tests.length + ' ερωτήσεις…\n', 'plx-dim');
      (function nextTest() {
        if (i >= tests.length) {
          var ok = passed === tests.length;
          var isRef = ref && program.replace(/\s+/g, '') === ref.replace(/\s+/g, '');
          print((ok ? '✔ Όλα σωστά (' : '✘ Πέρασαν ') + passed + '/' + tests.length + (ok ? ')' : '') + '\n', ok ? 'plx-ok' : 'plx-err');
          if (ok && isRef) {
            print('(Αυτή είναι η λύση αναφοράς. Γράψε τη δική σου για να «μετρήσει» η άσκηση.)\n', 'plx-dim');
          } else if (ok) {
            root.classList.add('plx-solved');
            store(storeKey + ':ok', '1');
          }
          busy(false);
          return;
        }
        var t = tests[i++];
        var n = t.n || 20;
        collect(program, t.q, n, stdinText, function (mine) {
          collect(ref, t.q, n, stdinText, function (want) {
            var same = mine.end === want.end &&
              mine.answers.join('\n') === want.answers.join('\n') &&
              (!t.out || mine.output === want.output);
            if (mine.end === 'error' && want.end === 'error' && t.err !== false) same = same && true;
            if (same) {
              passed++;
              print('✔ ?- ' + t.q + (t.label ? '   (' + t.label + ')' : '') + '\n', 'plx-ok');
            } else {
              print('✘ ?- ' + t.q + (t.label ? '   (' + t.label + ')' : '') + '\n', 'plx-err');
              print(describe('   αναμενόταν: ', want) + describe('   έδωσες:     ', mine), 'plx-diff');
            }
            nextTest();
          });
        });
      })();
    }
    function describe(prefix, r) {
      var lines = [];
      if (r.answers.length) lines.push(r.answers.slice(0, 8).join(' ;  ') + (r.answers.length > 8 ? ' ; …' : ''));
      if (r.end === 'false') lines.push(r.answers.length ? '(μετά: false)' : 'false');
      if (r.end === 'more') lines.push('(… και άλλες)');
      if (r.end === 'error' || r.end === 'consult-error' || r.end === 'query-error') lines.push('ERROR: ' + r.error);
      if (r.end === 'budget') lines.push('(δεν τελείωσε: όριο βημάτων)');
      if (r.output) lines.push('έξοδος: ' + JSON.stringify(r.output));
      return prefix + lines.join('  ') + '\n';
    }

    bRun.addEventListener('click', function () { startRun(false); });
    bAll.addEventListener('click', function () { startRun(true); });
    bNext.addEventListener('click', nextRun);
    bStop.addEventListener('click', function () { if (cur && cur.state) cur.state.cancelled = true; });
    qin.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); startRun(false); }
      else if (e.key === ';' && !bNext.disabled) { e.preventDefault(); nextRun(); }
    });
    if (bCheck) bCheck.addEventListener('click', runCheck);
    if (bSol) bSol.addEventListener('click', function () {
      if (mineBackup === null) {
        mineBackup = ta.value;
        ta.value = ref;
        bSol.textContent = 'Επιστροφή στον κώδικά μου';
      } else {
        ta.value = mineBackup;
        mineBackup = null;
        bSol.textContent = 'Λύση στον editor';
      }
      fit();
    });
    bReset.addEventListener('click', function () {
      ta.value = src;
      store(storeKey, null);
      mineBackup = null;
      if (bSol) bSol.textContent = 'Λύση στον editor';
      out.textContent = '';
      root.classList.remove('plx-solved');
      fit();
    });
    if (store(storeKey + ':ok') === '1') root.classList.add('plx-solved');
    requestAnimationFrame(fit);
  }

  function initAll() {
    if (typeof pl === 'undefined') {
      document.querySelectorAll('.plx').forEach(function (b) {
        b.appendChild(el('div', 'plx-err', 'Δεν φορτώθηκε ο διερμηνέας (js/vendor/tau). Έλεγξε ότι υπάρχει ο φάκελος js/vendor/tau.'));
      });
      return;
    }
    document.querySelectorAll('.plx').forEach(initBlock);
  }
  window.PrologRunner = { init: initAll, collect: collect, PRELUDE: PRELUDE };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
