// 참가자 응답을 받아 Google Apps Script 웹 앱으로 넘긴다 → 스프레드시트에 한 줄 추가.
// 브라우저가 Apps Script 주소로 바로 보내지 않고 여기를 거치는 이유:
//  - 주소와 비밀값(FORM_SECRET)이 페이지 소스에 드러나지 않는다
//  - Apps Script는 CORS 응답을 못 줘서 브라우저에서는 성공 여부를 읽을 수 없다
//
// Vercel 환경 변수
//   SHEET_WEBHOOK_URL  Apps Script 웹 앱 배포 URL (…/exec)
//   FORM_SECRET        Apps Script의 SECRET과 같은 값

const MAX_BYTES = 100 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return res.status(500).json({ ok: false, error: 'SHEET_WEBHOOK_URL이 설정되지 않았어요' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body || !Array.isArray(body.fields) || !String(body.participant || '').trim()) {
    return res.status(400).json({ ok: false, error: '응답 형식이 올바르지 않아요' });
  }
  const json = JSON.stringify({ ...body, secret: process.env.FORM_SECRET || '' });
  if (Buffer.byteLength(json) > MAX_BYTES) {
    return res.status(413).json({ ok: false, error: '응답이 너무 길어요' });
  }

  try {
    // Apps Script는 302로 결과 페이지에 보낸다. fetch가 따라가며 GET으로 바꾸는데,
    // 스크립트는 이미 실행된 뒤라 결과만 읽으면 된다.
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: json,
      redirect: 'follow'
    });
    const text = await r.text();
    const result = safeParse(text);
    if (!r.ok || !result || !result.ok) {
      console.error('sheet error', r.status, text.slice(0, 300));
      return res.status(502).json({ ok: false, error: '시트에 저장하지 못했어요' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('sheet fetch failed', e);
    return res.status(502).json({ ok: false, error: '시트에 연결하지 못했어요' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return null; }
}
