console.log("앱 로드 완료");

const preview = document.getElementById("preview");
const previewText = document.getElementById("previewText");

// ===== 1번째 화면: 배경 선택 =====

const bgThumbs = document.querySelectorAll(".bgThumb");
const nextFromBg = document.getElementById("nextFromBg");
let selectedBg = null;

bgThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    // 다른 배경 썸네일에 있던 선택 표시 제거
    bgThumbs.forEach((t) => t.classList.remove("selected"));
    thumb.classList.add("selected");

    selectedBg = thumb.getAttribute("data-bg");
    preview.style.backgroundImage = `url('${selectedBg}')`;
    previewText.style.display = "none";

    // 배경을 골랐으니 곰식이 버튼을 눌리게 하고, 버튼 이미지 자체를 방금 고른 배경으로 바꿔서
    // "내가 고른 게 반영됐다"는 걸 눈으로 바로 알 수 있게 함
    nextFromBg.classList.add("active");
    nextFromBg.src = selectedBg;
  });
});

nextFromBg.addEventListener("click", () => {
  document.getElementById("screenBg").style.display = "none";
  document.getElementById("screenItem1").style.display = "block";
});

// ===== 2~4번째 화면: 아이템 1, 2, 3 선택 (구조는 동일, 슬롯 번호만 다름) =====

// 슬롯(1,2,3)마다 선택된 아이템의 이미지 경로를 저장
const selectedItems = { 1: null, 2: null, 3: null };

// 아이템 선택 화면 하나를 설정하는 함수 (1,2,3번 화면에 각각 적용)
function setupItemScreen(slotNumber) {
  const container = document.querySelector(`.itemThumbList[data-slot="${slotNumber}"]`);
  const thumbs = container.querySelectorAll(".itemThumb");
  const nextBtn = document.getElementById(`nextFromItem${slotNumber}`);

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      // 이 화면 안에서만 선택 표시를 갱신 (다른 화면의 선택엔 영향 없음)
      thumbs.forEach((t) => t.classList.remove("selected"));
      thumb.classList.add("selected");

      const itemPath = thumb.getAttribute("data-item");
      selectedItems[slotNumber] = itemPath;
      nextBtn.classList.add("active");
      // 버튼 이미지 자체를 방금 고른 아이템으로 바꿔서 선택이 반영됐음을 바로 알 수 있게 함
      nextBtn.src = itemPath;
    });
  });
}

setupItemScreen(1);
setupItemScreen(2);
setupItemScreen(3);

// ===== 화면 전환 버튼들 (아이템 선택 후 위치/크기 조정 화면을 거쳐서 넘어감) =====

document.getElementById("nextFromItem1").addEventListener("click", () => {
  document.getElementById("screenItem1").style.display = "none";
  openPositionScreen(1);
});

document.getElementById("nextFromItem2").addEventListener("click", () => {
  document.getElementById("screenItem2").style.display = "none";
  openPositionScreen(2);
});

document.getElementById("nextFromItem3").addEventListener("click", () => {
  document.getElementById("screenItem3").style.display = "none";
  openPositionScreen(3);
});

document.getElementById("nextFromPosition1").addEventListener("click", () => {
  closePositionScreen(1);
  document.getElementById("screenItem2").style.display = "block";
});

document.getElementById("nextFromPosition2").addEventListener("click", () => {
  closePositionScreen(2);
  document.getElementById("screenItem3").style.display = "block";
});

document.getElementById("nextFromPosition3").addEventListener("click", () => {
  closePositionScreen(3);
  document.getElementById("screenMotion1").style.display = "block";
});

// ===== 아이템 위치/크기/회전 조정 (아이템 1,2,3 선택 직후 공통으로 사용) =====

const dragWrapper = document.getElementById("dragWrapper");
const dragItem = document.getElementById("dragItem");
const dragHandle = document.getElementById("dragHandle");
const rotateHandle = document.getElementById("rotateHandle");

// 일부 브라우저는 draggable="false"만으로 이미지 네이티브 드래그가 안 막히는 경우가 있어 한 번 더 방지
dragItem.addEventListener("dragstart", (e) => e.preventDefault());

// 슬롯별 위치(%), 크기(px), 회전각(deg). 기본값은 기존 애니메이션 화면의 기본 배치와 동일하게 맞춤
const itemTransforms = {
  1: { leftPercent: 15, topPercent: 25, size: 110, rotate: 0 },
  2: { leftPercent: 55, topPercent: 50, size: 110, rotate: 0 },
  3: { leftPercent: 25, topPercent: 70, size: 110, rotate: 0 },
};

let activePositionSlot = null;

// 위치를 이미 확정한 슬롯들의 번호 (예: 아이템3 조정 중엔 {1, 2} — 아이템1,2가 실제 배치대로 계속 보임)
const placedSlots = new Set();

// 위치가 확정된 아이템들을 각자 정한 위치/크기/회전 그대로 미리보기에 그려줌
function renderPlacedItems() {
  document.querySelectorAll(".placedItem").forEach((el) => el.remove());

  placedSlots.forEach((slot) => {
    const t = itemTransforms[slot];
    const img = document.createElement("img");
    img.src = selectedItems[slot];
    img.className = "placedItem";
    img.style.left = `${t.leftPercent}%`;
    img.style.top = `${t.topPercent}%`;
    img.style.width = `${t.size}px`;
    img.style.height = `${t.size}px`;
    img.style.transform = `rotate(${t.rotate}deg)`;
    preview.appendChild(img);
  });
}

