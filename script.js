/**
 * 東大版高一國文·段考逆襲閣 - 互動核心邏輯
 * 專為高一第一次段考失利同學設計的互動學習工具
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initExamBreakdown();
  initDiagnostic();
  initLessons();
  initPitfalls();
  initMatchingGame();
  initFlashcards();
  initQuiz();
  initNotebook();
  initStudyPlan();
});

/* ==========================================================================
   1. 主題切換 (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('dongda_theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dongda_theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('themeToggleBtn');
  toggleBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

/* ==========================================================================
   1.5 段考四大題型透析 & 選擇題錯9題破題戰術
   ========================================================================== */
function initExamBreakdown() {
  const sectionsGrid = document.getElementById('examSectionsGrid');
  const trapsGrid = document.getElementById('trapsGrid');
  const analysis = CHINESE_DATA.examAnalysis;

  if (sectionsGrid && analysis && analysis.sectionsGuide) {
    sectionsGrid.innerHTML = analysis.sectionsGuide.map(sec => {
      const isTranslation = sec.section.includes('翻譯');
      const isMCQ = sec.section.includes('選擇');
      return `
        <div class="exam-sec-card ${isMCQ ? 'highlight-focus' : ''}">
          <div class="exam-sec-header">
            <span class="exam-sec-name">${sec.section}</span>
            ${isTranslation ? '<span class="exam-sec-tag tag-success">🎉 滿分全對！</span>' : ''}
            ${isMCQ ? '<span class="exam-sec-tag tag-alert">⚠️ 錯9題·逆襲重點</span>' : ''}
          </div>
          <p class="exam-sec-strategy">${sec.strategy}</p>
        </div>
      `;
    }).join('');
  }

  if (trapsGrid && analysis && analysis.traps) {
    trapsGrid.innerHTML = analysis.traps.map(trap => `
      <div class="trap-card">
        <div class="trap-card-top">
          <span class="trap-number-badge">${trap.num}</span>
          <span class="trap-title">${trap.title}</span>
        </div>
        <p class="trap-symptom"><strong>陷阱痛點：</strong>${trap.symptom}</p>
        <div class="trap-solution">${trap.solution}</div>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   2. 第一次段考失分根源診斷室
   ========================================================================== */
function initDiagnostic() {
  const grid = document.getElementById('diagnosticGrid');
  const generateBtn = document.getElementById('generateDiagnosticBtn');
  const resultContainer = document.getElementById('diagnosticResult');
  const countBadge = document.getElementById('symptomCountBadge');
  const generalAdviceText = document.getElementById('generalAdviceText');
  const adviceList = document.getElementById('adviceList');

  const symptoms = CHINESE_DATA.diagnostic.symptoms;

  // 渲染症狀選項
  grid.innerHTML = symptoms.map(s => `
    <div class="symptom-card" data-id="${s.id}">
      <input type="checkbox" class="symptom-checkbox" id="chk-${s.id}">
      <div class="symptom-content">
        <h4>${s.label}</h4>
        <p>${s.desc}</p>
      </div>
    </div>
  `).join('');

  // 點擊卡片切換選取
  grid.querySelectorAll('.symptom-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const checkbox = card.querySelector('.symptom-checkbox');
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      card.classList.toggle('selected', checkbox.checked);
    });
  });

  // 產生處方籤
  generateBtn.addEventListener('click', () => {
    const selectedCards = grid.querySelectorAll('.symptom-card.selected');
    const selectedIds = Array.from(selectedCards).map(c => c.getAttribute('data-id'));

    if (selectedIds.length === 0) {
      alert('請先在上方勾選至少 1 個符合你段考狀況的項目喔！');
      return;
    }

    countBadge.textContent = `已鎖定 ${selectedIds.length} 大核心弱點`;
    generalAdviceText.textContent = CHINESE_DATA.diagnostic.generalAdvice;

    const matchedSymptoms = symptoms.filter(s => selectedIds.includes(s.id));
    adviceList.innerHTML = matchedSymptoms.map(s => `
      <li class="advice-item">
        <span class="advice-badge">🎯 針對：${s.category}</span>
        <h5 style="color: var(--text-heading); margin-bottom: 0.3rem;">【診斷發現】${s.label}</h5>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">${s.advice}</p>
      </li>
    `).join('');

    resultContainer.classList.add('active');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ==========================================================================
   3. 課文精讀庫與篩選 & 彈窗 (Modal)
   ========================================================================== */
function initLessons() {
  const lessonsGrid = document.getElementById('lessonsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('lessonModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function renderLessons(filter = 'all') {
    const lessons = CHINESE_DATA.lessons;
    let filtered = lessons;

    if (filter === 'exam1') {
      filtered = lessons.filter(l => l.examScope.includes('第一次段考'));
    } else if (filter === 'classical') {
      filtered = lessons.filter(l => l.genre.includes('文言') || l.genre.includes('筆記小說') || l.genre.includes('古文') || l.genre.includes('樂府'));
    } else if (filter === 'modern') {
      filtered = lessons.filter(l => l.genre.includes('現代'));
    } else if (filter === 'exam2') {
      filtered = lessons.filter(l => l.examScope.includes('第二次段考') || l.number.includes('五') || l.number.includes('六'));
    }

    lessonsGrid.innerHTML = filtered.map(l => `
      <div class="lesson-card">
        <div>
          <div class="lesson-top">
            <span class="lesson-number">${l.number}</span>
            <span class="lesson-scope">${l.examScope}</span>
          </div>
          <h4 class="lesson-title">${l.title}</h4>
          <div class="lesson-meta">
            <span>✍️ ${l.author}</span>
            <span>🏷️ ${l.genre}</span>
          </div>
          <p class="lesson-summary">${l.summary}</p>
        </div>
        <div class="lesson-footer">
          <span style="font-size: 0.82rem; color: var(--text-muted);">
            ${l.subSections ? '含 3 則經典篇章' : (l.keyConcepts ? `收錄 ${l.keyConcepts.length} 項精華` : '段考重點收錄')}
          </span>
          <button class="btn-read" data-id="${l.id}">
            展開深入精讀 ➔
          </button>
        </div>
      </div>
    `).join('');

    // 綁定打開彈窗事件
    lessonsGrid.querySelectorAll('.btn-read').forEach(btn => {
      btn.addEventListener('click', () => {
        const lessonId = btn.getAttribute('data-id');
        openLessonModal(lessonId);
      });
    });
  }

  // 篩選切換
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLessons(btn.getAttribute('data-filter'));
    });
  });

  renderLessons('all');

  // Modal 關閉
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  function closeModal() {
    modal.classList.remove('active');
  }

  function openLessonModal(id) {
    const lesson = CHINESE_DATA.lessons.find(l => l.id === id);
    if (!lesson) return;

    document.getElementById('modalNumber').textContent = `${lesson.number} · ${lesson.genre}`;
    document.getElementById('modalTitle').textContent = `${lesson.title} —— ${lesson.author}`;

    const modalBody = document.getElementById('modalBody');
    let contentHtml = `
      <div style="background: var(--bg-surface); padding: 1.2rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
        <strong style="color: var(--accent-gold); display: block; margin-bottom: 0.3rem;">【段考出題定位】${lesson.examScope}</strong>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">${lesson.summary}</p>
      </div>
    `;

    // 針對有子章節的課文（如第二課 世說新語）
    if (lesson.subSections) {
      lesson.subSections.forEach(sub => {
        contentHtml += `
          <div style="margin-top: 2rem; border-top: 2px dashed var(--border-color); padding-top: 1.5rem;">
            <h3 style="font-size: 1.35rem; color: var(--accent-gold);">${sub.subTitle}</h3>
            <div style="font-size: 0.9rem; color: var(--accent-jade-light); margin-bottom: 1rem;">
              👤 主角人物：${sub.character} ｜ 🎯 精神旨趣：${sub.theme}
            </div>
            ${sub.passages.map(p => `
              <div class="passage-box">
                <div class="passage-original">${p.original}</div>
                <div class="passage-translation"><strong>【語譯】</strong>${p.translation}</div>
                ${p.notes ? `<div class="passage-notes">🔍 <strong>重點字義：</strong>${p.notes}</div>` : ''}
              </div>
            `).join('')}
            ${sub.deepDive ? `<div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-gold); margin-top: 0.8rem; font-size: 0.92rem; color: var(--text-primary);">${sub.deepDive}</div>` : ''}
          </div>
        `;
      });
    }

    // 針對一般篇章的段落對照
    if (lesson.passages && !lesson.subSections) {
      contentHtml += `<h3>📜 精選文句與思辨對照</h3>`;
      lesson.passages.forEach(p => {
        contentHtml += `
          <div class="passage-box">
            <div class="passage-original">${p.original}</div>
            <div class="passage-translation"><strong>【白話解碼】</strong>${p.translation}</div>
            ${p.analysis ? `<div class="passage-notes">💡 ${p.analysis}</div>` : ''}
          </div>
        `;
      });
    }

    // 關鍵概念與考點
    if (lesson.keyConcepts) {
      contentHtml += `<h3>🔑 核心觀念與段考必考點</h3><div class="concept-pill-group">`;
      lesson.keyConcepts.forEach(c => {
        contentHtml += `
          <div class="concept-pill-item">
            <span class="concept-pill-term">${c.term}</span>
            <span style="font-size: 0.92rem; color: var(--text-secondary);">${c.exp}</span>
          </div>
        `;
      });
      contentHtml += `</div>`;
    }

    if (lesson.examTips) {
      contentHtml += `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1.2rem; margin-top: 1.5rem;">
          <h4 style="color: var(--accent-jade-light); margin-bottom: 0.4rem;">🎯 第一次段考破題提分錦囊</h4>
          <p style="color: var(--text-primary); font-size: 0.95rem;">${lesson.examTips}</p>
        </div>
      `;
    }

    modalBody.innerHTML = contentHtml;
    modal.classList.add('active');
  }
}

/* ==========================================================================
   4. 段考致命盲區·四神兵庫切換與內容生成
   ========================================================================== */
function initPitfalls() {
  const tabBtns = document.querySelectorAll('.pitfall-tab-btn');
  const panels = document.querySelectorAll('.pitfall-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanelId = btn.getAttribute('data-target');
      document.getElementById(targetPanelId).classList.add('active');
    });
  });

  // 渲染字音字形
  const wordsGrid = document.getElementById('wordsGrid');
  wordsGrid.innerHTML = CHINESE_DATA.pitfalls.words.map(w => `
    <div class="word-card">
      <div class="word-char-badge">
        <span>${w.char}</span>
        <span class="word-pinyin-small">${w.pinyin}</span>
      </div>
      <div class="word-detail">
        <h5>釋義：${w.meaning}</h5>
        <p class="word-context"><strong>出處語境：</strong>${w.context}</p>
        <span class="word-mistake">⚠️ 易錯警戒：${w.mistake}</span>
      </div>
    </div>
  `).join('');

  // 渲染文言虛詞表格
  const particlesTbody = document.getElementById('particlesTableBody');
  particlesTbody.innerHTML = CHINESE_DATA.pitfalls.particles.map(p => {
    return p.meanings.map((m, idx) => `
      <tr>
        ${idx === 0 ? `<td rowspan="${p.meanings.length}" class="particle-bold">${p.word}</td>` : ''}
        <td style="color: var(--text-heading); font-weight: 600;">${m.role}</td>
        <td style="color: var(--text-secondary);">${m.example}</td>
      </tr>
    `).join('');
  }).join('');

  // 渲染修辭技巧
  const rhetoricGrid = document.getElementById('rhetoricGrid');
  rhetoricGrid.innerHTML = CHINESE_DATA.pitfalls.rhetoric.map(r => `
    <div class="rhetoric-card">
      <h4>${r.name}</h4>
      <p class="rhetoric-def"><strong>定義：</strong>${r.def}</p>
      <div class="rhetoric-example">
        <strong>課文範例：</strong>${r.example}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   4.5 第二大題：配合題互動闖關 (Matching Game)
   ========================================================================== */
function initMatchingGame() {
  const selector = document.getElementById('matchingSetSelector');
  const title = document.getElementById('matchingSetTitle');
  const instruction = document.getElementById('matchingSetInstruction');
  const leftList = document.getElementById('matchingLeftList');
  const rightList = document.getElementById('matchingRightList');
  const statusText = document.getElementById('matchingStatusText');
  const resetBtn = document.getElementById('resetMatchingBtn');

  if (!selector || !CHINESE_DATA.matchingGames) return;

  const games = CHINESE_DATA.matchingGames;
  let currentSetIndex = 0;
  let selectedLeft = null;
  let matchedCount = 0;

  function renderSetSelector() {
    selector.innerHTML = games.map((g, idx) => `
      <button class="matching-set-btn ${idx === currentSetIndex ? 'active' : ''}" data-idx="${idx}">
        ${idx === 0 ? '① 人物名句配對' : (idx === 1 ? '② 世說門類配對' : '③ 思辨概念情境')}
      </button>
    `).join('');

    selector.querySelectorAll('.matching-set-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSetIndex = parseInt(btn.getAttribute('data-idx'), 10);
        renderSetSelector();
        loadMatchingSet(currentSetIndex);
      });
    });
  }

  function loadMatchingSet(index) {
    const game = games[index];
    title.textContent = game.title;
    instruction.textContent = game.instruction;
    selectedLeft = null;
    matchedCount = 0;
    statusText.textContent = '請先點選左側項目，再點選右側項目進行配對！';
    statusText.style.color = 'var(--accent-jade-light)';

    const pairs = game.pairs;
    // 打亂右側
    const shuffledRight = [...pairs].sort(() => Math.random() - 0.5);

    leftList.innerHTML = pairs.map(p => `
      <button class="matching-item-btn left-item" data-id="${p.id}">
        ${p.left}
      </button>
    `).join('');

    rightList.innerHTML = shuffledRight.map(p => `
      <button class="matching-item-btn right-item" data-id="${p.id}">
        ${p.right}
      </button>
    `).join('');

    // 綁定左欄點擊
    leftList.querySelectorAll('.left-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('matched')) return;
        leftList.querySelectorAll('.left-item').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedLeft = btn;
        statusText.textContent = `已選取「${btn.textContent.trim()}」，請在右側點選對應項目！`;
        statusText.style.color = 'var(--accent-gold)';
      });
    });

    // 綁定右欄點擊
    rightList.querySelectorAll('.right-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('matched')) return;
        if (!selectedLeft) {
          statusText.textContent = '⚠️ 請先在左側選取一個項目喔！';
          statusText.style.color = 'var(--accent-gold)';
          return;
        }

        const leftId = selectedLeft.getAttribute('data-id');
        const rightId = btn.getAttribute('data-id');

        if (leftId === rightId) {
          // 配對成功！
          selectedLeft.classList.remove('selected');
          selectedLeft.classList.add('matched');
          selectedLeft.disabled = true;
          btn.classList.add('matched');
          btn.disabled = true;
          matchedCount++;

          statusText.textContent = '🎉 配對成功！繼續加油！';
          statusText.style.color = 'var(--accent-jade-light)';
          selectedLeft = null;

          if (matchedCount === pairs.length) {
            statusText.textContent = '🏆 太強了！本題組所有項目已完全配對成功！第二大題配合題滿分！';
            statusText.style.color = 'var(--accent-gold)';
          }
        } else {
          // 配對錯誤
          btn.classList.add('wrong-shake');
          statusText.textContent = '❌ 配對錯誤，再想一想喔！';
          statusText.style.color = 'var(--accent-crimson)';
          setTimeout(() => {
            btn.classList.remove('wrong-shake');
          }, 450);
        }
      });
    });
  }

  resetBtn.addEventListener('click', () => {
    loadMatchingSet(currentSetIndex);
  });

  renderSetSelector();
  loadMatchingSet(0);
}

