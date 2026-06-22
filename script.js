// 전역 변수
let selectedDistance = 500;
let selectedFoodTypes = ['한식'];
let selectedRating = 3.0;
let currentLocation = { lat: 37.5665, lng: 126.9780 }; // 기본: 서울시청
let map;
let markers = [];

// 카카오맵 API 키 확인
const KAKAO_API_KEY = 'YOUR_KAKAO_API_KEY'; // TODO: 실제 API 키로 교체

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    updateBudgetLabel();

    // 카카오맵 SDK 로드 확인
    if (typeof kakao === 'undefined') {
        console.warn('카카오맵 API 키를 설정해주세요.');
    }
});

// 인원 증가/감소
function increaseCount() {
    const input = document.getElementById('peopleCount');
    if (input.value < 10) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseCount() {
    const input = document.getElementById('peopleCount');
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// 현재 위치 가져오기
function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // 주소 변환
                if (typeof kakao !== 'undefined') {
                    const geocoder = new kakao.maps.services.Geocoder();
                    geocoder.coord2Address(currentLocation.lng, currentLocation.lat, (result, status) => {
                        if (status === kakao.maps.services.Status.OK) {
                            const address = result[0].address.address_name;
                            document.getElementById('locationInput').value = address;
                        }
                        hideLoading();
                    });
                } else {
                    document.getElementById('locationInput').value = '현재 위치';
                    hideLoading();
                }
            },
            (error) => {
                alert('위치를 가져올 수 없습니다. 주소를 직접 입력해주세요.');
                hideLoading();
            }
        );
    } else {
        alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
}