// 위치 조정 화면으로 들어가면서 하단 선택 패널을 숨겨 미리보기가 전체 화면(최종 애니메이션과 동일한 비율)을 차지하게 함
function openPositionScreen(slot) {
  activePositionSlot = slot;

  document.getElementById(`screenPosition${slot}`).style.display = "flex";

  dragItem.src = selectedItems[slot];
  dragWrapper.style.display = "block";
  applyTransformToDragItem();
}

function closePositionScreen(slot) {
  document.getElementById(`screenPosition${slot}`).style.display = "none";
  dragWrapper.style.display = "none";
  activePositionSlot = null;

  placedSlots.add(slot);
  renderPlacedItems(); // 방금 위치를 정한 아이템을 실제 배치대로 계속 보이게 함
}

// 저장된 위치/크기/회전 값을 드래그 틀에 실제로 반영 (손잡이들은 틀의 자식이라 회전에 자동으로 따라감)
function applyTransformToDragItem() {
  const t = itemTransforms[activePositionSlot];
  dragWrapper.style.left = `${t.leftPercent}%`;
  dragWrapper.style.top = `${t.topPercent}%`;
  dragWrapper.style.width = `${t.size}px`;
  dragWrapper.style.height = `${t.size}px`;
  dragWrapper.style.transform = `rotate(${t.rotate}deg)`;
}

// --- 드래그(이동) ---
let draggingItem = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

dragItem.addEventListener("pointerdown", (e) => {
  e.preventDefault(); // 이미지 네이티브 드래그가 대신 발동되는 것을 막음
  draggingItem = true;
  dragItem.setPointerCapture(e.pointerId);
  const rect = dragWrapper.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
});

dragItem.addEventListener("pointermove", (e) => {
  if (!draggingItem) return;

  const previewRect = preview.getBoundingClientRect();
  const t = itemTransforms[activePositionSlot];

  let newLeftPx = e.clientX - previewRect.left - dragOffsetX;
  let newTopPx = e.clientY - previewRect.top - dragOffsetY;

  // 미리보기 영역 밖으로 나가지 않도록 제한
  newLeftPx = Math.max(0, Math.min(newLeftPx, previewRect.width - t.size));
  newTopPx = Math.max(0, Math.min(newTopPx, previewRect.height - t.size));

  t.leftPercent = (newLeftPx / previewRect.width) * 100;
  t.topPercent = (newTopPx / previewRect.height) * 100;

  applyTransformToDragItem();
});

["pointerup", "pointercancel"].forEach((evt) => {
  dragItem.addEventListener(evt, () => {
    draggingItem = false;
  });
});

// --- 리사이즈(크기 조절): 중심점에서 손잡이까지의 거리로 계산해서 회전 각도와 무관하게 동작 ---
let resizingItem = false;

dragHandle.addEventListener("pointerdown", (e) => {
  resizingItem = true;
  dragHandle.setPointerCapture(e.pointerId);
  e.stopPropagation(); // 아이템 드래그가 동시에 발동되지 않도록
});

dragHandle.addEventListener("pointermove", (e) => {
  if (!resizingItem) return;

  const rect = dragWrapper.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

  // 손잡이는 정사각형 박스의 모서리에 있으므로 중심-모서리 거리 * √2 가 한 변의 길이
  const newSize = Math.max(30, Math.min(distance * Math.SQRT2, 400));

  itemTransforms[activePositionSlot].size = newSize;
  applyTransformToDragItem();
});

["pointerup", "pointercancel"].forEach((evt) => {
  dragHandle.addEventListener(evt, () => {
    resizingItem = false;
  });
});

// --- 회전 ---
let rotatingItem = false;

rotateHandle.addEventListener("pointerdown", (e) => {
  rotatingItem = true;
  rotateHandle.setPointerCapture(e.pointerId);
  e.stopPropagation();
});

rotateHandle.addEventListener("pointermove", (e) => {
  if (!rotatingItem) return;

  const rect = dragWrapper.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 포인터가 중심 바로 위에 있을 때 0도, 오른쪽으로 갈수록 시계방향으로 증가
  const angleDeg = (Math.atan2(e.clientX - centerX, -(e.clientY - centerY)) * 180) / Math.PI;

  itemTransforms[activePositionSlot].rotate = angleDeg;
  applyTransformToDragItem();
});

["pointerup", "pointercancel"].forEach((evt) => {
  rotateHandle.addEventListener(evt, () => {
    rotatingItem = false;
  });
});

// ===== 모든 단계의 "이전" 버튼 (지금까지 온 순서를 거꾸로 되돌아감) =====

// 위치 조정 화면으로 다시 들어갈 때: 이미 확정(placedSlots)됐던 상태였다면 확정을 풀어서
// 라이브 드래그 아이템과 정적 미리보기가 겹쳐 보이지 않게 함
function reopenPositionScreen(slot) {
  placedSlots.delete(slot);
  renderPlacedItems();
  openPositionScreen(slot);
}

