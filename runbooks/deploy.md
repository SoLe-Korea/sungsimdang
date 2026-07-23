# 배포 절차 (GitHub Pages)

이 프로젝트는 백엔드 없이 GitHub Pages 정적 호스팅만 쓴다. 배포 = 커밋 후
`main`에 푸시하면 자동 반영된다.

## 1. 로컬에서 먼저 확인
```
python3 -m http.server 8000   # 프로젝트 루트에서 (이미 떠있으면 생략)
```
브라우저에서 `http://localhost:8000/index.html` 열고 **하드 리프레시**
(Cmd+Shift+R) — 그냥 새로고침은 캐시된 옛날 파일을 보여줄 수 있음.

## 2. 커밋 & 푸시
파일을 **명시적으로** 지정해서 add한다 (`-A`/`-uall` 금지 — `GOTCHAS.md`
참고, 로컬 설정 파일이 실수로 딸려 들어감):
```
git add index.html style.css script.js   # 실제 바뀐 파일만
git commit -m "..."
git push origin main
```

## 3. 배포 반영 확인 (사용자에게 "됐다"고 말하기 전에 필수)
GitHub Pages 캐시 때문에 푸시 직후 바로 반영 안 될 수 있음. curl로 실제
배포된 내용에 새 코드가 들어갔는지 확인:
```
until curl -s https://sole-korea.github.io/sungsimdang/script.js | grep -q "<이번에_추가한_고유_문자열>"; do sleep 5; done
```
(Monitor 도구로 백그라운드 polling 하면 편함 — 세션에서 계속 이 패턴 사용함)

## 4. 사용자에게 안내
배포 URL: **https://sole-korea.github.io/sungsimdang/**
폰/브라우저에서 확인할 때도 하드 리프레시(Cmd+Shift+R) 언급할 것 — 매번
캐시 때문에 헷갈려했음.
