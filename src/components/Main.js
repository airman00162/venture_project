import React, { useEffect, useState, useRef, useCallback } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 카테고리 데이터 정의 (브랜드별로 분류)
const categories = {
  한국: ["현대", "기아", "제네시스", "쉐보레", "GMC", "KG모빌리티", "르노코리아", "스마트 EV", "대창모터스", "디피코", "쎄보모빌리티", "제이스모빌리티", "EVKMC", "마이브", "모빌리티네트웍스"],
  유럽: ["벤츠", "BMW", "아우디", "폭스바겐", "미니", "볼보", "폴스타", "재규어", "랜드로버", "포르쉐", "페라리", "람보르기니", "마세라티", "맥라렌", "애스턴마틴", "푸조", "시트로엥", "DS", "벤틀리", "롤스로이스"],
  일본: ["토요타", "렉서스", "혼다", "마쓰다", "닛산"],
  미국: ["포드", "링컨", "지프", "캐딜락", "테슬라"],
};

// 차종 데이터 정의
const vehicleTypes = ["경형", "소형", "준중형", "중형", "준대형", "대형", "스포츠카", "경형 SUV", "소형 SUV", "준중형 SUV", "중형 SUV", "대형 SUV", "RV/MPV", "승합", "화물"];

// 엔진 타입 데이터 정의
const engineTypes = ["가솔린", "디젤", "하이브리드", "전기", "LPG"];

// 연비 필터를 위한 범위 정의
const fuelEfficiencyRanges = [
  { label: "4 이하", min: 0, max: 4 },
  { label: "4 ~ 7", min: 4, max: 7 },
  { label: "7 ~ 11", min: 7, max: 11 },
  { label: "11 ~ 15", min: 11, max: 15 },
  { label: "15 이상", min: 15, max: 100 },
];

// 출력 필터를 위한 범위 정의
const powerRanges = [
  { label: "100 이하", min: 0, max: 100 },
  { label: "100 ~ 200", min: 100, max: 200 },
  { label: "200 ~ 300", min: 200, max: 300 },
  { label: "300 ~ 400", min: 300, max: 400 },
  { label: "400 이상", min: 400, max: 2000 },
];

// 배열을 일정 크기로 나누는 헬퍼 함수
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