// 위치 조정 화면에서 뒤로: 확정(다음으로 진행)하지 않고 그냥 이전 아이템 선택 화면으로 돌아감
function backOutOfPositionScreen(slot, itemScreenId) {
  document.getElementById(`screenPosition${slot}`).style.display = "none";
  dragWrapper.style.display = "none";
  activePositionSlot = null;
  document.getElementById(itemScreenId).style.display = "block";
}

document.getElementById("backFromItem1").addEventListener("click", () => {
  document.getElementById("screenItem1").style.display = "none";
  document.getElementById("screenBg").style.display = "block";
});

document.getElementById("backFromPosition1").addEventListener("click", () => {
  backOutOfPositionScreen(1, "screenItem1");
});

document.getElementById("backFromItem2").addEventListener("click", () => {
  document.getElementById("screenItem2").style.display = "none";
  reopenPositionScreen(1);
});

document.getElementById("backFromPosition2").addEventListener("click", () => {
  backOutOfPositionScreen(2, "screenItem2");
});

document.getElementById("backFromItem3").addEventListener("click", () => {
  document.getElementById("screenItem3").style.display = "none";
  reopenPositionScreen(2);
});

document.getElementById("backFromPosition3").addEventListener("click", () => {
  backOutOfPositionScreen(3, "screenItem3");
});

document.getElementById("backFromMotion1").addEventListener("click", () => {
  document.getElementById("screenMotion1").style.display = "none";
  reopenPositionScreen(3);
});

document.getElementById("backFromMotion2").addEventListener("click", () => {
  document.getElementById("screenMotion2").style.display = "none";
  document.getElementById("screenMotion1").style.display = "block";
});

document.getElementById("backFromMotion3").addEventListener("click", () => {
  document.getElementById("screenMotion3").style.display = "none";
  document.getElementById("screenMotion2").style.display = "block";
});

// ===== 5~7번째 화면: 아이템 1, 2, 3 모션 입력 (구조는 동일, 슬롯 번호만 다름) =====

// 랜덤 버튼을 눌렀을 때 후보로 쓸 모션 목록
const randomMotionList = [
  "통통 튀며", "빙글빙글", "지그재그", "스르륵 이동", "빛의 속도로", "풍선처럼 뻥", "펑키 댄스",
  "말랑말랑 스쿼시 바운스", "롤러코스터 스윙", "하트 뻥", "파도타기",
  "살짝 흔들기", "확대 및 강조", "기울어지며 인사", "말랑 압축",
];

// 슬롯(1,2,3)마다 입력된 모션 문장을 저장
const selectedMotions = { 1: "", 2: "", 3: "" };

// 모션 입력 화면 하나를 설정하는 함수 (1,2,3번 화면에 각각 적용)
function setupMotionScreen(slotNumber) {
  const buttonArea = document.querySelector(`.motionButtons[data-motion-slot="${slotNumber}"]`);
  const motionButtons = buttonArea.querySelectorAll(".motionBtn");
  const input = document.getElementById(`motionInput${slotNumber}`);
  const nextBtn = document.getElementById(`nextFromMotion${slotNumber}`);

  // 추천 버튼을 누르면 입력창에 문구가 자동으로 들어감
  motionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const motion = btn.getAttribute("data-motion");

      if (motion === "random") {
        // 랜덤 버튼: 목록 중 하나를 무작위로 골라서 입력창에 채움
        const randomIndex = Math.floor(Math.random() * randomMotionList.length);
        input.value = randomMotionList[randomIndex];
      } else {
        input.value = motion;
      }

      updateMotionState();
    });
  });

  // 사용자가 입력창에 직접 타이핑할 때도 상태 갱신
  input.addEventListener("input", updateMotionState);

  // 입력 내용에 따라 곰식이 버튼을 활성/비활성 처리하는 함수
  function updateMotionState() {
    selectedMotions[slotNumber] = input.value.trim();

    if (selectedMotions[slotNumber].length > 0) {
      nextBtn.classList.add("active");
    } else {
      nextBtn.classList.remove("active");
    }
  }
}

setupMotionScreen(1);
setupMotionScreen(2);
setupMotionScreen(3);

// ===== 모션 화면 간 전환 버튼들 =====

document.getElementById("nextFromMotion1").addEventListener("click", () => {
  document.getElementById("screenMotion1").style.display = "none";
  document.getElementById("screenMotion2").style.display = "block";
});

document.getElementById("nextFromMotion2").addEventListener("click", () => {
  document.getElementById("screenMotion2").style.display = "none";
  document.getElementById("screenMotion3").style.display = "block";
});

document.getElementById("nextFromMotion3").addEventListener("click", () => {
  document.getElementById("screenMotion3").style.display = "none";

  // 브랜드 연출 화면을 보여주고, 성 -> 심 -> 당을 0.5초 간격으로 하나씩 나타나게 함
  const brandReveal = document.getElementById("brandReveal");
  brandReveal.style.display = "flex";

  setTimeout(() => {
    document.getElementById("brandChar1").classList.add("show");
  }, 0);

  setTimeout(() => {
    document.getElementById("brandChar2").classList.add("show");
  }, 500);

  setTimeout(() => {
    document.getElementById("brandChar3").classList.add("show");
  }, 1000);

  // 브랜드 연출(성심당)이 끝난 뒤(1.5초 후) 애니메이션 화면으로 전환
  setTimeout(() => {
    brandReveal.style.display = "none";
    startAnimation();
  }, 1500);
});

