/**
 * 오늘머니 사용성 테스트 — 응답을 스프레드시트에 한 줄씩 쌓는다.
 *
 * 설정
 *  1. 새 Google 스프레드시트 → 확장 프로그램 → Apps Script → 이 파일 내용을 붙여 넣는다
 *  2. 아래 SECRET을 아무 긴 문자열로 바꾸고, 같은 값을 Vercel의 FORM_SECRET에 넣는다
 *  3. 배포 → 새 배포 → 유형: 웹 앱, 실행 사용자: 나, 액세스 권한: 모든 사용자 → 배포
 *  4. 나온 웹 앱 URL(…/exec)을 Vercel의 SHEET_WEBHOOK_URL에 넣는다
 *
 * 문항을 바꾸면 새 열이 오른쪽에 자동으로 붙는다. 이미 있는 열은 건드리지 않는다.
 */

var SECRET = 'CHANGE_ME';
var SHEET_NAME = '응답';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // 두 사람이 동시에 제출해도 줄이 겹치지 않게
  try {
    var data = JSON.parse(e.postData.contents);
    if (SECRET && data.secret !== SECRET) return reply({ ok: false, error: 'unauthorized' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    var meta = [
      { label: '제출 시각', value: toKst(data.submitted_at) },
      { label: '시작 시각', value: toKst(data.started_at) },
      { label: '소요(분)', value: minutes(data.started_at, data.submitted_at) }
    ];
    var cols = meta.concat(data.fields || []).concat([{ label: '기기', value: data.user_agent || '' }]);

    var headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    cols.forEach(function (c) {
      if (headers.indexOf(c.label) === -1) headers.push(c.label);
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    var row = headers.map(function (h) {
      for (var i = 0; i < cols.length; i++) if (cols[i].label === h) return cols[i].value;
      return '';
    });
    sheet.appendRow(row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function toKst(iso) {
  if (!iso) return '';
  return Utilities.formatDate(new Date(iso), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
}

function minutes(a, b) {
  if (!a || !b) return '';
  return Math.round((new Date(b) - new Date(a)) / 60000);
}
