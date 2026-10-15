(function () {
  var STEPS = window.STEPS;
  var URL_ = window.SERVICE_URL;
  var URL_TEXT = URL_.replace(/^https?:\/\//, '');
  var DRAFT_KEY = 'oneulmoney-ut-draft';

  var stepEl = document.getElementById('step');
  var form = document.getElementById('form');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var errorEl = document.getElementById('error');

  // 답은 한곳에 모아 두고 단계를 오갈 때마다 다시 그린다.
  // 새로고침이나 실수로 탭을 닫아도 이어서 쓸 수 있게 브라우저에 임시 저장한다.
  var state = { index: 0, answers: {}, opened: {}, skipped: {}, startedAt: new Date().toISOString() };
  try {
    var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (saved && saved.answers) state = saved;
  } catch (e) {}

  function persist() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function fieldHTML(f) {
    var v = state.answers[f.key] == null ? '' : state.answers[f.key];
    var req = f.required ? '<span class="req" aria-label="필수">*</span>' : '';
    var label = '<span class="label" id="l-' + f.key + '">' + esc(f.label) + req + '</span>';
    var body = '';

    if (f.type === 'text') {
      body = '<input class="input" name="' + f.key + '" aria-labelledby="l-' + f.key + '" value="' + esc(v) + '"' +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + ' autocomplete="off" />';
    } else if (f.type === 'long') {
      body = '<textarea class="textarea" name="' + f.key + '" aria-labelledby="l-' + f.key + '"' +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(v) + '</textarea>';
    } else if (f.type === 'choice') {
      body = '<div class="choices' + (f.inline ? ' choices--inline' : '') + '" role="radiogroup" aria-labelledby="l-' + f.key + '">' +
        f.options.map(function (o) {
          return '<label class="choice"><input type="radio" name="' + f.key + '" value="' + esc(o) + '"' +
            (v === o ? ' checked' : '') + ' /><span>' + esc(o) + '</span></label>';
        }).join('') + '</div>';
    } else if (f.type === 'scale') {
      // SEQ는 모든 과업에서 같은 척도라 기본값으로 둔다
      var min = f.min || 1, max = f.max || 7;
      var lo = f.minLabel || (f.seq ? '매우 어려움' : ''), hi = f.maxLabel || (f.seq ? '매우 쉬움' : '');
      var cells = '';
      for (var i = min; i <= max; i++) {
        cells += '<label><input type="radio" name="' + f.key + '" value="' + i + '"' +
          (String(v) === String(i) ? ' checked' : '') + ' aria-label="' + i + '점" /><span>' + i + '</span></label>';
      }
      body = '<div class="scale" role="radiogroup" aria-labelledby="l-' + f.key + '">' +
        '<div class="scale__row" style="grid-template-columns:repeat(' + (max - min + 1) + ',1fr)">' + cells + '</div>' +
        '<div class="scale__ends"><span>' + esc(lo) + '</span><span>' + esc(hi) + '</span></div></div>';
    }
    return '<div class="field" data-key="' + f.key + '">' + label + body + '</div>';
  }

  function seqLabel(step) {
    // 과업 화면에서는 "과업 1 난이도" 대신 참가자에게 묻는 말로 보여준다
    return step.fields.map(function (f) {
      return f.seq ? Object.assign({}, f, { label: '방금 과업은 얼마나 쉬웠나요?' }) : f;
    });
  }

  // 시작·첫인상·과업 화면에 같은 모양으로 넣는 서비스 링크 카드
  function serviceCard() {
    return '<a class="service-card" href="' + esc(URL_) + '" target="_blank" rel="noopener">' +
      '<img src="assets/logo.svg" alt="" /><span><b>오늘머니</b><small>' + esc(URL_TEXT) + '</small></span><i>열기 ↗</i></a>';
  }

  function render() {
    var step = STEPS[state.index];
    var html = '';

    if (step.task) {
      html += '<p class="eyebrow">과업 ' + step.task + (step.optional ? ' · 선택' : '') + '</p>';
      html += '<h1 class="step-title">' + esc(step.title) + '</h1>';
      html += '<div class="scenario"><small>진행자가 드린 과업</small>' + esc(step.scenario) + '</div>';
      html += serviceCard();

      if (state.skipped[step.id]) {
        html += '<div class="gate"><p>이 과업은 진행하지 않았어요.</p>' +
          '<button type="button" class="btn btn--ghost" data-act="unskip">진행했다면 다시 열기</button></div>';
      } else if (step.gate && !state.opened[step.id]) {
        html += '<div class="gate"><p>과업을 직접 해 본 뒤에 버튼을 눌러 주세요.<br />질문은 그다음에 보여 드려요.</p>' +
          '<button type="button" class="btn btn--primary" data-act="open">과업을 마쳤어요</button>';
        if (step.optional) {
          html += '<label class="skip"><input type="checkbox" data-act="skip" /> 진행자가 이 과업을 건너뛰었어요</label>';
        }
        html += '</div>';
      } else {
        html += '<div class="fields">' + seqLabel(step).map(fieldHTML).join('') + '</div>';
      }
    } else {
      html += '<p class="eyebrow">' + (state.index + 1) + ' / ' + STEPS.length + '</p>';
      html += '<h1 class="step-title">' + esc(step.title) + '</h1>';
      if (step.desc) html += '<p class="step-desc">' + esc(step.desc) + '</p>';
      // 첫인상은 여기서 서비스를 처음 연다
      if (step.id === 'start' || step.id === 'first') html += serviceCard();
      html += '<div class="fields">' + step.fields.map(fieldHTML).join('') + '</div>';
    }

    stepEl.innerHTML = html;
    errorEl.textContent = '';
    prevBtn.hidden = state.index === 0;
    var locked = step.task && step.gate && !state.opened[step.id] && !state.skipped[step.id];
    nextBtn.disabled = !!locked;
    nextBtn.textContent = state.index === STEPS.length - 1 ? '제출하기' : '다음';
    document.getElementById('count').textContent = (state.index + 1) + ' / ' + STEPS.length;
    document.getElementById('bar').style.width = ((state.index + 1) / STEPS.length * 100) + '%';
    window.scrollTo(0, 0);
  }

  function collect() {
    STEPS[state.index].fields.forEach(function (f) {
      var els = form.querySelectorAll('[name="' + f.key + '"]');
      if (!els.length) return;
      if (els[0].type === 'radio') {
        var c = form.querySelector('[name="' + f.key + '"]:checked');
        if (c) state.answers[f.key] = c.value;
      } else {
        state.answers[f.key] = els[0].value.trim();
      }
    });
    persist();
  }

  function validate() {
    var step = STEPS[state.index];
    if (state.skipped[step.id]) return true;
    var missing = step.fields.filter(function (f) {
      return f.required && !String(state.answers[f.key] || '').trim();
    });
    form.querySelectorAll('.field').forEach(function (el) {
      el.classList.toggle('is-invalid', missing.some(function (f) { return f.key === el.dataset.key; }));
    });
    if (missing.length) {
      errorEl.textContent = '* 표시한 문항에 답해 주세요.';
      var first = form.querySelector('.field.is-invalid');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  function payload() {
    // 스프레드시트는 label을 열 제목으로 쓴다. 문항 순서 그대로 보낸다.
    var fields = [];
    STEPS.forEach(function (step) {
      step.fields.forEach(function (f) {
        var v = state.skipped[step.id] ? '(건너뜀)' : (state.answers[f.key] || '');
        fields.push({ key: f.key, label: f.label, value: v });
      });
    });
    return {
      participant: state.answers.participant || '',
      started_at: state.startedAt,
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      fields: fields
    };
  }

  function submit() {
    nextBtn.disabled = true;
    nextBtn.textContent = '보내는 중…';
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload())
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || !j.ok) throw new Error(j.error || ('HTTP ' + r.status));
      });
    }).then(function () {
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      document.querySelector('.nav').remove();
      document.getElementById('bar').style.width = '100%';
      stepEl.innerHTML =
        '<div class="done"><div class="done__check"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
        '<h1>응답을 보냈어요</h1><p>참여해 주셔서 감사해요.<br />진행자에게 화면을 보여 주세요.</p></div>';
      errorEl.textContent = '';
    }).catch(function () {
      nextBtn.disabled = false;
      nextBtn.textContent = '다시 보내기';
      errorEl.textContent = '보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요. 적은 내용은 그대로 남아 있어요.';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    collect();
    if (!validate()) return;
    if (state.index === STEPS.length - 1) return submit();
    state.index++;
    persist();
    render();
  });

  prevBtn.addEventListener('click', function () {
    collect();
    state.index = Math.max(0, state.index - 1);
    persist();
    render();
  });

  stepEl.addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    var id = STEPS[state.index].id;
    if (act === 'open') { state.opened[id] = true; persist(); render(); }
    if (act === 'unskip') { delete state.skipped[id]; persist(); render(); }
  });
  stepEl.addEventListener('change', function (e) {
    if (e.target.getAttribute('data-act') === 'skip' && e.target.checked) {
      state.skipped[STEPS[state.index].id] = true; persist(); render();
      return;
    }
    // 고르는 즉시 빨간 테두리를 지운다
    var field = e.target.closest && e.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
    collect();
  });
  // 다음을 누르기 전에 새로고침해도 쓰던 글이 남게 입력할 때마다 저장한다
  stepEl.addEventListener('input', collect);

  render();
})();
