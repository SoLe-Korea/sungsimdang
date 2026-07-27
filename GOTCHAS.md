# Gotchas

## `<img>` 드래그 시 브라우저 네이티브 드래그가 끼어듦
포인터 기반 커스텀 드래그(위치 조정 화면)를 `<img>`에 붙였더니, 브라우저의
기본 "이미지 끌어서 옮기기"(고스트 이미지) 제스처가 먼저 발동해서 커스텀
로직이 씹혔다. `draggable="false"` 속성만으로는 일부 브라우저에서 부족함.
`dragstart`와 `pointerdown` 양쪽에서 `e.preventDefault()`를 걸어야 확실히
막힌다.

## flex 컨테이너에서 `min-height:100%` 형제가 `flex:1` 형제를 밀어냄
인트로 화면(`#screenIntro`, `min-height:100%`)을 `#preview`(`flex:1`)와 같은
`flex-direction:column` 부모 안에 형제로 넣었더니, `#preview`의 높이가 0으로
찌그러졌다. `min-height:100%`인 형제가 부모의 가용 공간을 다 차지해버려서
`flex:1` 쪽에 남는 공간이 없어진 것. 해결: 서로 관련 없는 화면 그룹을
`#mainScreen`처럼 별도의 `div`로 감싸서 각자 독립된 flex 레이아웃 단위로
분리했다.

## `git add -A`가 로컬 전용 파일을 실수로 커밋함
`git add -A`를 한 번 썼다가 `.claude/settings.local.json`(로컬 툴 권한
설정)과 `qrcode.png`(앱에서 안 쓰는 임시 파일)가 퍼블릭 리포에 같이 올라갔다.
이 리포에서는 항상 파일명을 명시해서 `git add`하고, `.gitignore`에
`.claude/`, `qrcode.png`를 추가해뒀다.

## GitHub Pages는 캐시가 심하다
푸시 직후 바로 반영되지 않는다(브라우저 캐시 + GitHub 쪽 CDN 캐시 둘 다).
- 로컬/배포 사이트 확인 시 항상 하드 리프레시(Cmd+Shift+R)
- 배포됐다고 사용자에게 알리기 전에 `curl`로 실제 배포된 파일 내용을
  polling해서 새 코드가 들어갔는지 확인하고 나서 알린다 (`runbooks/deploy.md`
  참고)

## 자동화 마우스 드래그 시뮬레이션이 상태를 꼬이게 함
브라우저 자동화(`computer` 도구)로 마우스 드래그를 흉내내면 pointer capture가
깔끔하게 안 끝나서 다음 테스트에 값이 이어져 꼬이는 경우가 있었다. 위치/크기/
회전 값을 확정적으로 테스트하려면 드래그를 시뮬레이션하는 대신
`itemTransforms[n] = {...}; applyTransformToDragItem();`처럼 JS 콘솔에서
직접 값을 넣는 게 안전하다.

## WebFetch로 grok.com 접근 불가
`grok.com/imagine/...` 같은 로그인 필요한 페이지는 WebFetch가 403으로 막힌다.
사용자에게 화면 설명이나 스크린샷을 요청해서 대체해야 한다.

## 작업 디렉터리에 `.git`이 없어질 수 있음
2026-07-28 세션 시작 시 `/Users/sole/dev/photo`에 `.git`이 통째로 없는
상태였다(원인 불명, 이전 세션의 정상 커밋 이력은 GitHub 원격에 그대로
남아있었음). `git init`으로 새로 만들면 원격과 이력이 안 이어지고, 그 뒤
`push`가 거부되거나 `--force`를 써야 하게 돼서 위험하다. 대신:
1. 원격(`https://github.com/SoLe-Korea/sungsimdang.git`)을 스크래치패드 등
   별도 위치에 `git clone`
2. 작업 디렉터리에서 바뀐 파일만 그 클론 위로 `cp`
3. 클론 안에서 `git add <파일명 명시> && git commit && git push`
이렇게 하면 원격의 기존 커밋 이력에 자연스럽게 이어붙는 정상 커밋이 된다.
`git status`가 "not a git repository"로 나와도 리포 자체가 망가진 게
아니라 이 로컬 디렉터리에만 `.git`이 없는 경우가 많으니 당황하지 말 것.
