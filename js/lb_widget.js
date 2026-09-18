/* ============================================================
   lb_widget.js: widget ισοκατανομής φόρτου (Θέμα 2)
   N = 5 εργασίες, K = 3 εργαζόμενοι, όριο M (ρυθμίσιμο).
   Για κάθε συνάρτηση κόστους υπολογίζει (brute force 3^5)
   τη βέλτιστη τιμή και πόσες εφικτές αναθέσεις την πετυχαίνουν.
   ============================================================ */
(function () {
  'use strict';
  var LOADS = [6, 6, 4, 2, 2];
  var K = 3;
  var OBJ = [
    { id: 'total', name: 'Σ φόρτων (συνολικός φόρτος)', f: function (l) { return l[0] + l[1] + l[2]; }, note: 'ίδιο για κάθε ανάθεση' },
    { id: 'max', name: 'max φόρτος (min max)', f: function (l) { return Math.max.apply(null, l); } },
    { id: 'range', name: 'max − min (εύρος)', f: function (l) { return Math.max.apply(null, l) - Math.min.apply(null, l); } },
    { id: 'sq', name: 'Σ φόρτων² (τετράγωνα)', f: function (l) { return l[0] * l[0] + l[1] * l[1] + l[2] * l[2]; } },
    { id: 'negmin', name: '−min φόρτος (max του min)', f: function (l) { return -Math.min.apply(null, l); } }
  ];

  function loadsOf(a) {
    var l = [0, 0, 0];
    for (var i = 0; i < a.length; i++) l[a[i]] += LOADS[i];
    return l;
  }
  function allAssignments() {
    var out = [], n = LOADS.length, total = Math.pow(K, n);
    for (var c = 0; c < total; c++) {
      var a = [], x = c;
      for (var i = 0; i < n; i++) { a.push(x % K); x = Math.floor(x / K); }
      out.push(a);
    }
    return out;
  }
  var ALL = allAssignments();

  function init(root) {
    var M = parseInt(root.dataset.m || '10', 10);
    var cur = [0, 1, 2, 0, 1];

    root.innerHTML = '';
    var head = document.createElement('div');
    head.className = 'lb-note';
    head.innerHTML = 'Εργασίες με φόρτους <code>L = [6, 6, 4, 2, 2]</code>, <strong>K = 3</strong> εργαζόμενοι, όριο φόρτου ' +
      '<label>M = <input type="number" min="6" max="20" value="' + M + '" style="width:4.2em" class="lb-m"></label>. ' +
      'Άλλαξε τις αναθέσεις και κοίτα ποια κριτήρια «βλέπουν» τη διαφορά.';
    root.appendChild(head);

    var tasks = document.createElement('div');
    tasks.className = 'lb-tasks';
    var selects = [];
    LOADS.forEach(function (L, i) {
      var t = document.createElement('div');
      t.className = 'lb-task';
      var lab = document.createElement('span');
      lab.textContent = 'T' + (i + 1) + ' (L=' + L + ') →';
      var sel = document.createElement('select');
      sel.setAttribute('aria-label', 'Εργαζόμενος για την εργασία T' + (i + 1));
      for (var k = 0; k < K; k++) {
        var o = document.createElement('option');
        o.value = String(k); o.textContent = 'E' + (k + 1);
        sel.appendChild(o);
      }
      sel.value = String(cur[i]);
      sel.addEventListener('change', function () { cur[i] = parseInt(sel.value, 10); render(); });
      t.appendChild(lab); t.appendChild(sel);
      tasks.appendChild(t);
      selects.push(sel);
    });
    root.appendChild(tasks);

    var bars = document.createElement('div');
    bars.className = 'lb-bars';
    root.appendChild(bars);

    var status = document.createElement('div');
    status.className = 'lb-status';
    root.appendChild(status);

    var tbl = document.createElement('table');
    tbl.className = 'lb-metrics';
    root.appendChild(tbl);

    var btns = document.createElement('div');
    btns.className = 'lb-btns';
    root.appendChild(btns);
    function addBtn(label, fn) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'plx-btn'; b.textContent = label;
      b.addEventListener('click', fn);
      btns.appendChild(b);
      return b;
    }
    var cycle = {};
    OBJ.forEach(function (o) {
      if (o.id === 'total') return;
      addBtn('βέλτιστη για ' + o.name.split(' (')[0], function () {
        var opt = optimal(o);
        if (!opt.list.length) return;
        cycle[o.id] = ((cycle[o.id] === undefined ? -1 : cycle[o.id]) + 1) % opt.list.length;
        setAssign(opt.list[cycle[o.id]]);
      });
    });
    addBtn('τυχαία εφικτή', function () {
      var f = feasible();
      if (f.length) setAssign(f[Math.floor(Math.random() * f.length)]);
    });

    var mIn = head.querySelector('.lb-m');
    mIn.addEventListener('input', function () {
      var v = parseInt(mIn.value, 10);
      if (!isNaN(v) && v > 0) { M = v; render(); }
    });

    function feasible() {
      return ALL.filter(function (a) { return Math.max.apply(null, loadsOf(a)) <= M; });
    }
    function optimal(o) {
      var f = feasible();
      var best = Infinity;
      f.forEach(function (a) { var v = o.f(loadsOf(a)); if (v < best) best = v; });
      var list = f.filter(function (a) { return o.f(loadsOf(a)) === best; });
      var profiles = {};
      list.forEach(function (a) {
        var p = loadsOf(a).slice().sort(function (x, y) { return y - x; }).join(',');
        profiles[p] = true;
      });
      return { best: best, list: list, n: list.length, feasible: f.length, profiles: Object.keys(profiles) };
    }
    function setAssign(a) {
      cur = a.slice();
      selects.forEach(function (s, i) { s.value = String(cur[i]); });
      render();
    }

    function render() {
      var l = loadsOf(cur);
      var mx = Math.max(M, Math.max.apply(null, l), 1);
      bars.innerHTML = '';
      for (var k = 0; k < K; k++) {
        var nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = 'E' + (k + 1);
        var tr = document.createElement('div'); tr.className = 'track';
        var fill = document.createElement('div'); fill.className = 'fill' + (l[k] > M ? ' over' : '');
        fill.style.width = (100 * l[k] / (mx * 1.15)) + '%';
        var cap = document.createElement('div'); cap.className = 'cap';
        cap.style.left = (100 * M / (mx * 1.15)) + '%';
        cap.title = 'όριο M';
        tr.appendChild(fill); tr.appendChild(cap);
        var val = document.createElement('div'); val.className = 'val'; val.textContent = String(l[k]);
        bars.appendChild(nm); bars.appendChild(tr); bars.appendChild(val);
      }
      var ok = Math.max.apply(null, l) <= M;
      var f = feasible();
      status.className = 'lb-status ' + (ok ? 'ok' : 'bad');
      status.textContent = (ok ? '✔ Εφικτή ανάθεση' : '✘ Μη εφικτή: κάποιος ξεπερνά το M = ' + M) +
        '  ·  εφικτές αναθέσεις συνολικά: ' + f.length + ' από ' + ALL.length;

      var rows = '<thead><tr><th>Συνάρτηση κόστους (ελαχιστοποίηση)</th><th>Τώρα</th><th>Βέλτιστη τιμή</th><th>Πόσες αναθέσεις τη φτάνουν</th><th>Προφίλ φόρτων των βέλτιστων</th></tr></thead><tbody>';
      OBJ.forEach(function (o) {
        var opt = optimal(o);
        var now = o.f(l);
        var isOpt = ok && f.length && now === opt.best;
        var bad = o.id === 'total' || (opt.feasible && opt.n === opt.feasible);
        rows += '<tr' + (bad ? ' class="bad"' : '') + '><td>' + o.name + '</td><td class="num">' + now +
          (isOpt ? ' ✔' : '') + '</td><td class="num">' + (f.length ? opt.best : '−') + '</td><td class="num">' +
          (f.length ? opt.n + ' / ' + opt.feasible : '−') + '</td><td class="num">' +
          (f.length ? opt.profiles.map(function (p) { return '(' + p + ')'; }).join(' ') : '−') + '</td></tr>';
      });
      rows += '</tbody>';
      tbl.innerHTML = rows;
    }
    render();
  }

  function initAll() { document.querySelectorAll('.lb[data-widget="balance"]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
