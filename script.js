const state = {
  simpleQuests: [
    "예방접종",
    "밥 주기",
    "물 주기",
    "산책하기"
  ],
  completed: [],
  trainingDone: false,
  quizDone: false,
  currentMode: "select-dog",
  trainingSequence: [],
  trainingIndex: 0,
  quizIndex: 0,
  endingStarted: false,
  guideDogName: "",
  selectedDog: null,
  toastTimer: null
};

const totalQuestCount = state.simpleQuests.length + 2;

const puppyStatus = document.getElementById("puppyStatus");
const puppySubEmotion = document.getElementById("puppySubEmotion");
const puppyImage = document.getElementById("puppyImage");
const actionArea = document.getElementById("actionArea");
const growthText = document.getElementById("growthText");
const progressFill = document.getElementById("progressFill");
const toast = document.getElementById("toastMessage");

const stageInfo = [
  {
    name: "어린 강아지",
    icon: "🐶",
    description: "반응이 서툴고 장난기가 많다",
    face: "૮ ˶ᵔ ᵕ ᵔ˶ ა",
    emotions: [
      ["신남", "꼬리를 붕붕 흔들며 네 주변을 맴돈다!"],
      ["행복", "두 앞발을 모으고 해맑게 바라본다!"],
      ["호기심", "코를 킁킁거리며 새로운 냄새를 찾는다!"],
      ["졸림", "하품을 하다가도 금방 다시 눈을 반짝인다!"]
    ],
    subEmotions: [
      "(강아지가 꼬리를 살랑살랑 흔든다 🐶)",
      "(강아지가 폭신한 귀를 폴짝 움직인다 ✨)",
      "(강아지가 신나서 앞발을 톡톡 구른다 💛)",
      "(강아지가 너를 보고 배시시 웃는 것 같다 😊)"
    ]
  },
  {
    name: "훈련 중",
    icon: "🐕",
    description: "점점 집중력이 생기고 말을 잘 듣기 시작한다",
    face: "૮ • ﻌ • ა",
    emotions: [
      ["집중", "조용히 앉아서 네 신호를 기다린다."],
      ["의욕", "가슴을 쭉 펴고 다음 훈련을 기대한다."],
      ["차분", "주변을 살피며 침착하게 숨을 고른다."],
      ["긴장", "작게 숨을 들이쉬며 실수하지 않으려 한다."]
    ],
    subEmotions: [
      "(강아지가 자세를 바르게 고쳐 앉는다 🎓)",
      "(강아지가 네 손짓에 귀를 쫑긋 세운다 👂)",
      "(강아지가 조용히 눈을 맞추며 집중한다 ✨)",
      "(강아지가 한층 의젓한 표정이 되었다 🐕)"
    ]
  },
  {
    name: "예비 안내견",
    icon: "🦮",
    description: "차분하고 똑똑한 모습, 안정적인 행동",
    face: "૮ ˶• ᴗ •˶ ა",
    emotions: [
      ["차분", "주변을 살피며 안정적으로 서 있다."],
      ["집중", "흔들림 없는 눈빛으로 길을 살핀다."],
      ["자신감", "한 걸음 한 걸음 또렷하게 앞으로 나아간다."],
      ["평온", "네 곁에서 믿음직하게 호흡을 맞춘다."]
    ],
    subEmotions: [
      "(강아지가 듬직하게 네 옆을 지킨다 🦮)",
      "(강아지가 조용히 숨을 고르며 준비한다 🌟)",
      "(강아지가 부드러운 눈빛으로 널 바라본다 💛)",
      "(강아지가 한층 어른스러운 분위기를 풍긴다 ✨)"
    ]
  }
];

const growthLines = [
  "작은 발걸음이지만, 분명히 성장하고 있다.",
  "강아지가 점점 네 말을 이해하기 시작했다!",
  "장난기 속에서도 집중하는 시간이 늘어나고 있다.",
  "이제 훨씬 침착해졌다!",
  "훈련의 의미를 알아가며 눈빛이 달라지고 있다.",
  "믿음직한 예비 안내견의 기운이 느껴진다.",
  "처음의 작은 강아지가, 누군가의 빛이 될 준비를 마쳤다."
];

const dogChoices = [
  { file: "dog1.jpg", label: "도도한 리트리버" },
  { file: "dog2.jpg", label: "해맑은 리트리버" },
  { file: "dog3.jpg", label: "여린 리트리버" }
];