// ===== 9번째 화면: 애니메이션 (배경 + 아이템 1,2,3이 각자 모션대로 움직임) =====

// ⚠️ 아래 따옴표 안에 본인의 Groq API 키를 붙여넣어주세요 (gsk_로 시작하는 문자열)
// 퍼블릭 저장소에 올라가므로 키는 커밋하지 말고 로컬에서만 채워서 사용하세요
const GROQ_API_KEY = "";

// 1. 먼저 로컬에서 추천 버튼 키워드가 포함되어 있는지 확인 (빠르고, 인터넷 필요 없음)
// 못 찾으면 null을 반환해서 "AI에게 물어봐야 함"을 표시
function getLocalMotionClass(motionText) {
  if (motionText.includes("통통")) return "motion-bounce";
  if (motionText.includes("빙글")) return "motion-spin";
  if (motionText.includes("지그재그")) return "motion-zigzag";
  if (motionText.includes("스르륵")) return "motion-slide";
  if (motionText.includes("빛의 속도")) return "motion-fast";
  // ⚠️ "하트 뻥"에도 "뻥"이 들어있어서, 아래 motion-balloon의 "뻥" 검사보다 반드시 앞에 있어야 함
  if (motionText.includes("하트")) return "motion-heart";
  if (motionText.includes("스쿼시")) return "motion-squash";
  if (motionText.includes("롤러코스터")) return "motion-coaster";
  if (motionText.includes("파도")) return "motion-surf";
  if (motionText.includes("흔들기")) return "motion-wiggle";
  if (motionText.includes("확대")) return "motion-zoompulse";
  if (motionText.includes("인사")) return "motion-tiltwave";
  if (motionText.includes("압축")) return "motion-squeeze";
  if (motionText.includes("풍선") || motionText.includes("뻥") || motionText.includes("오븐") || motionText.includes("터지")) return "motion-balloon";
  if (motionText.includes("펑키") || motionText.includes("댄스") || motionText.includes("춤")) return "motion-funky";
  return null;
}

// 2. 로컬에서 못 찾은 자유 입력 문장은 Groq(AI)에게 어떤 움직임과 제일 비슷한지 물어봄
async function classifyMotionWithGroq(motionText) {
  const categoryMap = {
    "통통": "motion-bounce",
    "빙글빙글": "motion-spin",
    "지그재그": "motion-zigzag",
    "스르륵": "motion-slide",
    "빛의속도": "motion-fast",
    "풍선처럼뻥": "motion-balloon",
    "펑키댄스": "motion-funky",
    "스쿼시바운스": "motion-squash",
    "롤러코스터스윙": "motion-coaster",
    "하트뻥": "motion-heart",
    "파도타기": "motion-surf",
    "살짝흔들기": "motion-wiggle",
    "확대강조": "motion-zoompulse",
    "기울어지며인사": "motion-tiltwave",
    "말랑압축": "motion-squeeze",
    "기본": "motion-float",
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content:
              `다음 문장이 표현하는 움직임과 가장 비슷한 것을 아래 목록 중 하나만 골라서, ` +
              `다른 설명 없이 정확히 그 단어 하나만 답해줘.\n\n` +
              `목록: 통통, 빙글빙글, 지그재그, 스르륵, 빛의속도, 풍선처럼뻥, 펑키댄스, ` +
              `스쿼시바운스, 롤러코스터스윙, 하트뻥, 파도타기, 살짝흔들기, 확대강조, 기울어지며인사, 말랑압축, 기본\n\n` +
              `문장: "${motionText}"`,
          },
        ],
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content.trim();

    return categoryMap[answer] || "motion-float";
  } catch (err) {
    // API 키가 없거나 인터넷 연결 문제 등으로 실패하면 기본 움직임으로 대체
    console.log("Groq 연결 실패, 기본 움직임으로 대체합니다:", err);
    return "motion-float";
  }
}

// 3. 최종적으로 어떤 움직임 클래스를 쓸지 결정 (로컬 우선, 없으면 Groq에게 문의)
async function getFinalMotionClass(motionText) {
  const localMatch = getLocalMotionClass(motionText);
  if (localMatch) return localMatch;

  return await classifyMotionWithGroq(motionText);
}

// 슬롯별로 최종 확정된 모션 클래스 (동영상 캡처 때 재사용)
const animMotionClasses = {};

