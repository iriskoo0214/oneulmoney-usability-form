// 참가자가 직접 답하는 문항. 오늘머니_사용성테스트_질문지.md에서 진행자용 관찰 항목을 뺀 것.
// key는 스프레드시트 열 순서를 정하고, label이 열 제목이 된다. 문항을 바꾸면 여기만 고친다.
//
// type: text(한 줄) · long(여러 줄) · choice(하나 고르기) · scale(점수)
// gate: true를 주면 "과업을 마쳤어요"를 눌러야 질문이 열린다 (지금은 쓰지 않음 — 질문이 바로 보인다).

// 참가자가 테스트할 서비스. 시작·첫인상 화면의 카드와 과업 화면에 링크로 보인다.
window.SERVICE_URL = 'https://oneulmoney.vercel.app';

window.STEPS = [
  {
    id: 'start',
    title: '시작하기',
    desc: '오늘머니 사용성 테스트에 참여해 주셔서 감사해요. 정답은 없고, 느낀 그대로 적어 주시면 돼요. 응답은 서비스 개선에만 쓰여요.',
    fields: [
      { key: 'participant', label: '닉네임', type: 'text', required: true, placeholder: '응답을 구분할 이름이면 돼요 (예: 오늘머니)' }
    ]
  },
  {
    id: 'pre',
    title: '사전 질문',
    desc: '평소 투자 습관에 대해 알려 주세요.',
    fields: [
      { key: 'pre_1', label: '보유 종목과 국내/해외 비중', type: 'long', placeholder: '예: 국내 3종목, 미국 2종목 — 국내 비중이 더 커요' },
      { key: 'pre_2', label: '평일 장중 시세 확인 빈도', type: 'choice', required: true,
        options: ['거의 안 봐요', '하루 1~2번', '하루 3~5번', '수시로 봐요'] },
      { key: 'pre_3', label: '장을 못 본 날 내 종목을 확인하는 방법', type: 'long', placeholder: '쓰는 앱과 확인 순서를 적어 주세요' },
      { key: 'pre_4', label: '그 과정에서 가장 번거롭거나 아쉬운 점', type: 'long' },
      { key: 'pre_5', label: '주가가 크게 움직였을 때 이유를 찾아보는지, 어디서 찾는지', type: 'long' }
    ]
  },
  {
    id: 'first',
    title: '첫인상',
    desc: '아래 카드로 오늘머니를 열어 둘러본 뒤, 진행자가 화면을 가리면 위의 두 문항을 적어 주세요. 마지막 문항은 화면을 다시 본 뒤에 적어 주세요.',
    fields: [
      { key: 'fi_1', label: '방금 본 화면은 어떤 서비스 같았나요?', type: 'long', required: true },
      { key: 'fi_2', label: '기억나는 내용이나 단어', type: 'long' },
      { key: 'fi_5', label: '맨 위 날짜와 "미국 데일리 브리핑"을 보면, 언제 장에 대한 이야기 같나요?', type: 'text' }
    ]
  },
  {
    id: 't1', task: 1,
    title: '시장 전체 파악',
    scenario: '미국 증시가 전체적으로 어땠는지 한두 문장으로 말해 주세요.',
    fields: [
      { key: 't1_seq', label: '과업 1 난이도', type: 'scale', seq: true, required: true },
      { key: 't1_q1', label: '3줄 요약만으로 충분했나요? 더 알고 싶은 것은?', type: 'long' },
      { key: 't1_q2', label: '낯선 단어가 있었다면 적어 주세요', type: 'text' }
    ]
  },
  {
    id: 't2', task: 2,
    title: '한국 시장으로 전환',
    scenario: '이번엔 한국 증시 브리핑을 보고 싶어요. 어떻게 하시겠어요?',
    fields: [
      { key: 't2_seq', label: '과업 2 난이도', type: 'scale', seq: true, required: true },
      { key: 't2_q1', label: '⇆ 버튼과 국기 아이콘은 무엇을 뜻한다고 생각했나요?', type: 'long' },
      { key: 't2_q2', label: '방금 본 한국 브리핑은 며칠 장 이야기였나요?', type: 'text' }
    ]
  },
  {
    id: 't3', task: 3,
    title: '특정 종목 브리핑 찾기',
    scenario: '보유 종목 중 엔비디아 소식만 골라서 보고 싶어요.',
    fields: [
      { key: 't3_seq', label: '과업 3 난이도', type: 'scale', seq: true, required: true },
      { key: 't3_q1', label: '카드를 읽고, 오늘 이 종목에 무슨 일이 있었는지 적어 주세요', type: 'long' }
    ]
  },
  {
    id: 't4', task: 4,
    title: '읽은 카드 확인 처리',
    scenario: "방금 읽은 카드는 '다 봤다'고 표시해 두고 싶어요.",
    fields: [
      { key: 't4_seq', label: '과업 4 난이도', type: 'scale', seq: true, required: true },
      { key: 't4_q1', label: '"밀어서 확인"은 무엇을 확인한다는 뜻으로 읽혔나요?', type: 'text' },
      { key: 't4_q3', label: '이 기능을 매일 쓸 것 같나요? 이유는요?', type: 'long' }
    ]
  },
  {
    id: 't5', task: 5,
    title: '하루 흐름 복기',
    scenario: 'SK하이닉스가 오늘 장중에 어떻게 움직였는지, 그리고 그 이유가 무엇이었는지 알고 싶어요.',
    fields: [
      { key: 't5_seq', label: '과업 5 난이도', type: 'scale', seq: true, required: true },
      { key: 't5_q1', label: '날짜 양옆 화살표를 누르면 무엇이 바뀔 거라고 예상했나요? 실제로는 무엇이 바뀌었나요?', type: 'long' },
      { key: 't5_q2', label: '시간대별 브리핑이 주가가 "왜" 움직였는지까지 설명해 줬나요?', type: 'choice', required: true,
        options: ['충분히 설명해 줬어요', '조금 부족했어요', '거의 설명하지 않았어요', '잘 모르겠어요'] },
      { key: 't5_q3', label: '부족했다면 무엇이 더 있어야 할까요?', type: 'long' },
      { key: 't5_q4', label: '가격 뒤의 파란 띠는 무엇을 뜻한다고 생각하나요?', type: 'choice', inline: true,
        options: ['상승', '하락'] },
      { key: 't5_q5', label: '평소 쓰는 증권 앱과 비교하면 어느 쪽이 더 편한가요? 이유는요?', type: 'long' }
    ]
  },
  {
    id: 't6', task: 6,
    title: '다른 종목으로 이동',
    scenario: '같은 화면에서 삼성전자의 오늘 흐름도 보고 싶어요.',
    fields: [
      { key: 't6_seq', label: '과업 6 난이도', type: 'scale', seq: true, required: true },
      { key: 't6_q1', label: '화면에 화살표가 두 개 있는데, 각각 무엇을 한다고 생각하나요?', type: 'long' }
    ]
  },
  {
    id: 't7', task: 7,
    title: '홈과 Portfolios 비교',
    scenario: 'SK하이닉스에 대해 Home 카드와 Portfolios 화면을 각각 봤는데, 두 화면은 어떻게 다른가요?',
    fields: [
      { key: 't7_seq', label: '과업 7 난이도', type: 'scale', seq: true, required: true },
      { key: 't7_q1', label: '두 화면은 어떻게 다른가요? 각각 언제 열어 볼 것 같나요?', type: 'long' }
    ]
  },
  {
    id: 'post',
    title: '마무리 질문',
    desc: '전체를 써 본 소감을 알려 주세요.',
    fields: [
      { key: 'post_1', label: '이 서비스를 한 문장으로 친구에게 소개한다면?', type: 'long', required: true },
      { key: 'post_2', label: '가장 유용했던 화면과 필요 없다고 느낀 것', type: 'long' },
      { key: 'post_3', label: '지금 쓰는 방법과 비교해 나아진 점과 아쉬운 점', type: 'long' },
      { key: 'post_4', label: '"어, 이게 뭐지?" 하고 멈칫했던 순간', type: 'long' },
      { key: 'post_5', label: '홈과 Portfolios 화면의 역할이 구분됐나요?', type: 'choice',
        options: ['잘 구분됐어요', '대체로 구분됐어요', '헷갈렸어요'] },
      { key: 'post_6', label: 'AI가 요약한 내용을 얼마나 믿을 수 있었나요? 믿음을 높이려면 무엇이 필요할까요?', type: 'long' },
      { key: 'post_7', label: '알림 시간(미국 아침 7시, 국내 저녁 6시)은 적절한가요?', type: 'choice',
        options: ['적절해요', '바꾸고 싶어요'] },
      { key: 'post_7b', label: '바꾸고 싶다면 언제 받고 싶나요?', type: 'text' },
      { key: 'post_8', label: '내일도 알림이 오면 열어 볼 것 같나요?', type: 'scale', min: 1, max: 5,
        minLabel: '전혀 아니다', maxLabel: '매우 그렇다', required: true },
      { key: 'post_8b', label: '그렇게 답한 이유', type: 'long' },
      { key: 'post_9', label: '하나만 바꿀 수 있다면 무엇을 바꾸고 싶나요?', type: 'long' }
    ]
  },
  {
    id: 'umux',
    title: '마지막 평가',
    desc: '두 문장에 얼마나 동의하는지 골라 주세요.',
    fields: [
      { key: 'umux_1', label: '오늘머니는 내가 필요로 하는 것(장을 못 본 날 하루를 파악하기)을 충족한다', type: 'scale',
        min: 1, max: 7, minLabel: '전혀 그렇지 않다', maxLabel: '매우 그렇다', required: true },
      { key: 'umux_2', label: '오늘머니는 사용하기 쉽다', type: 'scale',
        min: 1, max: 7, minLabel: '전혀 그렇지 않다', maxLabel: '매우 그렇다', required: true }
    ]
  }
];
