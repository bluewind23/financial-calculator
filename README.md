# 금융계산기 - 전문 금융 & 부동산 계산 웹사이트

![금융계산기 미리보기](https://via.placeholder.com/1200x600?text=금융계산기+미리보기)

## 📋 프로젝트 소개

**금융계산기**는 복잡한 금융 및 부동산 계산을 쉽고 빠르게 할 수 있는 전문 웹 애플리케이션입니다. 사용자 친화적인 인터페이스와 정확한 계산 로직을 통해 누구나 전문가 수준의 금융 계산을 할 수 있습니다.

### 🎯 주요 기능

- **대출 이자 계산기**: 원리금균등/원금균등 상환방식별 계산
- **부동산 세금 계산기**: 취득세, 등록세, 양도소득세 계산
- **예적금 계산기**: 예금/적금의 만기 수령액 및 세후 이자 계산
- **중개수수료 계산기**: 부동산 매매/임대 수수료 계산

### 🚀 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **디자인**: Framer/Hero UI 스타일의 모던 디자인
- **반응형**: 모바일 최적화된 반응형 웹 디자인
- **호스팅**: GitHub Pages (무료)

## 🛠️ 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/money_Calculator.git
cd money_Calculator
```

### 2. 로컬 서버 실행
```bash
# Python 3 사용 시
python -m http.server 8000

# Python 2 사용 시
python -m SimpleHTTPServer 8000

# Node.js 사용 시 (live-server 설치 필요)
npx live-server
```

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## 📁 프로젝트 구조

```
money_Calculator/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript 로직
├── README.md           # 프로젝트 문서
└── assets/             # 이미지 및 기타 자원
    └── images/
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #0ea5e9 (Sky Blue)
- **Secondary**: #8b5cf6 (Purple)
- **Accent**: #10b981 (Green), #f59e0b (Orange)
- **Neutral**: #1a1a1a ~ #fafafa

### 타이포그래피
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive**: 12px ~ 60px

### 컴포넌트
- 카드 기반 레이아웃
- 그라디언트 배경
- 부드러운 애니메이션
- 접근성 고려된 폼 요소

## 💰 수익화 전략

### 1. Google AdSense
- **고단가 키워드**: 대출, 부동산, 금융 관련
- **광고 배치**: 계산 결과 상/하단, 사이드바
- **예상 수익**: 월 20-200만원 (트래픽에 따라)

### 2. 제휴 마케팅
- 금융상품 비교 서비스 제휴
- 부동산 중개업체 제휴
- 보험 상품 제휴

### 3. 프리미엄 기능
- 상세 분석 리포트
- 엑셀 다운로드
- 계산 히스토리 저장

## 📈 SEO 최적화

### 메타 태그
- 타이틀: "금융계산기 - 대출 이자, 부동산 세금, 예적금 계산의 모든 것"
- 디스크립션: 검색 엔진 최적화된 설명
- 키워드: 대출 이자 계산기, 부동산 세금 계산기 등

### 구조화된 데이터
- JSON-LD 마크업
- 계산기 정보 구조화
- 빵부스러기 내비게이션

### 페이지 성능
- Lighthouse 점수 95+ 목표
- 이미지 최적화
- CSS/JS 압축

## 🧪 테스트

### 계산 로직 테스트
```javascript
// 대출 계산 테스트 예시
const loan = new LoanCalculator();
const result = loan.calculateEqualPayment(300000000, 3.5, 30);
console.log('월 상환액:', result.monthlyPayment);
```

### 브라우저 호환성
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 모바일 최적화

- 터치 친화적 인터페이스
- 스와이프 제스처 지원
- 모바일 우선 반응형 디자인
- iOS/Android 네이티브 느낌의 UI

## 🚀 배포

### GitHub Pages
1. GitHub 저장소 생성
2. Settings → Pages에서 배포 설정
3. 자동 배포 완료

### 커스텀 도메인 (선택사항)
```bash
# CNAME 파일 생성
echo "your-domain.com" > CNAME
```

## 📊 분석 및 모니터링

### Google Analytics
- 사용자 행동 분석
- 계산기별 사용률
- 수익 추적

### 성능 모니터링
- Core Web Vitals
- 페이지 로드 속도
- 에러 트래킹

## 🤝 기여 방법

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **개발자**: [Your Name]
- **이메일**: your.email@example.com
- **웹사이트**: [https://your-domain.com](https://your-domain.com)

## 🙏 감사의 말

- [Inter Font](https://fonts.google.com/specimen/Inter) - Google Fonts
- [Font Awesome](https://fontawesome.com/) - 아이콘
- [Framer](https://www.framer.com/) - 디자인 영감

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!