const trainingActions = ["앉아", "일어서", "엎드려"];
const quizQuestions = [
  {
    question: "구글에서 만든 시각장애인을 위한 거리뷰 프로그램 이름은?",
    choices: [
      "Street Reader AI",
      "Street Rider AI",
      "Street Leader AI",
      "Street Writer AI"
    ],
    answer: 1
  },
  {
    question: "안내견 분양 후 정기 관리는 몇 개월마다 진행될까요?",
    choices: [
      "3개월",
      "6개월",
      "9개월",
      "12개월"
    ],
    answer: 2
  }
];

function showToast(text, type = "") {
  if (!toast) return;

  toast.className = `toast show ${type}`.trim();
  toast.innerHTML = text;

  if (state.toastTimer) {
    clearTimeout(state.toastTimer);
  }

  state.toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 2600);
}

function getCompletedCount() {
  return state.completed.length + (state.trainingDone ? 1 : 0) + (state.quizDone ? 1 : 0);
}

function getStageIndex() {
  const count = getCompletedCount();
  if (count >= 5) return 2;
  if (count >= 3) return 1;
  return 0;
}

function pickByTurn(arr, offset = 0) {
  const idx = (getCompletedCount() + offset) % arr.length;
  return arr[idx];
}

function updatePuppyUI() {
  const stage = stageInfo[getStageIndex()];
  const [emotion, action] = pickByTurn(stage.emotions);
  const subEmotion = pickByTurn(stage.subEmotions, 1);

  puppyStatus.textContent = `${stage.icon} [${stage.name} | ${emotion}] ${action}`;
  puppySubEmotion.textContent = subEmotion;

  if (puppyImage) {
    if (state.selectedDog) {
      puppyImage.src = state.selectedDog;
      puppyImage.alt = `선택한 강아지 이미지 ${state.selectedDog}`;
      puppyImage.style.display = "block";
    } else {
      puppyImage.style.display = "none";
    }
  }

  growthText.textContent = `${getCompletedCount()} / ${totalQuestCount}`;
  progressFill.style.width = `${(getCompletedCount() / totalQuestCount) * 100}%`;
}

function checkEnding() {
  if (getCompletedCount() === totalQuestCount && !state.endingStarted) {
    state.endingStarted = true;
    renderEnding();
    showToast(
      `<strong>퍼피워킹 종료!</strong><br>작은 리트리버가 이제 안내견 학교에 입성할 준비를 마쳤다.`,
      "success"
    );
    return true;
  }
  return false;
}

function completeQuest(name) {
  if (state.completed.includes(name)) return;

  const beforeStage = getStageIndex();
  state.completed.push(name);
  const afterStage = getStageIndex();

  let msg = `<strong>${name}</strong> 퀘스트 완료!<br>${growthLines[Math.min(getCompletedCount() - 1, growthLines.length - 1)]}`;

  if (afterStage > beforeStage) {
    const newStage = stageInfo[afterStage];
    msg += `<br><span class="success">성장 단계 상승! → ${newStage.icon} ${newStage.name}</span>`;
  }

  showToast(msg, "success");
  updateAll();
}

function renderDogSelection() {
  state.currentMode = "select-dog";
  actionArea.innerHTML = `
    <div class="mini-box main-box">
      <div class="badge">시작 준비</div>
      <h2>함께할 리트리버를 선택해 주세요</h2>
      <div class="dog-select-grid" id="dogSelectGrid"></div>
    </div>
  `;

  const dogSelectGrid = document.getElementById("dogSelectGrid");

  dogChoices.forEach((dog, index) => {
    const card = document.createElement("button");
    card.className = "dog-card";
    card.innerHTML = `
      <img src="${dog.file}" alt="${dog.label}" loading="lazy" />
      <strong>${index + 1}. ${dog.label}</strong>
    `;
    card.addEventListener("click", () => {
      state.selectedDog = dog.file;
      showToast(`<strong>${dog.label}</strong> 선택 완료!<br>이제 퍼피워킹을 시작해 보자.`, "success");
      updateAll();
    });
    dogSelectGrid.appendChild(card);
  });
}

