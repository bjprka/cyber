/* =========================================================
   DATA — 5 questions, each option carries a point value
   (higher points = more secure habit)
========================================================= */
const QUESTIONS = [
  {
    category: "// LOGIN SECURITY",
    text: "How do you usually create passwords for new accounts?",
    options: [
      { label: "Same password I use everywhere, slightly tweaked", points: 0 },
      { label: "A password I think is 'strong', made up on the spot", points: 5 },
      { label: "A unique, randomly generated password every time", points: 10 }
    ]
  },
  {
    category: "// ACCOUNT ACCESS",
    text: "Do your important accounts (email, banking) have two-factor authentication (2FA) turned on?",
    options: [
      { label: "What's 2FA?", points: 0 },
      { label: "On some accounts, not all", points: 5 },
      { label: "Yes, on everything that supports it", points: 10 }
    ]
  },
  {
    category: "// SOFTWARE HYGIENE",
    text: "When your phone or laptop shows an update is available, what do you do?",
    options: [
      { label: "Ignore it for weeks or months", points: 0 },
      { label: "Update eventually, when I remember", points: 5 },
      { label: "Update as soon as it's available", points: 10 }
    ]
  },
  {
    category: "// PHISHING AWARENESS",
    text: "You get an unexpected email saying 'urgent: verify your account now or it will be suspended.' What's your move?",
    options: [
      { label: "Click the link right away to fix it", points: 0 },
      { label: "Hesitate, but probably click if it looks official", points: 5 },
      { label: "Go directly to the site myself, never click the link", points: 10 }
    ]
  },
  {
    category: "// BACKUP & RECOVERY",
    text: "If your phone or laptop died right now, how much of your data would you actually lose?",
    options: [
      { label: "Everything — I don't really back up", points: 0 },
      { label: "Some — I back up occasionally", points: 5 },
      { label: "Almost nothing — I back up automatically and regularly", points: 10 }
    ]
  }
];

const MAX_SCORE = QUESTIONS.length * 10;

/* =========================================================
   GRADE BANDS
========================================================= */
function getGrade(score) {
  const pct = (score / MAX_SCORE) * 100;

  if (pct >= 90) return {
    letter: "A+",
    tone: "good",
    summary: "Excellent work. Your habits put you well ahead of most people online — keep it up and stay alert, since security is never 'finished'."
  };
  if (pct >= 75) return {
    letter: "B",
    tone: "good",
    summary: "Solid foundation. You're doing more right than wrong — a couple of small upgrades would take you from good to genuinely hard to compromise."
  };
  if (pct >= 55) return {
    letter: "C",
    tone: "warn",
    summary: "You're average — which, in security terms, means you're an easy-ish target. A few focused changes would meaningfully cut your risk."
  };
  if (pct >= 35) return {
    letter: "D",
    tone: "warn",
    summary: "Your current habits leave real gaps an attacker could use. None of this is hard to fix — it just needs some attention this week."
  };
  return {
    letter: "F",
    tone: "danger",
    summary: "Your accounts are more exposed than you probably realize. The good news: every fix below takes minutes, not hours."
  };
}

/* =========================================================
   FIX SUGGESTIONS — keyed by question index + chosen option index
========================================================= */
const FIX_TIPS = {
  0: [
    "Use a password manager (Bitwarden, 1Password) to generate and store unique passwords for every account.",
    "Never reuse a password across more than one important account.",
    "Aim for length over complexity — a long passphrase beats a short, complicated one."
  ],
  1: [
    "Turn on 2FA for email first — it's the recovery key to almost everything else you own.",
    "Prefer an authenticator app or hardware key over SMS codes when it's offered.",
    "Check your bank, email, and social accounts today — most have 2FA hidden in settings."
  ],
  2: [
    "Turn on automatic updates wherever your device allows it.",
    "Set a recurring monthly reminder to manually check for updates on devices that don't auto-update.",
    "Outdated software is one of the most common ways attackers get in — this one's mostly free to fix."
  ],
  3: [
    "Never click a link in an unexpected 'urgent' email — type the site's address yourself instead.",
    "Hover over links (or long-press on mobile) to preview the real destination before tapping.",
    "When in doubt, contact the company directly through their official app or phone number."
  ],
  4: [
    "Set up automatic cloud backup (iCloud, Google, OneDrive) for your phone and laptop.",
    "Keep one backup copy offline or in a second location, in case of ransomware or account lockout.",
    "Test a backup restore once a year so you know it actually works when you need it."
  ]
};

