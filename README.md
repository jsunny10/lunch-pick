# 🍽️ Lunch Pick - 점심 메뉴 추천 서비스

> "오늘 뭐 먹지?" 고민 끝! 스마트 맞춤 식당 추천

## ✨ 주요 기능

### 📱 모바일 최적화
- 반응형 디자인 (데스크탑 / 태블릿 / 모바일)
- 직관적인 터치 UI
- 빠른 로딩 속도

### 🎯 스마트 필터링
- **인원 선택**: 1~10명
- **위치 기반**: 현재 위치 자동 감지 / 주소 직접 입력
- **이동 거리**: 도보 500m, 1km / 차량 3km, 5km
- **음식 종류**: 한식, 양식, 일식, 중식, 아시아 (다중 선택)
- **예산 설정**: 인당 / 전체 총액
- **별점 필터**: 3.0+ / 4.0+ / 4.5+
- **다이어트 모드**: 저칼로리 메뉴 우선 추천

### 🗺️ 카카오맵 연동
- 실시간 주변 식당 검색
- 지도에 위치 표시
- 거리 / 전화번호 / 주소 정보

### 🎲 랜덤 추천
- 조건에 맞는 식당 중 랜덤 선택
- 선택 장애 해결!

## 🚀 사용 방법

### 1. 카카오 API 키 발급

1. [Kakao Developers](https://developers.kakao.com) 접속
2. "내 애플리케이션" > "애플리케이션 추가하기"
3. **JavaScript 키** 복사

### 2. API 키 설정

`index.html` 파일 91번째 줄:
```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=여기에_키_입력&libraries=services"></script>
```

`script.js` 파일 8번째 줄:
```javascript
const KAKAO_API_KEY = '여기에_키_입력';
```

### 3. 플랫폼 등록

Kakao Developers 콘솔 > 플랫폼 > Web 플랫폼 등록:
- `https://jsunny10.github.io`

### 4. GitHub Pages 활성화

Repository Settings > Pages > Source: `main` / `/ (root)`

## 🎨 디자인

- 산뜻한 그라데이션 배경
- 식욕을 돋우는 컬러
- 부드러운 애니메이션
- 이모지 아이콘

## 🛠️ 기술

- HTML5 / CSS3 / JavaScript ES6+
- Kakao Map API
- Geolocation API
- Responsive Design

## 📄 라이선스

MIT License