/* ==========================================================================
   5. 《世說新語》高頻成語 3D 翻轉抽認卡
   ========================================================================== */
function initFlashcards() {
  const cardInner = document.getElementById('flashcardInner');
  const cardTitle = document.getElementById('cardTitle');
  const cardPinyin = document.getElementById('cardPinyin');
  const cardSourceFront = document.getElementById('cardSourceFront');
  const cardMeaning = document.getElementById('cardMeaning');
  const cardStory = document.getElementById('cardStory');
  const cardExample = document.getElementById('cardExample');
  const cardPitfall = document.getElementById('cardPitfall');
  const cardCounter = document.getElementById('cardCounter');

  const prevBtn = document.getElementById('prevCardBtn');
  const nextBtn = document.getElementById('nextCardBtn');
  const shuffleBtn = document.getElementById('shuffleCardBtn');

  let cards = [...CHINESE_DATA.flashcards];
  let currentIndex = 0;

  function renderCurrentCard() {
    cardInner.classList.remove('flipped');
    const c = cards[currentIndex];

    cardTitle.textContent = c.idiom;
    cardPinyin.textContent = c.pinyin;
    cardSourceFront.textContent = c.source;
    cardMeaning.textContent = c.meaning;
    cardStory.textContent = c.story;
    cardExample.textContent = c.example;
    cardPitfall.textContent = c.pitfall;
    cardCounter.textContent = `${currentIndex + 1} / ${cards.length}`;
  }

  // 點擊翻牌
  cardInner.addEventListener('click', () => {
    cardInner.classList.toggle('flipped');
  });

  // 上一張
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    renderCurrentCard();
  });

  // 下一張
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % cards.length;
    renderCurrentCard();
  });

  // 隨機抽考洗牌
  shuffleBtn.addEventListener('click', () => {
    cards = [...CHINESE_DATA.flashcards].sort(() => Math.random() - 0.5);
    currentIndex = 0;
    renderCurrentCard();
  });

  renderCurrentCard();
}

