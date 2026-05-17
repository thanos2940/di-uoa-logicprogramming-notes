/* interactive_quiz.js - Logic for the quiz app */

(function() {
    const db = window.quizData;
    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedTopics = new Set();
    let isListMode = false;

    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizInterface = document.getElementById('quiz-interface');
    const resultsScreen = document.getElementById('results-screen');
    const topicSelector = document.getElementById('topic-selector');
    const startBtn = document.getElementById('start-btn');
    
    const questionsWrapper = document.getElementById('questions-wrapper');
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    const scoreNum = document.getElementById('score-num');
    const finalScoreText = document.getElementById('final-score-text');
    const restartBtn = document.getElementById('restart-btn');

    // Initialize Topic Buttons
    function initTopicButtons() {
        if (!db) return;
        
        // Use navTopics for better names if available
        const topicNames = {};
        if (window.navTopics) {
            window.navTopics.forEach(t => topicNames[t.id] = t.title);
        }
        
        Object.keys(db).forEach(topicId => {
            const topicName = topicNames[topicId] || (topicId.charAt(0).toUpperCase() + topicId.slice(1).replace(/_/g, ' '));
            const btn = document.createElement('button');
            btn.className = 'topic-btn';
            btn.textContent = topicName;
            btn.dataset.topic = topicId;
            
            btn.onclick = () => {
                if (selectedTopics.has(topicId)) {
                    selectedTopics.delete(topicId);
                    btn.classList.remove('selected');
                } else {
                    selectedTopics.add(topicId);
                    btn.classList.add('selected');
                }
                startBtn.disabled = selectedTopics.size === 0;
            };
            
            topicSelector.appendChild(btn);
        });
    }

    // Shuffle Array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Start Quiz
    function startQuiz() {
        quizQuestions = [];
        selectedTopics.forEach(topicId => {
            const topicData = db[topicId];
            Object.values(topicData).forEach(section => {
                if (section.questions) {
                    section.questions.forEach(q => {
                        quizQuestions.push({
                            ...q, 
                            topicName: section.title,
                            shuffledOptions: shuffle([...q.options]),
                            userAnswer: null,
                            answered: false
                        });
                    });
                }
            });
        });

        shuffle(quizQuestions);
        currentQuestionIndex = 0;
        score = 0;
        isListMode = false;
        
        startScreen.style.display = 'none';
        resultsScreen.style.display = 'none';
        quizInterface.style.display = 'block';
        
        renderAllQuestions();
        updateView();
    }

    // Render All Questions
    function renderAllQuestions() {
        questionsWrapper.innerHTML = '';
        
        quizQuestions.forEach((q, index) => {
            const block = document.createElement('div');
            block.className = 'question-block';
            block.dataset.index = index;
            
            const qText = document.createElement('div');
            qText.className = 'question-text';
            qText.textContent = `${index + 1}. ${q.q}`;
            block.appendChild(qText);
            
            const optsContainer = document.createElement('div');
            optsContainer.className = 'options-container';
            
            q.shuffledOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `
                    <div class="option-content">
                        <div class="option-text">${opt.text}</div>
                        <div class="option-explanation">${opt.explanation || ''}</div>
                    </div>
                `;
                
                btn.onclick = () => handleAnswer(q, opt, btn, block, index);
                optsContainer.appendChild(btn);
            });
            block.appendChild(optsContainer);
            
            const feedbackArea = document.createElement('div');
            feedbackArea.className = 'feedback-area';
            
            const feedbackTitle = document.createElement('div');
            feedbackTitle.className = 'feedback-title';
            const feedbackText = document.createElement('div');
            feedbackText.className = 'feedback-text';
            
            feedbackArea.appendChild(feedbackTitle);
            feedbackArea.appendChild(feedbackText);
            
            // New Navigation Area
            const navArea = document.createElement('div');
            navArea.className = 'quiz-nav';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'prev-btn';
            prevBtn.textContent = 'Προηγούμενη';
            prevBtn.disabled = index === 0;
            prevBtn.onclick = () => {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    updateView();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };

            const nextBtn = document.createElement('button');
            nextBtn.className = 'next-btn';
            nextBtn.textContent = index < quizQuestions.length - 1 ? 'Επόμενη' : 'Ολοκλήρωση';
            nextBtn.onclick = () => {
                if (index < quizQuestions.length - 1) {
                    currentQuestionIndex++;
                    updateView();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    showResults();
                }
            };
            
            navArea.appendChild(prevBtn);
            navArea.appendChild(nextBtn);
            
            block.appendChild(feedbackArea);
            block.appendChild(navArea);
            questionsWrapper.appendChild(block);
        });

        // Add a master finish button for list mode
        const finishBtnContainer = document.createElement('div');
        finishBtnContainer.className = 'list-finish-container';
        finishBtnContainer.style.textAlign = 'right';
        finishBtnContainer.style.marginTop = '40px';
        finishBtnContainer.style.display = 'none';
        
        const masterFinishBtn = document.createElement('button');
        masterFinishBtn.className = 'next-btn';
        masterFinishBtn.style.float = 'none';
        masterFinishBtn.textContent = 'Ολοκλήρωση Quiz';
        masterFinishBtn.onclick = showResults;
        
        finishBtnContainer.appendChild(masterFinishBtn);
        questionsWrapper.appendChild(finishBtnContainer);
    }

    // Handle Answer
    function handleAnswer(q, selectedOpt, selectedBtn, block, index) {
        if (q.answered) return;
        
        q.answered = true;
        q.userAnswer = selectedOpt;
        
        if (selectedOpt.correct) score++;
        
        // Update UI for this block
        const buttons = block.querySelectorAll('.option-btn');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            const explanation = btn.querySelector('.option-explanation');
            if (explanation) explanation.style.display = 'block';
            
            const opt = q.shuffledOptions[i];
            if (opt.correct) {
                btn.classList.add('correct');
            } else if (opt === selectedOpt && !opt.correct) {
                btn.classList.add('wrong');
            }
        });
        
        const feedbackArea = block.querySelector('.feedback-area');
        const feedbackTitle = block.querySelector('.feedback-title');
        const feedbackText = block.querySelector('.feedback-text');
        
        if (selectedOpt.correct) {
            feedbackTitle.textContent = '✅ Σωστό!';
            feedbackTitle.style.color = 'var(--green)';
        } else {
            feedbackTitle.textContent = '❌ Λάθος';
            feedbackTitle.style.color = 'var(--red)';
        }
        feedbackText.textContent = 'Δες τις εξηγήσεις παραπάνω για κάθε επιλογή.';
        feedbackArea.style.display = 'block';

        // Check if all answered to show master finish button in list mode
        if (isListMode) {
            const allAnswered = quizQuestions.every(question => question.answered);
            if (allAnswered) {
                const finishContainer = questionsWrapper.querySelector('.list-finish-container');
                if (finishContainer) finishContainer.style.display = 'block';
            }
        }
    }

    // Update View
    function updateView() {
        const blocks = questionsWrapper.querySelectorAll('.question-block');
        const finishContainer = questionsWrapper.querySelector('.list-finish-container');
        
        if (isListMode) {
            questionsWrapper.classList.add('list-mode');
            progressBarContainer.style.display = 'none';
            progressText.textContent = `Όλες οι ερωτήσεις (${quizQuestions.length})`;
            viewToggleBtn.textContent = 'Εναλλαγή σε Κάρτα';
            
            blocks.forEach(b => {
                const nextBtn = b.querySelector('.next-btn');
                if (nextBtn) nextBtn.style.display = 'none';
            });
            
            const allAnswered = quizQuestions.every(question => question.answered);
            if (finishContainer) finishContainer.style.display = allAnswered ? 'block' : 'none';
            
        } else {
            questionsWrapper.classList.remove('list-mode');
            progressBarContainer.style.display = 'block';
            viewToggleBtn.textContent = 'Εναλλαγή σε Λίστα';
            if (finishContainer) finishContainer.style.display = 'none';
            
            blocks.forEach((b, i) => {
                if (i === currentQuestionIndex) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
            
            const total = quizQuestions.length;
            progressFill.style.width = `${((currentQuestionIndex + 1) / total) * 100}%`;
            progressText.innerHTML = `Ερώτηση <span id="current-num">${currentQuestionIndex + 1}</span> από <span id="total-num">${total}</span>`;
        }
    }

    viewToggleBtn.onclick = () => {
        isListMode = !isListMode;
        updateView();
    };

    // Show Results
    function showResults() {
        quizInterface.style.display = 'none';
        resultsScreen.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        scoreNum.textContent = score;
        const total = quizQuestions.length;
        const percent = Math.round((score / total) * 100);
        
        let msg = '';
        if (percent === 100) msg = 'Εξαιρετικά! Είσαι ειδικός στο System Programming! 🔥';
        else if (percent >= 80) msg = 'Πολύ καλά! Έχεις πολύ γερές βάσεις. 💪';
        else if (percent >= 50) msg = 'Καλή προσπάθεια, αλλά χρειάζεται λίγη ακόμα μελέτη. 📚';
        else msg = 'Μάλλον πρέπει να ξαναδείς τις σημειώσεις. Μην απογοητεύεσαι! 🛠️';
        
        finalScoreText.textContent = `${msg} (Σκορ: ${percent}%)`;
    }

    // Restart
    restartBtn.onclick = () => {
        startScreen.style.display = 'block';
        resultsScreen.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTopicButtons);
    } else {
        initTopicButtons();
    }
    
    startBtn.onclick = startQuiz;
})();
