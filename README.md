# 오늘머니 사용성 테스트 — 참가자 응답 폼

참가자가 폰으로 열어 사전 질문 → 첫인상 → 과업 1~7 → 마무리 질문 → UMUX-Lite 순서로 답하면,
응답이 Google 스프레드시트에 한 줄씩 쌓인다.

```
브라우저 (index.html · app.js · questions.js)
   ↓ POST /api/submit
Vercel 함수 (api/submit.js)  ← SHEET_WEBHOOK_URL · FORM_SECRET
   ↓
Google Apps Script 웹 앱 (apps-script/Code.gs)
   ↓
스프레드시트 '응답' 시트
```

## 문항 바꾸기

`questions.js`만 고친다. 테스트할 서비스 주소는 맨 위 `SERVICE_URL`.
시트는 `label`을 열 제목으로 쓰고, 새 문항은 오른쪽에 새 열로 붙는다.

- 과업 화면은 과업 설명 → 오늘머니 카드 → 질문 순으로 바로 보인다. 단계에 `gate: true`를 주면 "과업을 마쳤어요"를 눌러야 질문이 열린다
- 과업에 `optional: true`를 주면 진행자가 건너뛸 수 있고, "(건너뜀)"으로 기록된다
- 쓰던 답은 브라우저에 임시 저장돼서 새로고침해도 남고, 제출하면 지워진다

## 배포

### 1. 스프레드시트 연결

1. 새 Google 스프레드시트 → 확장 프로그램 → Apps Script
2. `apps-script/Code.gs` 내용을 붙여 넣고, `SECRET`을 아무 긴 문자열로 바꾼다
3. 배포 → 새 배포 → 유형 **웹 앱**, 실행 사용자 **나**, 액세스 권한 **모든 사용자** → 배포
4. 나온 URL(`…/exec`)을 복사해 둔다

### 2. Vercel

1. 이 폴더를 새 GitHub 저장소로 올린다
2. Vercel → Add New → Project → 저장소 Import (프레임워크: Other, 빌드 설정은 비워 둔다)
3. Settings → Environment Variables

   | 이름 | 값 |
   | --- | --- |
   | `SHEET_WEBHOOK_URL` | 1-4에서 복사한 URL |
   | `FORM_SECRET` | 1-2의 `SECRET`과 같은 값 |

4. 환경 변수를 넣은 뒤 Redeploy 한다

배포 주소에서 테스트 응답을 하나 보내 시트에 줄이 생기는지 확인하고, 그 줄은 지운다.

## 로컬에서 보기

```bash
node dev-server.mjs
```

http://127.0.0.1:4174 — `SHEET_WEBHOOK_URL` 없이 띄우면 시트로 보내지 않고 응답을 터미널에 찍는다.
실제 시트까지 확인하려면 두 환경 변수를 앞에 붙여 실행한다.

## 알아둘 것

- **Apps Script 코드를 고치면 새 버전으로 다시 배포해야 반영된다.** 배포 → 배포 관리 → 수정 → 버전: 새 버전.
  URL은 그대로 유지된다.
- 링크를 아는 사람은 누구나 제출할 수 있다. 검색에 걸리지 않게 `noindex`만 걸어 두었으니, 테스트가 끝나면 Vercel 프로젝트를 내리거나 Apps Script 배포를 보관 처리한다.