function renderMenu() {
  state.currentMode = "menu";
  actionArea.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "action-grid";

  state.simpleQuests.forEach((quest, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}. ${quest}`;
    btn.disabled = state.completed.includes(quest);
    btn.addEventListener("click", () => completeQuest(quest));
    wrapper.appendChild(btn);
  });

  const trainingNumber = state.simpleQuests.length + 1;
  const quizNumber = state.simpleQuests.length + 2;

  const trainingBtn = document.createElement("button");
  trainingBtn.textContent = `${trainingNumber}. 행동 훈련 게임`;
  trainingBtn.disabled = state.trainingDone;
  trainingBtn.addEventListener("click", startTrainingGame);
  wrapper.appendChild(trainingBtn);

  const quizBtn = document.createElement("button");
  quizBtn.textContent = `${quizNumber}. 퀴즈 게임`;
  quizBtn.disabled = state.quizDone;
  quizBtn.addEventListener("click", startQuizGame);
  wrapper.appendChild(quizBtn);

  actionArea.appendChild(wrapper);
}

function startTrainingGame() {
  state.currentMode = "training";
  state.trainingSequence = Array.from({ length: 10 }, (_, i) => trainingActions[(i * 7 + Math.floor(Math.random() * 3)) % 3]);

  for (let i = state.trainingSequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.trainingSequence[i], state.trainingSequence[j]] = [state.trainingSequence[j], state.trainingSequence[i]];
  }

  state.trainingIndex = 0;
  renderTrainingStep(true);
}

function renderTrainingStep(showFull = false) {
  actionArea.innerHTML = `
    <div class="mini-box main-box">
      <div class="badge">행동 훈련 게임</div>
      <p>제시된 10개의 행동 순서를 기억한 뒤, 하나씩 정확하게 입력하세요.</p>
      ${showFull ? `<div class="mini-sequence">${state.trainingSequence.join(" → ")}</div>` : ""}
      <p><strong>현재 입력 단계:</strong> ${state.trainingIndex + 1} / 10</p>
      <p>아래에서 다음 행동을 선택하세요.</p>
      <div class="choice-grid" id="trainingChoices"></div>
      <div style="margin-top:12px;">
        <button id="backToMenuBtn">메뉴로 돌아가기</button>
      </div>
    </div>
  `;

  const trainingChoices = document.getElementById("trainingChoices");
  trainingActions.forEach(action => {
    const btn = document.createElement("button");
    btn.textContent = action;
    btn.addEventListener("click", () => submitTrainingAction(action));
    trainingChoices.appendChild(btn);
  });

  document.getElementById("backToMenuBtn").addEventListener("click", renderMenu);
}

function submitTrainingAction(action) {
  const expected = state.trainingSequence[state.trainingIndex];
  if (action !== expected) {
    showToast(
      `<strong>행동 훈련 실패</strong><br>${state.trainingIndex + 1}번째 입력에서 실수했다. 다시 도전해 보자!`,
      "fail"
    );
    renderMenu();
    return;
  }

  state.trainingIndex += 1;

  if (state.trainingIndex >= state.trainingSequence.length) {
    const beforeStage = getStageIndex();
    state.trainingDone = true;
    const afterStage = getStageIndex();

    let msg = `<strong>행동 훈련 성공!</strong><br>강아지가 신호를 또렷하게 이해하고 정확히 따라 했다.`;
    if (afterStage > beforeStage) {
      msg += `<br><span class="success">성장 단계 상승! → ${stageInfo[afterStage].icon} ${stageInfo[afterStage].name}</span>`;
    }
    msg += `<br>${growthLines[Math.min(getCompletedCount() - 1, growthLines.length - 1)]}`;

    showToast(msg, "success");
    updateAll();
    return;
  }

  renderTrainingStep(false);
}

function startQuizGame() {
  state.currentMode = "quiz";
  state.quizIndex = 0;
  renderQuizStep();
}

function renderQuizStep() {
  const currentQuiz = quizQuestions[state.quizIndex];

  actionArea.innerHTML = `
    <div class="mini-box main-box">
      <div class="badge">퀴즈 게임</div>
      <p><strong>문제 ${state.quizIndex + 1} / ${quizQuestions.length}</strong></p>
      <p><strong>${currentQuiz.question}</strong></p>
      <div class="choice-grid" id="quizChoices"></div>
      <div style="margin-top:12px;">
        <button id="quizBackBtn">메뉴로 돌아가기</button>
      </div>
    </div>
  `;

  const quizChoices = document.getElementById("quizChoices");
  currentQuiz.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.textContent = `${index + 1}. ${choice}`;
    btn.addEventListener("click", () => submitQuiz(index + 1));
    quizChoices.appendChild(btn);
  });

  document.getElementById("quizBackBtn").addEventListener("click", renderMenu);
}

function submitQuiz(choiceNumber) {
  const currentQuiz = quizQuestions[state.quizIndex];

  if (choiceNumber !== currentQuiz.answer) {
    showToast(`<strong>퀴즈 실패</strong><br>정답을 다시 생각해 보고 재도전하자.`, "fail");
    renderMenu();
    return;
  }

  state.quizIndex += 1;

  if (state.quizIndex < quizQuestions.length) {
    showToast(`<strong>정답!</strong><br>다음 문제로 이어서 도전해 보자.`, "success");
    renderQuizStep();
    return;
  }

  const beforeStage = getStageIndex();
  state.quizDone = true;
  const afterStage = getStageIndex();

  let msg = `<strong>퀴즈 성공!</strong><br>올바른 돌봄의 태도를 이해하고 있다.`;
  if (afterStage > beforeStage) {
    msg += `<br><span class="success">성장 단계 상승! → ${stageInfo[afterStage].icon} ${stageInfo[afterStage].name}</span>`;
  }
  msg += `<br>${growthLines[Math.min(getCompletedCount() - 1, growthLines.length - 1)]}`;

  showToast(msg, "success");
  updateAll();
}

function renderEnding() {
  actionArea.innerHTML = `
    <div class="ending-box main-box">
      <div class="badge">안내견 학교 입성</div>
      <p><strong>처음 모습</strong> — 장난기 많고 세상이 궁금한 작은 리트리버 🐶</p>
      <p><strong>지금 모습</strong> — 차분함과 따뜻함을 지닌 예비 안내견 🦮</p>
      <p>함께해 주신 덕분에 이 아이가 이제 누군가를 도울 준비를 마쳤답니다!</p>
      <p><strong>이제 안내견의 이름을 지어 주세요.</strong></p>
      <input id="guideDogNameInput" class="name-input" type="text" maxlength="16" placeholder="예: 별이, 하루, 마루" />
      <br>
      <button id="nameSubmitBtn">이름 정하기</button>
    </div>
  `;

  document.getElementById("nameSubmitBtn").addEventListener("click", submitGuideDogName);
}

function submitGuideDogName() {
  const input = document.getElementById("guideDogNameInput");
  const value = input.value.trim();

  if (!value) {
    showToast(`<strong>이름이 필요해요.</strong><br>따뜻한 이름을 지어 주세요.`, "fail");
    return;
  }

  state.guideDogName = value;
  puppyStatus.textContent = `🦮 [예비 안내견 | 평온] ${value}가 조용히 네 곁에 기대며 새로운 시작을 기다린다.`;
  puppySubEmotion.textContent = `(이제 '${value}'라는 이름으로 세상을 향해 나아갈 준비를 한다 ✨)`;

  actionArea.innerHTML = `
    <div class="ending-box main-box">
      <div class="badge">이름 정하기 완료</div>
      <h3>${value}</h3>
      <p>작은 꼬리 흔들림으로 시작된 ${value}이(가) 이제 누군가의 길을 밝혀 줄 준비를 마쳤어요!</p>
      <p class="success"><strong>이제 강아지 꾸미기 단계로 넘어볼까요?</strong></p>
      <button id="restartBtn">처음부터 다시 플레이</button>
    </div>
  `;

  showToast(
    `<strong>${value}</strong>라는 이름이 정해졌다!<br><span class="success">파트너 매칭 단계 시작</span>`,
    "success"
  );

  document.getElementById("restartBtn").addEventListener("click", resetGame);
}

function resetGame() {
  state.completed = [];
  state.trainingDone = false;
  state.quizDone = false;
  state.currentMode = "select-dog";
  state.trainingSequence = [];
  state.trainingIndex = 0;
  state.quizIndex = 0;
  state.endingStarted = false;
  state.guideDogName = "";
  state.selectedDog = null;

  updateAll();
}

function updateAll() {
  updatePuppyUI();

  if (!state.selectedDog) {
    renderDogSelection();
    return;
  }

  if (!checkEnding()) {
    renderMenu();
  }
}

function init() {
  showToast(
    `<strong>퍼피워킹이 시작됩니다.</strong><br>함께할 리트리버를 먼저 선택해 주세요.`,
    "success"
  );
  updateAll();
}

init();