async function startAnimation() {
  // 배경 화면에 선택한 배경 적용
  document.getElementById("animBg").style.backgroundImage = `url('${selectedBg}')`;

  // 아이템 1, 2, 3 각각에 이미지, 위치/크기/회전, 모션 클래스를 적용
  // 위치/크기/회전은 틀(wrap)에, 모션 애니메이션은 안쪽 img에 따로 둬서 서로 덮어쓰지 않고 함께 합성됨
  for (const slot of [1, 2, 3]) {
    const wrap = document.getElementById(`animItemWrap${slot}`);
    const img = document.getElementById(`animItem${slot}`);
    img.src = selectedItems[slot];

    const t = itemTransforms[slot];
    wrap.style.left = `${t.leftPercent}%`;
    wrap.style.top = `${t.topPercent}%`;
    wrap.style.width = `${t.size}px`;
    wrap.style.height = `${t.size}px`;
    wrap.style.transform = `rotate(${t.rotate}deg)`;

    const motionClass = await getFinalMotionClass(selectedMotions[slot]);
    img.classList.add(motionClass);
    animMotionClasses[slot] = motionClass;
  }

  document.getElementById("animationScreen").style.display = "block";

  // 공유하기에 쓸 완성 이미지/동영상을 애니메이션이 재생되는 동안 미리 만들어둠
  renderFinalImage().then((blob) => {
    finalImageBlob = blob;
  });
  renderFinalVideo().then((blob) => {
    finalVideoBlob = blob;
  });

  // 애니메이션 6.5초가 지나면 완료 화면으로 전환
  setTimeout(() => {
    document.getElementById("animationScreen").style.display = "none";
    document.getElementById("screenFinish").style.display = "block";
  }, 6500);
}

// ===== 완성 이미지 만들기 (배경 + 아이템들을 정한 위치/크기 그대로 캔버스에 합성) =====

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1920;