/* ==========================================================================
   6. 段考全真測驗模擬系統 (Interactive Exam Engine)
   ========================================================================== */
function initQuiz() {
  const questions = CHINESE_DATA.quiz;
  let currentQIndex = 0;
  let userScore = 0;
  let answeredState = false;

  const activeView = document.getElementById('quizActiveView');
  const resultView = document.getElementById('quizResultView');

  const progressText = document.getElementById('quizProgressText');
  const tagPill = document.getElementById('quizTagPill');
  const progressFill = document.getElementById('quizProgressFill');
  const questionTitle = document.getElementById('quizQuestionTitle');
  const optionsList = document.getElementById('quizOptionsList');
  const feedbackBox = document.getElementById('quizFeedbackBox');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');
  const addToNotebookBtn = document.getElementById('addToNotebookBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const restartQuizBtn = document.getElementById('restartQuizBtn');

  function loadQuestion(index) {
    answeredState = false;
    const q = questions[index];

    progressText.textContent = `第 ${index + 1} 題 / 共 ${questions.length} 題`;
    tagPill.textContent = q.tag;
    progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;
    questionTitle.textContent = `${index + 1}. ${q.question}`;

    feedbackBox.classList.remove('active');
    feedbackBox.style.borderLeftColor = 'var(--accent-jade)';
    addToNotebookBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';

    optionsList.innerHTML = q.options.map((opt, optIdx) => `
      <button class="quiz-option-btn" data-opt="${optIdx}">
        <span>${opt}</span>
      </button>
    `).join('');

    optionsList.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => handleOptionClick(parseInt(btn.getAttribute('data-opt'), 10)));
    });
  }

  function handleOptionClick(selectedOptIdx) {
    if (answeredState) return;
    answeredState = true;

    const q = questions[currentQIndex];
    const isCorrect = selectedOptIdx === q.answer;
    const buttons = optionsList.querySelectorAll('.quiz-option-btn');

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add('correct');
      }
      if (idx === selectedOptIdx && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    feedbackBox.classList.add('active');
    if (isCorrect) {
      userScore += Math.round(100 / questions.length);
      feedbackTitle.innerHTML = '🎉 恭喜答對！正確思維已掌握';
      feedbackTitle.style.color = 'var(--accent-jade-light)';
      feedbackBox.style.borderLeftColor = 'var(--accent-jade)';
    } else {
      feedbackTitle.innerHTML = '⚠️ 答錯了！這裡正是段考扣分盲點';
      feedbackTitle.style.color = 'var(--accent-crimson)';
      feedbackBox.style.borderLeftColor = 'var(--accent-crimson)';
      // 自動或手動加入錯題本
      addToNotebookBtn.style.display = 'inline-flex';
      saveQuestionToNotebook(q, false);
    }
    feedbackText.textContent = q.explanation;

    nextQuestionBtn.style.display = 'inline-flex';
    nextQuestionBtn.textContent = currentQIndex === questions.length - 1 ? '結算成績 ➔' : '下一題 ➔';
  }

  nextQuestionBtn.addEventListener('click', () => {
    if (currentQIndex < questions.length - 1) {
      currentQIndex++;
      loadQuestion(currentQIndex);
    } else {
      showResult();
    }
  });

  addToNotebookBtn.addEventListener('click', () => {
    saveQuestionToNotebook(questions[currentQIndex], true);
    addToNotebookBtn.textContent = '✅ 已收錄至錯題本';
    addToNotebookBtn.disabled = true;
  });

  function showResult() {
    activeView.style.display = 'none';
    resultView.classList.add('active');

    const scoreNum = document.getElementById('resultScoreNum');
    const msg = document.getElementById('resultMessage');
    const advice = document.getElementById('resultAdvice');

    const finalScore = Math.min(100, userScore);
    scoreNum.textContent = finalScore;

    if (finalScore >= 80) {
      msg.textContent = '🌟 太厲害了！你已經具備段考高標實力！';
      advice.textContent = '這次測驗展現出你扎實的字詞理解與文言文語感。只要維持細心，並按照 4 週計畫持續練習，第二次段考絕對能大幅躍進！';
    } else if (finalScore >= 60) {
      msg.textContent = '👍 及格過關！距離高分只差臨門一腳！';
      advice.textContent = '你已經掌握了大部分東大第一冊的核心概念，但在部分易混淆成語與古今異義題上容易粗心。建議多複習錯題本與抽認卡！';
    } else {
      msg.textContent = '💪 別灰心！及時抓出漏洞就是最大的進步！';
      advice.textContent = '這次段考不及格只是代表你還在適應高中的出題模式。現在就按照下方的「第二次段考 4 週逆襲計畫」，一週一週穩健補強，下一次一定能及格翻盤！';
    }
  }

  restartQuizBtn.addEventListener('click', () => {
    currentQIndex = 0;
    userScore = 0;
    resultView.classList.remove('active');
    activeView.style.display = 'block';
    loadQuestion(0);
  });

  loadQuestion(0);
}