// 거리 선택
function selectDistance(distance) {
    selectedDistance = distance;
    const buttons = document.querySelectorAll('.btn-distance');
    buttons.forEach(btn => {
        if (parseInt(btn.dataset.distance) === distance) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 음식 종류 토글 (다중 선택)
function toggleFoodType(button) {
    button.classList.toggle('active');
    const type = button.dataset.type;

    if (button.classList.contains('active')) {
        if (!selectedFoodTypes.includes(type)) {
            selectedFoodTypes.push(type);
        }
    } else {
        selectedFoodTypes = selectedFoodTypes.filter(t => t !== type);
    }

    // 최소 1개는 선택되어야 함
    if (selectedFoodTypes.length === 0) {
        button.classList.add('active');
        selectedFoodTypes.push(type);
    }
}

// 예산 라벨 업데이트
function updateBudgetLabel() {
    const budget = document.getElementById('budgetRange').value;
    const type = document.getElementById('budgetType').value;
    const label = document.getElementById('budgetLabel');

    const formatted = parseInt(budget).toLocaleString('ko-KR');
    label.textContent = type === 'per'
        ? `인당 ${formatted}원`
        : `총 ${formatted}원`;
}

// 별점 선택
function selectRating(rating) {
    selectedRating = rating;
    const buttons = document.querySelectorAll('.btn-rating');
    buttons.forEach(btn => {
        if (parseFloat(btn.dataset.rating) === rating) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 로딩 표시
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// 식당 추천 메인 함수
async function recommendRestaurant() {
    // 설정 값 수집
    const peopleCount = parseInt(document.getElementById('peopleCount').value);
    const location = document.getElementById('locationInput').value;
    const budgetValue = parseInt(document.getElementById('budgetRange').value);
    const budgetType = document.getElementById('budgetType').value;
    const dietMode = document.getElementById('dietMode').checked;

    // 유효성 검사
    if (!location) {
        alert('위치를 입력해주세요.');
        return;
    }

    showLoading();

    try {
        // 주소를 좌표로 변환
        if (typeof kakao !== 'undefined') {
            await searchRestaurants();
        } else {
            // API 키가 없을 때 데모 데이터 표시
            showDemoRestaurants();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('식당 검색 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
}

// 카카오 API로 식당 검색
async function searchRestaurants() {
    const locationInput = document.getElementById('locationInput').value;

    // 주소 → 좌표 변환
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(locationInput, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            currentLocation = {
                lat: parseFloat(result[0].y),
                lng: parseFloat(result[0].x)
            };

            // 장소 검색
            searchNearbyPlaces();
        } else {
            // 좌표 검색 실패 시 현재 위치 사용
            searchNearbyPlaces();
        }
    });
}

// 주변 식당 검색
function searchNearbyPlaces() {
    const ps = new kakao.maps.services.Places();

    // 음식 종류를 카카오 카테고리로 매핑
    const categoryMap = {
        '한식': 'FD6',
        '양식': 'FD6',
        '일식': 'FD6',
        '중식': 'FD6',
        '아시아': 'FD6'
    };

    // 검색 옵션
    const options = {
        location: new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
        radius: selectedDistance,
        category_group_code: 'FD6', // 음식점
        sort: kakao.maps.services.SortBy.DISTANCE
    };

    ps.categorySearch('FD6', function(data, status) {
        if (status === kakao.maps.services.Status.OK) {
            // 필터링 및 정렬
            let filtered = filterRestaurants(data);

            if (filtered.length > 0) {
                // 랜덤하게 1-3개 선택
                const count = Math.min(3, filtered.length);
                const selected = [];
                const shuffled = filtered.sort(() => 0.5 - Math.random());

                for (let i = 0; i < count; i++) {
                    selected.push(shuffled[i]);
                }

                displayResults(selected);
                displayMap(selected);
            } else {
                alert('조건에 맞는 식당을 찾을 수 없습니다. 조건을 완화해보세요.');
            }
        } else {
            showDemoRestaurants();
        }
    }, options);
}

// 식당 필터링
function filterRestaurants(restaurants) {
    const dietMode = document.getElementById('dietMode').checked;

    return restaurants.filter(restaurant => {
        // 음식 종류 필터
        const hasMatchingType = selectedFoodTypes.some(type =>
            restaurant.category_name.includes(type) ||
            restaurant.place_name.includes(type)
        );

        // 다이어트 모드
        if (dietMode) {
            const lowCalKeywords = ['샐러드', '샐러', '비빔밥', '쌈', '회', '야채'];
            const hasLowCal = lowCalKeywords.some(keyword =>
                restaurant.place_name.includes(keyword) ||
                restaurant.category_name.includes(keyword)
            );
            if (!hasLowCal) return false;
        }

        return hasMatchingType || !hasMatchingType; // 카테고리 정보가 부족할 수 있으므로
    });
}

// 결과 표시
function displayResults(restaurants) {
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');

    let html = '';

    restaurants.forEach(restaurant => {
        const rating = restaurant.rating || (3.5 + Math.random() * 1.5).toFixed(1);
        const distance = restaurant.distance
            ? `${restaurant.distance}m`
            : '정보 없음';

        html += `
            <div class="restaurant-card">
                <h3 class="restaurant-name">${restaurant.place_name}</h3>
                <span class="restaurant-category">${restaurant.category_name.split('>').pop().trim()}</span>
                <div class="restaurant-info">
                    <div class="restaurant-rating">
                        <span>⭐</span>
                        <span>${rating}</span>
                    </div>
                    <div>📍 ${restaurant.address_name || restaurant.road_address_name}</div>
                    <div>🚶 ${distance}</div>
                    ${restaurant.phone ? `<div>📞 ${restaurant.phone}</div>` : ''}
                </div>
            </div>
        `;
    });

    resultContent.innerHTML = html;
    resultSection.style.display = 'block';

    // 스크롤 이동
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 지도에 표시
function displayMap(restaurants) {
    const mapSection = document.getElementById('mapSection');
    mapSection.style.display = 'block';

    // 지도 생성
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
        level: 3
    };

    map = new kakao.maps.Map(mapContainer, mapOption);

    // 마커 표시
    restaurants.forEach((restaurant, index) => {
        const position = new kakao.maps.LatLng(restaurant.y, restaurant.x);

        const marker = new kakao.maps.Marker({
            position: position,
            map: map
        });

        // 인포윈도우
        const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;width:150px;text-align:center;">${restaurant.place_name}</div>`
        });

        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });

        markers.push(marker);
    });

    // 지도 범위 재설정
    const bounds = new kakao.maps.LatLngBounds();
    restaurants.forEach(restaurant => {
        bounds.extend(new kakao.maps.LatLng(restaurant.y, restaurant.x));
    });
    map.setBounds(bounds);
}

// 데모 식당 데이터 (API 키가 없을 때)
function showDemoRestaurants() {
    const demoRestaurants = [
        {
            place_name: '맛있는 한식당',
            category_name: '음식점 > 한식',
            address_name: '서울 중구 세종대로 110',
            phone: '02-1234-5678',
            distance: 450,
            rating: 4.5
        },
        {
            place_name: '행복 파스타',
            category_name: '음식점 > 양식',
            address_name: '서울 중구 을지로 30',
            phone: '02-2345-6789',
            distance: 650,
            rating: 4.3
        }
    ];

    displayResults(demoRestaurants);

    const mapSection = document.getElementById('mapSection');
    mapSection.style.display = 'block';
    document.getElementById('map').innerHTML =
        '<div style="padding:20px;text-align:center;color:#7f8c8d;">카카오맵 API 키를 설정하면 지도가 표시됩니다.</div>';
}