let finalImageBlob = null;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderFinalImage() {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const ctx = canvas.getContext("2d");

  // 레터박스로 남는 부분을 채울 배경색
  ctx.fillStyle = "#F5EFE0";
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  // 배경 이미지 (앱과 동일하게 자르지 않고 전체가 다 보이도록 - contain 방식)
  if (selectedBg) {
    const bgImg = await loadImage(selectedBg);
    const scale = Math.min(EXPORT_WIDTH / bgImg.width, EXPORT_HEIGHT / bgImg.height);
    const drawW = bgImg.width * scale;
    const drawH = bgImg.height * scale;
    ctx.drawImage(bgImg, (EXPORT_WIDTH - drawW) / 2, (EXPORT_HEIGHT - drawH) / 2, drawW, drawH);
  }

  // 아이템 1, 2, 3을 각자 정한 위치/크기 그대로 그림 (미리보기 기준 480px 폭 대비 배율 적용)
  const scaleFactor = EXPORT_WIDTH / 480;
  for (const slot of [1, 2, 3]) {
    const path = selectedItems[slot];
    if (!path) continue;

    const itemImg = await loadImage(path);
    const t = itemTransforms[slot];
    const boxSize = t.size * scaleFactor;
    const boxX = (t.leftPercent / 100) * EXPORT_WIDTH;
    const boxY = (t.topPercent / 100) * EXPORT_HEIGHT;

    // object-fit:contain과 동일하게 아이템 이미지의 원래 비율을 유지한 채 박스 안에 맞춤
    const itemScale = Math.min(boxSize / itemImg.width, boxSize / itemImg.height);
    const drawW = itemImg.width * itemScale;
    const drawH = itemImg.height * itemScale;

    ctx.save();
    ctx.translate(boxX + boxSize / 2, boxY + boxSize / 2);
    ctx.rotate(((t.rotate || 0) * Math.PI) / 180);
    ctx.drawImage(itemImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

// ===== 완성 동영상 만들기 (배경 + 아이템들의 실제 모션을 캔버스에 재현해서 녹화) =====

const VIDEO_DURATION_SEC = 7;
const VIDEO_FPS = 30;

let finalVideoBlob = null;

// CSS의 ease-in-out / ease-in과 비슷한 느낌을 내기 위한 간단한 이징 함수
function easeInOut(t) {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}
function easeIn(t) {
  return t * t;
}

// 펑키 댄스(motion-funky)의 CSS @keyframes와 동일한 좌표를 그대로 옮겨 적은 것
// (0~1 구간의 지점들 사이를 부드럽게 보간해서 캔버스에서도 같은 안무를 재현함)
const FUNKY_KEYFRAMES = [
  { p: 0,    dx: 0,   dy: 0,   rot: 0,    scale: 1 },
  { p: 0.08, dx: -18,  dy: -6,  rot: -8,   scale: 1.05 },
  { p: 0.16, dx: 18,   dy: -6,  rot: 8,    scale: 1.05 },
  { p: 0.24, dx: -14,  dy: 0,   rot: -6,   scale: 1 },
  { p: 0.32, dx: 0,    dy: -20, rot: 180,  scale: 1.1 },
  { p: 0.40, dx: 0,    dy: 0,   rot: 360,  scale: 1 },
  { p: 0.48, dx: 16,   dy: -8,  rot: 10,   scale: 1.05 },
  { p: 0.56, dx: -16,  dy: -8,  rot: -10,  scale: 1.05 },
  { p: 0.64, dx: 0,    dy: -24, rot: -360, scale: 1.1 },
  { p: 0.72, dx: 0,    dy: 0,   rot: 0,    scale: 1 },
  { p: 0.80, dx: 0,    dy: -10, rot: 0,    scale: 1.15 },
  { p: 0.88, dx: 0,    dy: -10, rot: 0,    scale: 1.2 },
  { p: 1,    dx: 0,    dy: 0,   rot: 0,    scale: 1 },
];

// 아래 배열들도 각 모션의 CSS @keyframes 좌표를 그대로 옮겨 적은 것 (0~1 구간 기준)
const SQUASH_KEYFRAMES = [
  { p: 0,    dx: 0, dy: 0,   rot: 0, scale: 1, sx: 1,    sy: 1 },
  { p: 0.20, dx: 0, dy: 8,   rot: 0, scale: 1, sx: 1.25, sy: 0.75 },
  { p: 0.45, dx: 0, dy: -45, rot: 0, scale: 1, sx: 0.85, sy: 1.2 },
  { p: 0.70, dx: 0, dy: 0,   rot: 0, scale: 1, sx: 1.15, sy: 0.85 },
  { p: 0.85, dx: 0, dy: 0,   rot: 0, scale: 1, sx: 0.95, sy: 1.05 },
  { p: 1,    dx: 0, dy: 0,   rot: 0, scale: 1, sx: 1,    sy: 1 },
];

const COASTER_KEYFRAMES = [
  { p: 0,    dx: 0,   dy: 0,    rot: 0,   scale: 1 },
  { p: 0.25, dx: 50,  dy: -60,  rot: 90,  scale: 1 },
  { p: 0.50, dx: 0,   dy: -100, rot: 180, scale: 1 },
  { p: 0.75, dx: -50, dy: -60,  rot: 270, scale: 1 },
  { p: 1,    dx: 0,   dy: 0,    rot: 360, scale: 1 },
];

const HEART_KEYFRAMES = [
  { p: 0,    dx: 0, dy: 0, rot: 0, scale: 1 },
  { p: 0.15, dx: 0, dy: 0, rot: 0, scale: 1.25 },
  { p: 0.30, dx: 0, dy: 0, rot: 0, scale: 1 },
  { p: 0.45, dx: 0, dy: 0, rot: 0, scale: 1.2 },
  { p: 0.60, dx: 0, dy: 0, rot: 0, scale: 1 },
  { p: 1,    dx: 0, dy: 0, rot: 0, scale: 1 },
];

const SURF_KEYFRAMES = [
  { p: 0,    dx: 0,   dy: -20, rot: -6, scale: 1 },
  { p: 0.25, dx: 25,  dy: 0,   rot: 6,  scale: 1 },
  { p: 0.50, dx: 0,   dy: 20,  rot: -6, scale: 1 },
  { p: 0.75, dx: -25, dy: 0,   rot: 6,  scale: 1 },
  { p: 1,    dx: 0,   dy: -20, rot: -6, scale: 1 },
];

const WIGGLE_KEYFRAMES = [
  { p: 0,    dx: 0,  dy: 0, rot: 0,  scale: 1 },
  { p: 0.25, dx: -8, dy: 0, rot: -3, scale: 1 },
  { p: 0.75, dx: 8,  dy: 0, rot: 3,  scale: 1 },
  { p: 1,    dx: 0,  dy: 0, rot: 0,  scale: 1 },
];

const TILTWAVE_KEYFRAMES = [
  { p: 0,    dx: 0, dy: 0, rot: 0,   scale: 1 },
  { p: 0.25, dx: 0, dy: 0, rot: 15,  scale: 1 },
  { p: 0.75, dx: 0, dy: 0, rot: -15, scale: 1 },
  { p: 1,    dx: 0, dy: 0, rot: 0,   scale: 1 },
];

const SQUEEZE_KEYFRAMES = [
  { p: 0,    dx: 0, dy: 0, rot: 0, scale: 1, sx: 1,    sy: 1 },
  { p: 0.40, dx: 0, dy: 0, rot: 0, scale: 1, sx: 1.2,  sy: 0.7 },
  { p: 0.60, dx: 0, dy: 0, rot: 0, scale: 1, sx: 0.9,  sy: 1.15 },
  { p: 0.80, dx: 0, dy: 0, rot: 0, scale: 1, sx: 1.05, sy: 0.95 },
  { p: 1,    dx: 0, dy: 0, rot: 0, scale: 1, sx: 1,    sy: 1 },
];

function interpolateKeyframes(points, phase) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (phase >= a.p && phase <= b.p) {
      const span = b.p - a.p;
      const local = span === 0 ? 0 : (phase - a.p) / span;
      const eased = easeInOut(local);
      // sx/sy가 있으면 가로/세로를 따로 늘리고(스쿼시 앤 스트레치), 없으면 scale로 균일하게
      const aSx = a.sx !== undefined ? a.sx : a.scale;
      const aSy = a.sy !== undefined ? a.sy : a.scale;
      const bSx = b.sx !== undefined ? b.sx : b.scale;
      const bSy = b.sy !== undefined ? b.sy : b.scale;
      return {
        dx: a.dx + (b.dx - a.dx) * eased,
        dy: a.dy + (b.dy - a.dy) * eased,
        rotateDeg: a.rot + (b.rot - a.rot) * eased,
        scale: a.scale + (b.scale - a.scale) * eased,
        scaleX: aSx + (bSx - aSx) * eased,
        scaleY: aSy + (bSy - aSy) * eased,
      };
    }
  }
  return { dx: 0, dy: 0, rotateDeg: 0, scale: 1, scaleX: 1, scaleY: 1 };
}

// 모션 클래스별로 style.css의 @keyframes를 흉내내서, 경과 시간(tSec)에 따른
// 위치/회전/크기/투명도 변화량을 계산 (캔버스 녹화용)
function getMotionOffset(motionClass, t) {
  switch (motionClass) {
    case "motion-bounce": {
      const phase = (t % 0.9) / 0.9;
      return { dx: 0, dy: -40 * Math.sin(Math.PI * phase), rotateDeg: 0, scale: 1, opacity: 1 };
    }
    case "motion-spin": {
      const phase = (t % 1.2) / 1.2;
      return { dx: 0, dy: 0, rotateDeg: 360 * phase, scale: 1, opacity: 1 };
    }
    case "motion-zigzag": {
      const points = [0, 35, -35, 35, 0];
      const phase = (t % 1.6) / 1.6;
      const segT = phase * 4;
      const idx = Math.min(3, Math.floor(segT));
      const local = segT - idx;
      const dx = points[idx] + (points[idx + 1] - points[idx]) * easeInOut(local);
      return { dx, dy: 0, rotateDeg: 0, scale: 1, opacity: 1 };
    }
    case "motion-slide": {
      const cyclePos = (t % 4.4) / 2.2; // 0~2 (ease-in-out infinite alternate)
      const dx = cyclePos <= 1 ? -100 + 200 * easeInOut(cyclePos) : 100 - 200 * easeInOut(cyclePos - 1);
      return { dx, dy: 0, rotateDeg: 0, scale: 1, opacity: 1 };
    }
    case "motion-fast": {
      const phase = (t % 0.7) / 0.7;
      const dx = phase < 0.5 ? -120 + 240 * (phase / 0.5) : 120 - 240 * ((phase - 0.5) / 0.5);
      return { dx, dy: 0, rotateDeg: 0, scale: 1, opacity: 1 };
    }
    case "motion-balloon": {
      const duration = 2.5;
      const points = [
        { p: 0,    scale: 1,   rot: 0,  op: 1 },
        { p: 0.30, scale: 1.15, rot: -3, op: 1 },
        { p: 0.55, scale: 1.3, rot: 3,  op: 1 },
        { p: 0.75, scale: 1.5, rot: -2, op: 1 },
        { p: 0.87, scale: 1.8, rot: 0,  op: 1 },
        { p: 0.90, scale: 2.3, rot: 0,  op: 0 },
        { p: 1,    scale: 2.3, rot: 0,  op: 0 },
      ];
      const phase = Math.min(1, t / duration);
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (phase >= a.p && phase <= b.p) {
          const span = b.p - a.p;
          const local = span === 0 ? 0 : (phase - a.p) / span;
          const eased = easeInOut(local);
          return {
            dx: 0,
            dy: 0,
            rotateDeg: a.rot + (b.rot - a.rot) * eased,
            scale: a.scale + (b.scale - a.scale) * eased,
            opacity: a.op + (b.op - a.op) * eased,
          };
        }
      }
      return { dx: 0, dy: 0, rotateDeg: 0, scale: 2.3, opacity: 0 };
    }
    case "motion-funky": {
      const phase = (t % 6) / 6;
      const offset = interpolateKeyframes(FUNKY_KEYFRAMES, phase);
      return { ...offset, opacity: 1 };
    }
    case "motion-squash": {
      const offset = interpolateKeyframes(SQUASH_KEYFRAMES, (t % 1) / 1);
      return { ...offset, opacity: 1 };
    }
    case "motion-coaster": {
      const offset = interpolateKeyframes(COASTER_KEYFRAMES, (t % 3) / 3);
      return { ...offset, opacity: 1 };
    }
    case "motion-heart": {
      const offset = interpolateKeyframes(HEART_KEYFRAMES, (t % 1.1) / 1.1);
      return { ...offset, opacity: 1 };
    }
    case "motion-surf": {
      const offset = interpolateKeyframes(SURF_KEYFRAMES, (t % 3.5) / 3.5);
      return { ...offset, opacity: 1 };
    }
    case "motion-wiggle": {
      const offset = interpolateKeyframes(WIGGLE_KEYFRAMES, (t % 0.5) / 0.5);
      return { ...offset, opacity: 1 };
    }
    case "motion-zoompulse": {
      const phase = (t % 0.8) / 0.8;
      const eased = phase <= 0.5 ? easeInOut(phase / 0.5) : easeInOut((1 - phase) / 0.5);
      return { dx: 0, dy: 0, rotateDeg: 0, scale: 1 + 0.35 * eased, opacity: 1 };
    }
    case "motion-tiltwave": {
      const offset = interpolateKeyframes(TILTWAVE_KEYFRAMES, (t % 1.4) / 1.4);
      return { ...offset, opacity: 1 };
    }
    case "motion-squeeze": {
      const offset = interpolateKeyframes(SQUEEZE_KEYFRAMES, (t % 1.2) / 1.2);
      return { ...offset, opacity: 1 };
    }
    default: {
      // motion-float
      const phase = (t % 2) / 2;
      if (phase <= 0.5) {
        const eased = easeInOut(phase / 0.5);
        return { dx: 0, dy: -18 * eased, rotateDeg: -4 + 8 * eased, scale: 1, opacity: 1 };
      }
      const eased = easeInOut((phase - 0.5) / 0.5);
      return { dx: 0, dy: -18 * (1 - eased), rotateDeg: 4 - 8 * eased, scale: 1, opacity: 1 };
    }
  }
}