// 메인 컴포넌트
function Main() {
  /* 메인 컴포넌트 필터와 정렬에 쓰이는 상태변수 모음 집 = 다른 컴포넌트에서 안쓰이는데 굳이 redux 쓸필요가 있을까?*/
  const [vehicles, setVehicles] = useState([]); // 차량 목록 상태
  const [page, setPage] = useState(1); // 현재 페이지 상태
  const [hasMore, setHasMore] = useState(true); // 추가 데이터 존재 여부 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const observer = useRef(); // IntersectionObserver를 위한 ref
  const [sortOption, setSortOption] = useState("브랜드순"); // 정렬 옵션 상태

  // 필터 상태들 정의
  const [selectedBrands, setSelectedBrands] = useState([]); // 선택된 브랜드
  const [selectedTypes, setSelectedTypes] = useState([]); // 선택된 차종
  const [selectedEngines, setSelectedEngines] = useState([]); // 선택된 엔진 타입
  const [selectedFuelEfficiencies, setSelectedFuelEfficiencies] = useState([]); // 선택된 연비 타입
  const [selectedPowers, setSelectedPowers] = useState([]); // 선택된 출력 범위
  const [minPrice, setMinPrice] = useState(""); // 최소 가격
  const [maxPrice, setMaxPrice] = useState(""); // 최대 가격
  const [searchTerm, setSearchTerm] = useState(""); // 이름 검색어
  const [tempMinPrice, setTempMinPrice] = useState(""); // 임시 최소 가격 (사용자 입력)
  const [tempMaxPrice, setTempMaxPrice] = useState(""); // 임시 최대 가격 (사용자 입력)
  const [tempSearchTerm, setTempSearchTerm] = useState(""); // 임시 이름 검색어 (사용자 입력)
  const [isTypeExpanded, setIsTypeExpanded] = useState(false); // 차종 필터 확장 여부
  const [wishlist, setWishlist] = useState([]);
  const [user] = useAuthState(auth);

  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 사용

  // 모든 필터 리셋
  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedTypes([]);
    setSelectedEngines([]);
    setSelectedFuelEfficiencies([]);
    setSelectedPowers([]);
    setTempMinPrice("");
    setTempMaxPrice("");
    setTempSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSearchTerm("");
    setPage(1); // 페이지 초기화
    setVehicles([]); // 기존 차량 데이터 초기화
  };

  // 차량 데이터를 서버에서 가져오는 함수
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      // 선택된 연비와 출력을 URL 파라미터로 변환
      const selectedFuelEfficienciesQuery = selectedFuelEfficiencies.map((range) => `${range.min}-${range.max}`).join(",");

      const selectedPowersQuery = selectedPowers.map((range) => `${range.min}-${range.max}`).join(",");

      // URL 파라미터로 필터와 정렬, 페이지 정보를 서버로 전송
      const query = new URLSearchParams({
        brand: selectedBrands.join(","),
        type: selectedTypes.join(","),
        engine: selectedEngines.join(","),
        minPrice,
        maxPrice,
        fuelEfficiency: selectedFuelEfficienciesQuery,
        power: selectedPowersQuery,
        searchTerm,
        page,
        sortOption,
      }).toString();

      const response = await axios.get(`https://us-central1-findingcar.cloudfunctions.net/myApi/api/vehicles?${query}`);
      setVehicles((prevVehicles) => [...prevVehicles, ...response.data]);
      setHasMore(response.data.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  }, [page, selectedBrands, selectedTypes, selectedEngines, minPrice, maxPrice, searchTerm, selectedFuelEfficiencies, selectedPowers, sortOption]);

  // 무한 스크롤을 위한 IntersectionObserver 설정
  const lastVehicleElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1); // 페이지 증가
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loading]
  );

  // 필터나 정렬 옵션이 변경될 때 데이터를 다시 요청
  useEffect(() => {
    fetchVehicles();
  }, [page, selectedBrands, selectedTypes, selectedEngines, minPrice, maxPrice, searchTerm, selectedFuelEfficiencies, selectedPowers, sortOption, fetchVehicles]);

  // 필터 항목 선택/해제 (토글)
  const toggleSelection = (item, setSelectedFunction) => {
    setSelectedFunction((prevSelected) => (prevSelected.includes(item) ? prevSelected.filter((selectedItem) => selectedItem !== item) : [...prevSelected, item]));
    setPage(1); // 페이지 리셋
    setVehicles([]); // 기존 차량 데이터 초기화
  };

  // 검색어 적용 함수
  const handleSearch = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setSearchTerm(tempSearchTerm);
    setPage(1); // 페이지 초기화
    setVehicles([]); // 기존 차량 데이터 초기화
  };

  // 차종 필터 확장/축소 토글 함수
  const toggleTypeExpansion = () => {
    setIsTypeExpanded(!isTypeExpanded);
  };

  // 정렬 옵션 변경 함수
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1); // 페이지 초기화
    setVehicles([]); // 기존 차량 데이터 초기화
  };

  // 차량 상세 페이지로 이동하는 함수
  const handleDetailClick = async (vehicle) => {
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        viewedVehicles: arrayUnion(vehicle.차량번호),
      });
    }
    // 차량 상세 페이지로 이동합니다.
    navigate(`/vehicle/${vehicle.차량번호}`);
  };

  // 차량 데이터를 서버에서 가져오는 함수
  const handleAddToWishlist = async (vehicleId) => {
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        wishlist: arrayUnion(vehicleId),
      });
      setWishlist([...wishlist, vehicleId]);
      alert("찜목록에 추가되었습니다.");
    } else {
      alert("로그인이 필요합니다.");
    }
  };

  const handleRemoveFromWishlist = async (vehicleId) => {
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        wishlist: arrayRemove(vehicleId),
      });
      setWishlist(wishlist.filter((id) => id !== vehicleId));
      alert("찜목록에서 제거되었습니다.");
    } else {
      alert("로그인이 필요합니다.");
    }
  };

  return (
    <div className="Main">
      {/* 검색어 입력 섹션 */}
      <div className="filter-section">
        <input type="text" placeholder="차량 이름을 입력하세요" value={tempSearchTerm} onChange={(e) => setTempSearchTerm(e.target.value)} />
        <button onClick={handleSearch}>검색</button>
      </div>
      {/* 브랜드 선택 섹션 */}
      <div className="categories-section">
        <div style={{ display: "flex" }}>
          {Object.entries(categories).map(([region, brands]) => (
            <div key={region} className="category">
              <h3 className="country-name">{region}</h3>
              <div className="country-divider"></div>
              <div className="brand-grid">
                {chunkArray(brands, 5).map((brandChunk, chunkIndex) => (
                  <div key={chunkIndex} className="brand-column">
                    {brandChunk.map((brand) => (
                      <div key={brand} className={`brand-card ${selectedBrands.includes(brand) ? "selected" : ""}`} onClick={() => toggleSelection(brand, setSelectedBrands)}>
                        <img src={`/logoimages/${region}/${brand}.png`} alt={brand} title={brand} className="brand-logo" />
                        <div className="brand-name">{brand}</div>
                        {selectedBrands.includes(brand) && <div className="selected-overlay"></div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 가격 필터 섹션 */}
      <div className="price-filter-section">
        <input type="number" placeholder="최소가격 입력" value={tempMinPrice} onChange={(e) => setTempMinPrice(e.target.value)} />
        ~
        <input type="number" placeholder="최대가격 입력" value={tempMaxPrice} onChange={(e) => setTempMaxPrice(e.target.value)} />
        <button onClick={handleSearch}>검색</button>
      </div>
      {/* 엔진, 연비, 출력, 차종 필터 섹션 */}
      <div className="spec-filter-section">
        <div className="filter-category">
          <div className="filter-label">
            <h4>엔진</h4>
          </div>
          <div className="filter-options">
            {engineTypes.map((engine) => (
              <button key={engine} className={`engine-button ${selectedEngines.includes(engine) ? "selected" : ""}`} onClick={() => toggleSelection(engine, setSelectedEngines)}>
                {engine}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-category">
          <div className="filter-label">
            <h4>연비</h4>
          </div>
          <div className="filter-options">
            {fuelEfficiencyRanges.map((range) => (
              <button key={range.label} className={`fuel-efficiency-button ${selectedFuelEfficiencies.includes(range) ? "selected" : ""}`} onClick={() => toggleSelection(range, setSelectedFuelEfficiencies)}>
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-category">
          <div className="filter-label">
            <h4>출력</h4>
          </div>
          <div className="filter-options">
            {powerRanges.map((range) => (
              <button key={range.label} className={`power-button ${selectedPowers.includes(range) ? "selected" : ""}`} onClick={() => toggleSelection(range, setSelectedPowers)}>
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-category">
          <div className="filter-label">
            <h4>차종</h4>
          </div>
          <div className="filter-options">
            {(isTypeExpanded ? vehicleTypes : vehicleTypes.slice(0, 5)).map((type) => (
              <button key={type} className={`type-button ${selectedTypes.includes(type) ? "selected" : ""}`} onClick={() => toggleSelection(type, setSelectedTypes)}>
                {type}
              </button>
            ))}
            <button className="toggle-expand-button" onClick={toggleTypeExpansion}>
              {isTypeExpanded ? "숨기기" : "더보기"}
            </button>
          </div>
        </div>
      </div>
      {/* 정렬 및 필터 리셋 섹션 */}
      <div className="drop-reset">
        <div className="dropdown-section">
          <select value={sortOption} onChange={handleSortChange} className="dropdown">
            <option value="브랜드순">브랜드순</option>
            <option value="낮은 가격순">낮은 가격순</option>
            <option value="높은 가격순">높은 가격순</option>
            <option value="낮은 연비순">낮은 연비순</option>
            <option value="높은 연비순">높은 연비순</option>
            <option value="낮은 출력순">낮은 출력순</option>
            <option value="높은 출력순">높은 출력순</option>
          </select>
        </div>
        <div className="reset-filter-section">
          <button className="reset-button" onClick={resetFilters}>
            모든 필터 리셋
          </button>
        </div>
      </div>
      {/* 차량 목록 표시 섹션 */}
      <div className="vehicles-section">
        {loading && page === 1 ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          vehicles.map((vehicle, index) => (
            <div key={vehicle.차량번호} ref={vehicles.length === index + 1 ? lastVehicleElementRef : null} className="vehicle-card">
              <img src={`/logoimages/${vehicle.제조국}/${vehicle.브랜드}.png`} alt={vehicle.브랜드} className="brand-logo" />
              <div className="release-date">
                <h3>{vehicle.출시년도}년형</h3>
              </div>
              <img src={`/images/${vehicle.차량번호}.png`} alt={vehicle.이름} />
              <div className="text-card">
                <h2>{vehicle.이름}</h2>
                <div className="info">
                  <div className="info-label">차종:</div>
                  <div className="info-value">{vehicle.차종}</div>
                </div>
                <div className="info">
                  <div className="info-label">엔진:</div>
                  <div className="info-value">{vehicle.엔진}</div>
                </div>
                <div className="info">
                  <div className="info-label">연비:</div>
                  <div className="info-value">
                    {vehicle.최소연비} ~ {vehicle.최대연비}
                  </div>
                </div>
                <div className="info">
                  <div className="info-label">출력:</div>
                  <div className="info-value">
                    {vehicle.최소출력} ~ {vehicle.최대출력}
                  </div>
                </div>
                <div className="info">
                  <div className="info-label">가격:</div>
                  <div className="info-value">
                    {vehicle.최소가격} ~ {vehicle.최대가격}만원
                  </div>
                </div>
                <div className="button-group">
                  <button className="detail-button" onClick={() => handleDetailClick(vehicle)}>
                    상세 보기
                  </button>
                  {wishlist.includes(vehicle.차량번호) ? (
                    <button className="like-button" onClick={() => handleRemoveFromWishlist(vehicle.차량번호)}>
                      찜해제
                    </button>
                  ) : (
                    <button className="like-button" onClick={() => handleAddToWishlist(vehicle.차량번호)}>
                      찜하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Main;
