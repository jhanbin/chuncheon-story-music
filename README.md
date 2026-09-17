# 🌲 춘천 문학 팝업스토어 (Chuncheon Lit-Popup Store)

춘천의 서정적인 감성과 문학(김유정 작가의 생가, 소양강, 남이섬, 공지천, 의암호, 삼악산 청평사, 구봉산, 춘천 풍물시장 등), 그리고 AI 오디오(Suno AI)와 실물 인쇄 굿즈(티켓/영수증, QR코드)를 조합한 디지털 감성 팝업스토어 웹 플랫폼입니다.

---

## 🎨 주요 특징 (Features)

1. **감성 큐레이션 (Lit Curator)**
   - 8가지 감성 테마와 춘천 8대 명소(실사 1:1 정방형 뷰), 문학 구절 선택 및 자작시 작성 기능.
2. **AI 음악 & 오디오 생성 (Suno AI Integration)**
   - APIFrame Suno AI API와 연동하여 춘천 문학 감성에 맞는 웰메이드 한국어 음원 자동 생성.
   - 바이닐 LP 플레이어 스타일의 감성 UI (`VinylPlayer.jsx`).
3. **실물 인쇄 굿즈 스튜디오 (Goods Studio & Canvas Print Engine)**
   - 캔버스 기반 오프캔버스 렌더링으로 검은 화면/빈 화면 없는 깨끗한 인쇄 출력.
   - **49mm × 37mm** 미니 라벨/티켓 사이즈 및 **A5** 카드 사이즈 지원.
   - 인쇄 시 QR 코드 기본 OFF (관리자 페이지에서 즉시 단일 클릭 인쇄 지원).
4. **관리자 및 굿즈 이력 관리 (Admin Manager & History)**
   - 생성된 음원 및 굿즈 수집 이력 `localStorage` 보관 및 관리자 페이지(`AdminManager.jsx`) 개별 인쇄 기능.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, html2canvas, qrcode.react
- **Audio API**: Suno AI (via APIFrame)
- **Design System**: Warm beige paper/linen aesthetic (`#f7f4ee`), Gowun Batang (고운바탕) 서체

---

## 🚀 시작하기 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일로 생성하고 API 키를 입력합니다.
```bash
VITE_SUNO_API_KEY=your_apiframe_api_key_here
VITE_MIXING_TIME_SECONDS=8
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

---

## 📂 프로젝트 구조 (Project Directory)

```
chuncheon-lit-popup/
├── public/
│   └── assets/              # 춘천 명소 실사 1:1 정방형 고화질 이미지
├── src/
│   ├── components/          # React 컴포넌트 (LitCurator, GoodsStudio, VinylPlayer, AdminManager 등)
│   ├── data/                # 춘천 명소 데이터, 감성 테마, 문학 구절
│   ├── utils/               # Suno AI 연동 서비스 (sunoService.js)
│   ├── App.jsx              # 메인 애플리케이션
│   └── index.css            # 글로벌 한지/종이 질감 CSS
├── index.html
├── package.json
└── vite.config.js           # API Proxy (CORS 방지) 설정
```