function pickVideoMimeType() {
  const candidates = [
    "video/mp4;codecs=h264",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || null;
}

async function renderFinalVideo() {
  // 이 브라우저가 캔버스 녹화를 지원하지 않으면 null 반환 (공유 시 이미지로 자동 대체됨)
  if (typeof MediaRecorder === "undefined") return null;
  const mimeType = pickVideoMimeType();
  if (!mimeType) return null;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_WIDTH;
    canvas.height = EXPORT_HEIGHT;
    if (typeof canvas.captureStream !== "function") return null;
    const ctx = canvas.getContext("2d");

    const bgImg = selectedBg ? await loadImage(selectedBg) : null;
    const itemImgs = {};
    for (const slot of [1, 2, 3]) {
      if (selectedItems[slot]) itemImgs[slot] = await loadImage(selectedItems[slot]);
    }
    const scaleFactor = EXPORT_WIDTH / 480;

    function drawFrame(tSec) {
      ctx.fillStyle = "#F5EFE0";
      ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

      if (bgImg) {
        const scale = Math.min(EXPORT_WIDTH / bgImg.width, EXPORT_HEIGHT / bgImg.height);
        const drawW = bgImg.width * scale;
        const drawH = bgImg.height * scale;
        ctx.drawImage(bgImg, (EXPORT_WIDTH - drawW) / 2, (EXPORT_HEIGHT - drawH) / 2, drawW, drawH);
      }

      for (const slot of [1, 2, 3]) {
        const itemImg = itemImgs[slot];
        if (!itemImg) continue;

        const t = itemTransforms[slot];
        const boxSize = t.size * scaleFactor;
        const boxX = (t.leftPercent / 100) * EXPORT_WIDTH;
        const boxY = (t.topPercent / 100) * EXPORT_HEIGHT;
        const itemScale = Math.min(boxSize / itemImg.width, boxSize / itemImg.height);
        const drawW = itemImg.width * itemScale;
        const drawH = itemImg.height * itemScale;
        const centerX = boxX + boxSize / 2;
        const centerY = boxY + boxSize / 2;

        const offset = getMotionOffset(animMotionClasses[slot], tSec);

        ctx.save();
        ctx.globalAlpha = offset.opacity;
        ctx.translate(centerX + offset.dx * scaleFactor, centerY + offset.dy * scaleFactor);
        // 사용자가 정한 기본 회전값 + 모션 애니메이션 자체의 회전을 합쳐서 적용
        ctx.rotate(((t.rotate || 0) + offset.rotateDeg) * (Math.PI / 180));
        // 스쿼시 계열 모션은 가로/세로 배율이 다르므로(scaleX/scaleY), 없으면 균일 배율 사용
        ctx.scale(
          offset.scaleX !== undefined ? offset.scaleX : offset.scale,
          offset.scaleY !== undefined ? offset.scaleY : offset.scale,
        );
        ctx.drawImage(itemImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }
    }

    const stream = canvas.captureStream(VIDEO_FPS);
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const recordingDone = new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    recorder.start();
    const startTime = performance.now();
    await new Promise((resolve) => {
      let done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve();
      }
      function tick() {
        const elapsed = (performance.now() - startTime) / 1000;
        drawFrame(elapsed);
        if (elapsed >= VIDEO_DURATION_SEC) {
          finish();
        } else {
          requestAnimationFrame(tick);
        }
      }
      tick();
      // 안전장치: 탭이 백그라운드라 requestAnimationFrame이 멈추는 등의 경우에도
      // 무한정 대기하지 않도록 최대 대기시간 이후엔 강제로 녹화를 종료함
      setTimeout(finish, VIDEO_DURATION_SEC * 1000 + 1000);
    });
    recorder.stop();

    return recordingDone;
  } catch (err) {
    console.log("동영상 캡처 실패, 이미지로 대체됩니다:", err);
    return null;
  }
}

