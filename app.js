// ...existing code...
const codeSnippets = {
  easy: [
    'for i in range(10):',
    'let x = 10;',
    'console.log(x);',
    'def greet():',
    'int a = 5;',
  ],
  medium: [
    'if (x === y) { return true; }',
    'while count < 10:\n    count += 1',
    'System.out.println("Hello, World!");',
    'const sum = arr.reduce((a, b) => a + b);',
    'public static void main(String[] args) { }',
  ],
  hard: [
    'try {\n  doSomething();\n} catch (e) {\n  console.error(e);\n}',
    'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
    'for (Map.Entry<String, Integer> entry : map.entrySet()) {\n    System.out.println(entry.getKey());\n}',
    'class Foo {\n  constructor(x) {\n    this.x = x;\n  }\n}',
    'let promise = new Promise((resolve, reject) => {\n  // ...\n});',
  ]
};

let currentDifficulty = 'easy';
let snippetIndex = 0;
let snippetStartTime;
let finished = false;
let correctChars = 0;
let timeLimit = 30;
let timerInterval;

const snippetElem = document.getElementById('snippet');
const inputElem = document.getElementById('input');
const wpmElem = document.getElementById('wpm');
const accuracyElem = document.getElementById('accuracy');
const nextBtn = document.getElementById('next');
const scoreboard = document.getElementById('scoreboard');

let username = '';
document.getElementById('save-username').onclick = function() {
  username = document.getElementById('username').value.trim() || 'Anonymous';
  document.getElementById('username-form').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  showSnippet();
};
document.getElementById('game').style.display = 'none';

// Load high scores or initialize
let scores = JSON.parse(localStorage.getItem('codeTypingScores')) || [];

function showScores() {
  scoreboard.innerHTML = '';
  scores.slice(0, 5).forEach(score => {
    let li = document.createElement('li');
    li.textContent = `WPM: ${score.wpm} | Accuracy: ${score.accuracy}% | ${score.username} (${score.difficulty})`;
    scoreboard.appendChild(li);
  });
}

function getWords(str) {
  return str.trim().split(/\s+/).length;
}

function languageForSnippet(snippet) {
  if (snippet.includes('def') || snippet.includes('range')) return 'python';
  if (snippet.includes('System.') || snippet.includes('public static')) return 'java';
  return 'javascript';
}

function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = timeLimit;
  const timeElem = document.getElementById('time-left');
  if (timeElem) timeElem.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeElem) timeElem.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      inputElem.disabled = true;
      nextBtn.style.display = 'inline';
      // Optionally you may compute final stats here
    }
  }, 1000);
}

function showSnippet() {
  const snippets = codeSnippets[currentDifficulty] || [];
  if (snippets.length === 0) {
    snippetElem.textContent = '';
    return;
  }
  snippetIndex = snippetIndex % snippets.length;
  const code = snippets[snippetIndex];

  // reset UI
  inputElem.value = '';
  inputElem.disabled = false;
  nextBtn.style.display = 'none';
  finished = false;
  correctChars = 0;
  snippetStartTime = Date.now();
  wpmElem.textContent = 'WPM: 0';
  accuracyElem.textContent = 'Accuracy: 100%';
  inputElem.focus();

  // start/clear timer
  startTimer();

  // syntax highlight if Prism available
  const lang = languageForSnippet(code);
  snippetElem.className = `language-${lang}`;
  if (window.Prism && Prism.languages && Prism.languages[lang]) {
    snippetElem.innerHTML = Prism.highlight(code, Prism.languages[lang], lang);
  } else {
    snippetElem.textContent = code;
  }
}

function updateStats() {
  const input = inputElem.value;
  const snippet = (codeSnippets[currentDifficulty] || [])[snippetIndex] || '';

  // Accuracy
  let correct = 0;
  for (let i = 0; i < Math.min(input.length, snippet.length); i++) {
    if (input[i] === snippet[i]) correct++;
  }
  correctChars = correct;
  const total = Math.max(snippet.length, 1);
  const accuracy = Math.round((correct / total) * 100);
  accuracyElem.textContent = `Accuracy: ${accuracy}%`;

  // WPM (1 word = 5 chars)
  const now = Date.now();
  const seconds = Math.max((now - snippetStartTime) / 1000, 1);
  const wpm = Math.round((input.length / 5) / (seconds / 60));
  wpmElem.textContent = `WPM: ${isNaN(wpm) ? 0 : wpm}`;

  // Finished?
  if (input === snippet && !finished) {
    finishSnippet(wpm, accuracy);
  }
}

function finishSnippet(wpm, accuracy) {
  clearInterval(timerInterval);
  inputElem.disabled = true;
  finished = true;
  nextBtn.style.display = 'inline';
  // Save score with username and difficulty
  scores.unshift({ username: username || 'Anonymous', wpm, accuracy, difficulty: currentDifficulty });
  // keep only last N scores if desired, e.g. 20
  scores = scores.slice(0, 50);
  localStorage.setItem('codeTypingScores', JSON.stringify(scores));
  showScores();
}

inputElem.addEventListener('input', updateStats);

nextBtn.addEventListener('click', () => {
  const snippets = codeSnippets[currentDifficulty] || [];
  snippetIndex = (snippetIndex + 1) % Math.max(snippets.length, 1);
  showSnippet();
});

window.onload = function() {
  showScores();
  // ensure difficulty select reflects currentDifficulty
  const difficultySelect = document.getElementById('difficulty');
  if (difficultySelect) difficultySelect.value = currentDifficulty;
  showSnippet();
};

const difficultySelect = document.getElementById('difficulty');
if (difficultySelect) {
  difficultySelect.addEventListener('change', function() {
    currentDifficulty = this.value;
    snippetIndex = 0;
    showSnippet();
  });
}