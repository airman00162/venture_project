import React, { useEffect } from 'react';
import Header from "../components/Header";
import VehicleInfo from "../components/VehicleInfo";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";

const InfoPage = () => {
  
  useEffect(() => {
    // 페이지가 로드될 때 스크롤을 최상단으로 이동
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="container">
      <Header />
      <div className="papyrus">
        <div className="content">
          <AsideLeft />
          <VehicleInfo />  {/* 차량 상세 정보를 표시하는 컴포넌트 */}
          <AsideRight />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InfoPage;