// ===== 10번째 화면: 완료 + 공유하기 =====

document.getElementById("shareBtn").addEventListener("click", async () => {
  const shareText = "성심당에서 나만의 빵 애니메이션을 만들었어요! 🍞";

  const videoFile = finalVideoBlob
    ? new File([finalVideoBlob], `sungsimdang-bread.${finalVideoBlob.type.includes("mp4") ? "mp4" : "webm"}`, {
        type: finalVideoBlob.type,
      })
    : null;
  const imageFile = finalImageBlob
    ? new File([finalImageBlob], "sungsimdang-bread.png", { type: "image/png" })
    : null;

  if (navigator.share) {
    // 스마트폰 기본 공유 기능(Web Share API) 사용
    try {
      if (videoFile && navigator.canShare && navigator.canShare({ files: [videoFile] })) {
        await navigator.share({ text: shareText, files: [videoFile] });
      } else if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({ text: shareText, files: [imageFile] });
      } else {
        await navigator.share({ text: shareText });
      }
    } catch (err) {
      // 사용자가 공유를 취소한 경우 등은 조용히 무시
    }
  } else {
    // 공유 기능을 지원하지 않는 브라우저(PC 등)에서는 대신 알려줌
    alert(`공유 기능을 지원하지 않는 환경이에요.\n\n다음 문구를 복사해서 사용해주세요:\n\n${shareText}`);
  }
});
