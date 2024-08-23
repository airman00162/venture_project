import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import VehicleDetail from "../components/VehicleDetail";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";
import axios from "axios";

const VehicleDetailPage = () => {
  const { vehicleId } = useParams(); // URL에서 vehicleId 파라미터를 가져옵니다.
  const [vehicle, setVehicle] = useState(null); // 차량 데이터를 저장할 상태를 선언합니다.

  useEffect(() => {
    // 차량 데이터를 서버에서 가져오는 함수입니다.
    const fetchVehicle = async () => {
      try {
        // axios를 사용하여 서버에서 데이터를 가져옵니다.
        const response = await axios.get(`https://us-central1-findingcar.cloudfunctions.net/myApi/api/vehicles/${vehicleId}`);
        setVehicle(response.data); // 응답 데이터를 상태에 저장합니다.
      } catch (error) {
        console.error("Error fetching vehicle data:", error); // 에러 발생 시 콘솔에 로그를 남깁니다.
      }
    };

    fetchVehicle(); // 컴포넌트가 마운트될 때 데이터를 가져옵니다.
  }, [vehicleId]); // vehicleId가 변경될 때마다 데이터를 다시 가져옵니다.

  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        {/* 데이터가 로드되면 VehicleDetail 컴포넌트를 렌더링하고, 그렇지 않으면 로딩 메시지를 표시합니다. */}
        <div>{vehicle ? <VehicleDetail vehicle={vehicle} /> : <p>Loading...</p>}</div>
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default VehicleDetailPage;
