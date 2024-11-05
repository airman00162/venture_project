import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';  // URL에서 차량번호를 가져옴
import axios from 'axios';

const VehicleInfo = () => {
  // URL에서 차량번호를 가져옴
  const { vehicleId } = useParams();  // URL에서 차량번호를 추출
  console.log(`차량번호: ${vehicleId}`);
  const [vehicle, setVehicle] = useState(null);  // 차량 데이터를 저장할 상태
  const [activeSections, setActiveSections] = useState({ qna: false, issues: false });

  // 차량번호를 기반으로 차량 데이터를 가져오는 useEffect
  useEffect(() => {
    // 차량번호를 사용하여 특정 차량 데이터를 가져오는 함수
    const fetchVehicleData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/encavehicles/${vehicleId}`);
        setVehicle(response.data);  // 데이터를 상태에 저장
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    if (vehicleId) {  // 차량번호가 있을 때만 호출
      fetchVehicleData();
    }
  }, [vehicleId]);

  if (!vehicle) {
    return <div>Loading...</div>;  // 데이터가 로드되지 않았을 때 로딩 메시지
  }


  const renderStars = (rating) => {
    const fullStars = Math.floor(rating); // 평점에서 fullstar 개수
    const halfStars = rating % 1 >= 0.5 ? 1 : 0; // 평점에서 halfstar 개수 (소수점 버림 처리)
    const emptyStars = 5 - fullStars - halfStars; // 남은 별은 emptystar로 처리

    const stars = [];

    // fullstar 추가
    for (let i = 0; i < fullStars; i++) {
      stars.push(<img key={`full-${i}`} src="/icons/fullstar.png" alt="Full Star" />);
    }

    // halfstar 추가
    if (halfStars === 1) {
      stars.push(<img key="half" src="/icons/halfstar.png" alt="Half Star" />);
    }

    // emptystar 추가
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<img key={`empty-${i}`} src="/icons/emptystar.png" alt="Empty Star" />);
    }

    return stars;
  };



  // 섹션 열고 닫기 핸들러
  const handleToggle = (section) => {
    setActiveSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // 아이콘 선택 함수
  const getIcon = (section) => {
    return activeSections[section] ? "/icons/minus.png" : "/icons/plus.png";
  };



  
  if (!vehicle) {
    return <div>Loading...</div>;  // 데이터가 로드되지 않았을 때 로딩 메시지
  }

  function splitTextByPeriods(text, periodCount = 2) {
    const regex = new RegExp(`((?:[^.]+\\.){${periodCount}})`, 'g');
    return text.split(regex)
        .filter(paragraph => paragraph.trim()) // 빈 문자열 제거
        .map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
        ));
}



  return (
    
      <div className="test-container">
        <h1 className="vehicle-name">{vehicle.이름}</h1>
        <nav className="review-nav">
          <ul>
            
            <li><a href="#driving">주행</a></li>
            <li><a href="#safety">장비</a></li>
            <li><a href="#place">공간</a></li>
            <li><a href="#maintenance">유지관리</a></li>
            <li><a href="#problem">결함문제</a></li>
            <li><a href="#cost">가격</a></li>
            <li><a href="#qna">QNA</a></li>
            
          </ul>
        </nav>
    

        <section id="summary" className="review-section">
        {vehicle && (
          <div>
            <img src={`/images/${vehicle.차량번호}.png`} alt={vehicle.이름} className="section-image"/>
            <h1 class="summary-header">{vehicle.종합평가_title}</h1>
            <div className="summary-rating">
                {renderStars(vehicle.평점)}<span className="vehicle-point">{vehicle.평점}</span>{/* 평점에 따른 별 이미지 표시 */}
            </div>
            <div className="summary-main">
              {splitTextByPeriods(vehicle.종합평가, 5)}
            </div>
         </div>
        )}
        </section>
       
        
        <section id="driving" className="review-section">
          <div className="section-header" onClick={() => handleToggle("driving")}>
            <h2 style={{ visibility: activeSections.driving ? "hidden" : "visible" }}>주행</h2>
            <p class="section-title">{vehicle.주행_title}</p>
            <img src={getIcon("driving")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          {activeSections.driving && (
            <>
            <div class="section-main">
              <h3 class="section-subtitle">직선 주행</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.직선주행, 10)}
              </div>
            </div>
            <div class="section-main">
              <h3 class="section-subtitle">곡선 주행</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.곡선주행, 10)}
              </div>
            </div>
            </>
            
          )}
        </section>

        <section id="safety" className="review-section">
          <div className="section-header" onClick={() => handleToggle("safety")}>
            <h2 style={{ visibility: activeSections.safety ? "hidden" : "visible" }}>장비</h2>
            <p class="section-title">{vehicle.장비_title}</p>
            <img src={getIcon("safety")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          {activeSections.safety && (
            <>
            <div class="section-main">
              <h3 class="section-subtitle">안전장비</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.안전장비, 10)}
              </div>
            </div>
            <div class="section-main">
              <h3 class="section-subtitle">편의장비</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.편의장비, 10)}
              </div>
            </div>
            </>
          )}
        </section>
        
        <section id="place" className="review-section">
          <div className="section-header" onClick={() => handleToggle("place")}>
            <h2 style={{ visibility: activeSections.place ? "hidden" : "visible" }}>공간</h2>
            <p class="section-title">{vehicle.공간_title}</p>
            <img src={getIcon("place")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          {activeSections.place && (
            <>
            <div class="section-main">
              <h3 class="section-subtitle">공간</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.공간, 10)}
              </div>
            </div>
            </>
          )}
        </section>

        <section id="maintenance" className="review-section">
          <div className="section-header" onClick={() => handleToggle("maintenance")}>
            <h2 style={{ visibility: activeSections.maintenance ? "hidden" : "visible" }}>유지</h2>
            <p class="section-title">{vehicle.유지관리_title}</p>
            <img src={getIcon("maintenance")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          {activeSections.maintenance && (
            <>
            <div class="section-main">
              <h3 class="section-subtitle">연비</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.연비, 10)}
              </div>
            </div>
            <div class="section-main">
              <h3 class="section-subtitle">정비</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.정비, 10)}
              </div>
            </div>
            <div class="section-main">
              <h3 class="section-subtitle">보증</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.보증, 10)}
              </div>
            </div>
            </>
          )}
        </section>

        <section id="problem" className="review-section">
          <div className="section-header" onClick={() => handleToggle("problem")}>
            <h2 style={{ visibility: activeSections.problem ? "hidden" : "visible" }}>결함</h2>
            <p class="section-title">{vehicle.결함문제_title}</p>
            <img src={getIcon("problem")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          {activeSections.problem && (
            <div class="section-main">
              <h3 class="section-subtitle">결함문제</h3>
              <div className="section-text">
                {splitTextByPeriods(vehicle.결함문제, 10)}
              </div>
            </div>
          )}
        </section>

        <section id="cost" className="review-section">
          <div className="section-header" onClick={() => handleToggle("cost")}>
            <h2 style={{ visibility: activeSections.cost ? "hidden" : "visible" }}>가격</h2>
            <p class="section-title">{vehicle.가격_title}</p>
            <img src={getIcon("cost")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          {activeSections.cost && (
           <div class="section-main">
            <h3 class="section-subtitle">가격</h3>
            <div className="section-text">
              {splitTextByPeriods(vehicle.가격, 10)}
            </div>
           </div>
          )}
        </section>

        <section id="qna" className={`review-section ${activeSections.qna ? "active" : ""}`}>
        
          <div className="section-header" onClick={() => handleToggle("qna")}>
            <h2>QNA</h2>
            <img src={getIcon("qna")} alt="Toggle Icon" className="toggle-icon" />
          </div>
          <div className="qna-content">
            {[
              {
                question: "Q.볼보 AS는 어때요?", 
                answer: "예전엔 ‘극악’이었는데 지금은 많이 개선됐습니다. 일단 서비스센터부터 적극 늘리고 있죠. 아울러 전 부품 3년 또는 6만km까지 AS 되고, 보증 연장 프로모션 적용 시 5년 또는 10만km까지로 늘어납니다. 수입차 중에서는 으뜸인 거죠.",
                
              },
              {
                question: "Q.오프로딩도 가능한가요?",
                answer: "이 차의 최저지상고가 기아 모하비 정도 된다지요. S90/V90보다 바닥을 65mm 높이고 명민한 보그워너제 사륜구동 달아 웬만한 오프로드라면 소화할 수 있습니다. 다만 ‘여름용 타이어’를 달고 출고했다면 절대 오프로드에 들어가지 마세요.",
              },
              {
                question: "Q.차를 높였으면 코너링이 불안할 텐데.",
                answer: "비단 차고만 높인 게 아니라 서스펜션 세팅까지 새로 한 모델입니다. 실제 몰아보면 코너에서 기울어짐이 적고 풀 브레이킹을 때려도 고꾸라지지 않습니다. 오히려 S90/V90보다 길어진 서스펜션 스트로크로써 승차감이 부드러운 게 마음에 들더군요.",
              },
              {
                question: "Q.디젤 모델, 안 시끄러운가요?",
                answer: "소음 때문에 스트레스 겪을 일은 없을 것입니다. 최신형 디젤 엔진 달았고 엄연히 볼보의 기함급 모델로서 방음 수준이 높거든요. 납작한 세단/왜건 베이스인지라 진동도 적습니다. 평범한 승용차 타다 넘어오기 좋은 차예요.",
              },
              {
                question: "Q.‘프로’ 등급에는 뭐가 추가돼요?",
                answer: "어라운드 뷰, 1열 마사지 및 통풍 시트, 4존 에어컨, 2열 측면 유리 햇빛 가리개, B&W 오디오가 담깁니다. 2열 등받이 전동 폴딩, 전동식 러기지 스크린도 프로의 전유물. 신차가가 기본형 대비 700만원 비쌌는데 그 간극은 더 넓은 듯하죠?",
              },
            ].map((qa, index) => (
              <div key={index} className="qa-pair">
                <p className="question">{qa.question}</p>
                {activeSections.qna && <p className="answer">{qa.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      

      </div>
      
  );
};

export default VehicleInfo;
