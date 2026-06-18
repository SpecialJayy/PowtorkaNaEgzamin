let allQuestions = [];
let activeQuestions = [];
let currentIndex = 0;
let score = 0;

// Ostateczny czyściciel z
function cleanText(text) {
    if (!text) return text;
    // Wywala wszystko co wygląda jak
    return text.replace(/\]*\]/g, '').trim();
}

// ładuje dane z jsona
async function loadQuestions() {
    try {
        // Dodany dummy parametr żeby ominąć cache przy fetchowaniu podczas devu
        const response = await fetch('questionsAndAnswers.json?v=' + new Date().getTime());
        allQuestions = await response.json();
        document.getElementById('start-btn').disabled = false;
        document.getElementById('start-btn').innerText = "Rozpocznij nowe podejście";
    } catch (error) {
        console.error("błąd ładowania pytań majster:", error);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    activeQuestions = shuffle([...allQuestions]);
    currentIndex = 0;
    score = 0;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const q = activeQuestions[currentIndex];
    document.getElementById('counter').innerText = `Pytanie ${currentIndex + 1} / ${activeQuestions.length}`;

    // Czyszczenie treści pytania z cite
    document.getElementById('question-text').innerText = cleanText(q.question);

    const imgEl = document.getElementById('question-image');
    if (q.image) {
        imgEl.src = q.image;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';

    const shuffledAnswers = shuffle([...q.answers]);

    shuffledAnswers.forEach((ans) => {
        const label = document.createElement('label');
        label.className = 'answer-option';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.correct = ans.correct;

        label.appendChild(input);

        // Czyszczenie treści odpowiedzi z cite
        const span = document.createElement('span');
        span.innerText = cleanText(ans.text);
        label.appendChild(span);

        answersDiv.appendChild(label);
    });

    document.getElementById('check-btn').style.display = 'block';
    document.getElementById('next-btn').style.display = 'none';

    // Ręczne odpalenie MathJaxa na kontenerze quizu
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([document.getElementById('quiz-screen')]).catch((err) => {
            console.error("Błąd renderowania LaTeXa:", err);
        });
    }
}

function checkAnswer() {
    const options = document.querySelectorAll('.answer-option');
    let allCorrect = true;

    options.forEach(opt => {
        const input = opt.querySelector('input');
        const isCorrect = input.dataset.correct === 'true';
        const isChecked = input.checked;

        input.disabled = true;

        if (isCorrect) {
            opt.classList.add('correct');
            if (!isChecked) allCorrect = false;
        } else {
            if (isChecked) {
                opt.classList.add('wrong');
                allCorrect = false;
            }
        }
    });

    if (allCorrect) score++;

    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < activeQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('score').innerText = `Zaliczyłeś ${score} z ${activeQuestions.length} pytań bezbłędnie.`;
}

loadQuestions();