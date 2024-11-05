import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../components/Header";
import VehicleList from '../components/VehicleList';
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";



const ListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);  // 처음에 보여줄 차량 개수 (30개)
  const [searchResults, setSearchResults] = useState([]);  // 검색 결과 상태
  const [searchQuery, setSearchQuery] = useState('');      // 검색어 상태


  useEffect(() => {
    // 서버에서 차량 데이터를 가져오는 함수
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/encavehicles');  // 백엔드 API에 요청
        setVehicles(response.data);  // 차량 데이터를 상태에 저장
        setSearchResults(response.data); // 초기에는 전체 차량을 검색 결과에 포함
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  
  
  // "더보기" 버튼 클릭 시 호출되는 함수
  const loadMoreVehicles = () => {
    setVisibleCount((prevCount) => prevCount + 30);  // 한 번 클릭할 때 30개씩 더 보여줌
  };


    // 검색 버튼 클릭 시 호출되는 함수
  const handleSearch = () => {
    const filteredVehicles = vehicles.filter((vehicle) =>
      vehicle.이름.includes(searchQuery)
    );
    setSearchResults(filteredVehicles);  // 검색 결과를 업데이트
    setVisibleCount(30);                 // 검색 결과 초기화 시 30개만 표시
  };
  const noResults = searchResults.length === 0 && searchQuery !== '';

  
  return (
    <div className="list-container">
      <Header />
    <div className="sans"> 
      <div className="content">
      <AsideLeft/>
        <div className="container">
          {/* 검색창과 검색 버튼 */}
          <div class="search-container">
            <div className="search-bar">
            <img className="search-icon" src="/icons/search.png" alt="Search Icon" />
              <input
                type="text"
                placeholder="차량 이름을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>

          {/* 검색 결과가 없는 경우 메시지 표시 */}
          {noResults ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <>
              {/* 검색 결과가 있을 때 해당 결과만 표시, 그렇지 않으면 전체 차량 표시 */}
              <VehicleList vehicles={(searchResults || vehicles).slice(0, visibleCount)} />

              {/* 더보기 버튼 (검색 결과나 전체 차량의 끝에 도달 시 숨김) */}
              {visibleCount < (searchResults || vehicles).length && (
                <button onClick={loadMoreVehicles} className="load-more-btn">더보기</button>
              )}
            </>
          )}
        </div>
        <AsideRight/>
      </div>
      </div> 
      <Footer />
    </div>
  );
};

export default ListPage;
