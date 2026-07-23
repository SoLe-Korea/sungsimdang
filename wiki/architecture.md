# 아키텍처 노트

정적 사이트, 빌드 스텝 없음, 프레임워크 없음. `index.html` + `style.css` +
`script.js` 세 파일이 전부.

## 화면 흐름

인트로(`#screenIntro`) → 배경 선택(`#screenBg`) →
(아이템1 선택 → 위치/크기/회전 조정) →
(아이템2 선택 → 위치/크기/회전 조정) →
(아이템3 선택 → 위치/크기/회전 조정) →
모션1 입력 → 모션2 입력 → 모션3 입력 →
브랜드 연출(`#brandReveal`) → 애니메이션 재생(`#animationScreen`) →
완료+공유(`#screenFinish`)

이미 아이템 배치를 마친 뒤에 나오는 화면(아이템2/3 선택, 모션1/2/3 입력)은
`.screen` 대신 `.screenOverlay` 클래스를 씀 — `.screen`은 `#preview` 아래서
자기 높이만큼 `#preview`를 밀어내는 반면, `.screenOverlay`는 `#preview` 위에
반투명 오버레이(`backdrop-filter: blur`)로 뜬다. 이렇게 해야 `#preview`가
항상 전체 프레임 크기를 유지해서, 위치 조정 화면에서 정한 %좌표가 이후
모든 화면과 최종 캔버스 내보내기에서까지 정확히 일치한다. (배경 선택
화면과 아이템1 선택 화면만 원래 방식 `.screen`을 씀 — 아직 배치할 아이템이
없어서 상관없고, 배경 사진이 세로로 눌리는 문제를 피하려고 일부러 이렇게
나눔.)

## 위치/크기/회전 시스템

`itemTransforms = {1: {leftPercent, topPercent, size, rotate}, 2: {...}, 3: {...}}`
가 유일한 진실의 소스(source of truth).

이 값은 항상 **감싸는 wrapper 요소**에 적용됨:
- 조정 중: `#dragWrapper`
- 최종 애니메이션: `.animItemWrap` (`#animItemWrap1/2/3`)
- 아직 조정 안 한 화면에서 "이미 정한 대로 보여주기": `.placedItem`

안쪽 `<img>`는 절대 사용자 transform을 받지 않고, **모션 애니메이션
클래스(`motion-*`)만** 받는다. 이렇게 나눈 이유: 회전값과 모션 애니메이션이
둘 다 CSS `transform`을 쓰는데, 같은 요소에 있으면 서로 덮어써 버린다.
wrapper(회전) → img(모션)로 요소를 분리하면 두 transform이 중첩되어
자연스럽게 합성된다.

## 모션 시스템

`style.css`에 `@keyframes motion*` + `.motion-*` 클래스로 정의된 CSS
애니메이션이 실제 화면(`#animationScreen`)에서 재생되는 것.

**중요**: `script.js`의 `getMotionOffset(motionClass, tSec)` 함수가 이
keyframe들을 JS로 그대로 재구현한 병행 버전이다. 공유용 정지 이미지
(`renderFinalImage`)와 동영상(`renderFinalVideo`)은 실제 DOM/CSS 애니메이션이
아니라 Canvas 2D로 직접 그리기 때문에, CSS keyframe과 별개로 이 함수가
같은 움직임을 좌표 계산으로 재현해야 한다.

**모션을 하나 추가/수정할 때마다 아래 4곳을 전부 맞춰야 함** (놓치면
화면에서는 새 모션인데 공유되는 이미지/영상만 옛날 모션으로 나가는 식으로
어긋난다):
1. `style.css` — `@keyframes motion수정`, `.motion-수정` 클래스
2. `index.html` — 모션 추천 버튼 (모션1/2/3 화면 3곳 다)
3. `script.js` `getLocalMotionClass()` — 한글 키워드 매칭
4. `script.js` `classifyMotionWithGroq()` — `categoryMap` + AI에게 보내는
   목록 문자열
5. `script.js` `getMotionOffset()` — canvas 재생용 좌표 계산 case 추가

우선순위: `getLocalMotionClass()`(로컬 키워드 매칭) → 못 찾으면
`classifyMotionWithGroq()`(Groq API, 로컬에서 `GROQ_API_KEY` 채워야 동작 —
커밋된 리포에는 보안상 빈 문자열임) → 그래도 실패하면 `motion-float`로
대체.

## 공유(내보내기) 시스템

- `renderFinalImage()`: 최종 위치/크기/회전 그대로 1080×1920 PNG를 Canvas
  2D로 그림 (정지 이미지).
- `renderFinalVideo()`: 같은 캔버스를 `MediaRecorder` + `canvas.captureStream()`
  으로 7초간 녹화하면서 매 프레임 `getMotionOffset()`으로 좌표를 계산해서
  그림 → mp4/webm 생성.
- 공유 버튼(`shareBtn`)은 Web Share API(`navigator.share({files:[...]})`)로
  동영상 → 실패하면 이미지 → 그것도 실패하면 텍스트만(alert로 복사용 문구
  제공) 순서로 점진적 대체(fallback)한다.
- HTTPS가 아니면 `navigator.share`의 파일 공유가 아예 동작하지 않아서 (모바일
  브라우저 보안 정책), 로컬 IP·HTTP로 테스트할 때는 공유가 텍스트만 나가는
  것처럼 보인다 — GitHub Pages(HTTPS)에 배포한 이유가 이것.

## 배포

백엔드 없음. `SoLe-Korea/sungsimdang` 퍼블릭 리포의 `main` 브랜치 루트를
GitHub Pages로 서빙. 자세한 절차는 `runbooks/deploy.md` 참고.