/* ==========================================================================
   7. 個人錯題筆記本 (Local Storage 永久記憶)
   ========================================================================== */
function initNotebook() {
  renderNotebookList();
}

function getStoredNotebook() {
  try {
    return JSON.parse(localStorage.getItem('dongda_mistakes')) || [];
  } catch (e) {
    return [];
  }
}

function saveQuestionToNotebook(question, userAlert = false) {
  const currentList = getStoredNotebook();
  const exists = currentList.some(item => item.id === question.id);

  if (!exists) {
    currentList.push({
      id: question.id,
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      tag: question.tag,
      savedAt: new Date().toLocaleDateString('zh-TW')
    });
    localStorage.setItem('dongda_mistakes', JSON.stringify(currentList));
    renderNotebookList();
    if (userAlert) {
      alert('已成功將此題加入「我的個人錯題筆記本」！');
    }
  }
}

function removeQuestionFromNotebook(id) {
  let currentList = getStoredNotebook();
  currentList = currentList.filter(item => item.id !== id);
  localStorage.setItem('dongda_mistakes', JSON.stringify(currentList));
  renderNotebookList();
}

function renderNotebookList() {
  const container = document.getElementById('notebookContainer');
  const list = getStoredNotebook();

  if (list.length === 0) {
    container.innerHTML = `
      <div class="notebook-empty">
        <div class="notebook-empty-icon">📖</div>
        <h4>目前錯題本空空如也！</h4>
        <p style="font-size: 0.92rem; margin-top: 0.5rem;">
          在上方進行「段考全真模擬測驗」時，答錯的題目或點擊收藏的考題會自動匯入這裡，供你反覆精準溫習！
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <span style="font-weight: 700; color: var(--accent-gold);">共收錄 ${list.length} 道高價值盲點題目</span>
      <button id="clearNotebookBtn" style="background: transparent; border: none; color: var(--accent-crimson); cursor: pointer; font-size: 0.85rem;">
        🗑️ 清空錯題本
      </button>
    </div>
    <div class="notebook-list">
      ${list.map(item => `
        <div class="notebook-card">
          <div class="notebook-card-header">
            <span class="brand-badge">${item.tag}</span>
            <button class="notebook-remove-btn" onclick="removeQuestionFromNotebook(${item.id})">
              ✕ 移除
            </button>
          </div>
          <h5 style="font-size: 1.05rem; color: var(--text-heading); margin-bottom: 0.8rem; line-height: 1.6;">
            ${item.question}
          </h5>
          <div style="font-size: 0.92rem; color: var(--accent-jade-light); margin-bottom: 0.6rem;">
            <strong>正確答案：</strong>${item.options[item.answer]}
          </div>
          <div style="background: var(--bg-surface); padding: 0.8rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
            ${item.explanation}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('clearNotebookBtn')?.addEventListener('click', () => {
    if (confirm('確定要清空所有已收藏的錯題嗎？')) {
      localStorage.removeItem('dongda_mistakes');
      renderNotebookList();
    }
  });
}

// 暴露移除方法至全域以支援 onclick
window.removeQuestionFromNotebook = removeQuestionFromNotebook;

/* ==========================================================================
   8. 4週逆襲翻盤讀書計畫 (Checklist & Progress)
   ========================================================================== */
function initStudyPlan() {
  const weeksGrid = document.getElementById('weeksGrid');
  const percentText = document.getElementById('planPercent');
  const planData = CHINESE_DATA.studyPlan;

  let savedTasks = {};
  try {
    savedTasks = JSON.parse(localStorage.getItem('dongda_plan_tasks')) || {};
  } catch (e) {
    savedTasks = {};
  }

  function updateProgress() {
    let totalTasks = 0;
    let completedTasks = 0;

    planData.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks++;
        if (savedTasks[t.id]) completedTasks++;
      });
    });

    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    percentText.textContent = `${percent}%`;
  }

  weeksGrid.innerHTML = planData.map(week => `
    <div class="week-box">
      <div class="week-box-title">
        <span class="week-name">${week.title}</span>
        <span class="week-badge">${week.week}</span>
      </div>
      <ul class="tasks-list">
        ${week.tasks.map(t => {
          const isDone = !!savedTasks[t.id];
          return `
            <li class="task-item ${isDone ? 'completed' : ''}" data-task-id="${t.id}">
              <input type="checkbox" class="task-checkbox" ${isDone ? 'checked' : ''}>
              <span>${t.text}</span>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `).join('');

  weeksGrid.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const checkbox = item.querySelector('.task-checkbox');
      const taskId = item.getAttribute('data-task-id');

      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }

      savedTasks[taskId] = checkbox.checked;
      item.classList.toggle('completed', checkbox.checked);
      localStorage.setItem('dongda_plan_tasks', JSON.stringify(savedTasks));
      updateProgress();
    });
  });

  updateProgress();
}