/* =========================================================
   STATE
========================================================= */
let currentQuestionIndex = 0;
let totalScore = 0;
const userAnswers = []; // { questionIndex, optionIndex, points }

/* =========================================================
   DOM REFS
========================================================= */
const introScreen   = document.getElementById("intro-screen");
const quizScreen    = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");

const startBtn   = document.getElementById("start-btn");
const retryBtn   = document.getElementById("retry-btn");

const progressTag    = document.getElementById("progress-tag");
const progressFill   = document.getElementById("progress-fill");
const questionCategory = document.getElementById("question-category");
const questionText   = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");

const gradeLetterEl = document.getElementById("grade-letter");
const gradeScoreEl  = document.getElementById("grade-score");
const gradeSummaryEl = document.getElementById("grade-summary");
const fixListEl     = document.getElementById("fix-list");

/* =========================================================
   NAVIGATION
========================================================= */
function showScreen(screen) {
  [introScreen, quizScreen, resultsScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

startBtn.addEventListener("click", () => {
  currentQuestionIndex = 0;
  totalScore = 0;
  userAnswers.length = 0;
  showScreen(quizScreen);
  renderQuestion();
});

retryBtn.addEventListener("click", () => {
  currentQuestionIndex = 0;
  totalScore = 0;
  userAnswers.length = 0;
  showScreen(introScreen);
});

/* =========================================================
   RENDER A QUESTION
========================================================= */
function renderQuestion() {
  const q = QUESTIONS[currentQuestionIndex];
  const qNum = currentQuestionIndex + 1;

  progressTag.textContent = `[${qNum}/${QUESTIONS.length}]`;
  progressFill.style.width = `${(qNum / QUESTIONS.length) * 100}%`;
  questionCategory.textContent = q.category;
  questionText.textContent = q.text;

  optionsContainer.innerHTML = "";
  const keys = ["A", "B", "C", "D"];

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="opt-key">${keys[i]}</span><span>${opt.label}</span>`;
    btn.addEventListener("click", () => selectOption(i, opt.points));
    optionsContainer.appendChild(btn);
  });
}

function selectOption(optionIndex, points) {
  userAnswers.push({
    questionIndex: currentQuestionIndex,
    optionIndex,
    points
  });
  totalScore += points;

  if (currentQuestionIndex < QUESTIONS.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    renderResults();
  }
}

/* =========================================================
   RENDER RESULTS
========================================================= */
function renderResults() {
  const grade = getGrade(totalScore);

  gradeLetterEl.textContent = grade.letter;
  gradeLetterEl.className = "grade-letter" +
    (grade.tone === "warn" ? " grade-warn" : grade.tone === "danger" ? " grade-danger" : "");

  gradeScoreEl.textContent = `${totalScore} / ${MAX_SCORE} pts`;
  gradeSummaryEl.textContent = grade.summary;

  // Build fix list: take the weakest answers first (lowest points),
  // pull a relevant tip for each, cap at 3 tips so it stays actionable.
  const sortedAnswers = [...userAnswers].sort((a, b) => a.points - b.points);
  const topWeak = sortedAnswers.slice(0, 3);

  fixListEl.innerHTML = "";

  if (totalScore === MAX_SCORE) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="fix-icon">✓</span><span>No weak spots found in this audit. Stay consistent — re-run this check every few months as your habits and accounts change.</span>`;
    fixListEl.appendChild(li);
  } else {
    topWeak.forEach(answer => {
      if (answer.points >= 10) return; // skip already-strong answers
      const tipsForQuestion = FIX_TIPS[answer.questionIndex];
      const tip = tipsForQuestion[0]; // primary tip for that weak area
      const li = document.createElement("li");
      li.innerHTML = `<span class="fix-icon">▸</span><span>${tip}</span>`;
      fixListEl.appendChild(li);
    });
  }

  showScreen(resultsScreen);
}
