import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import VehicleDetail from "../components/VehicleDetail";
import AsideLeft from "../components/AsideLeft";
import AsideRight from "../components/AsideRight";
import Footer from "../components/Footer";

const VehicleDetailPage = () => {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`https://us-central1-findingcar.cloudfunctions.net/myApi/api/vehicles/${vehicleId}`);
        const data = await response.json();
        setVehicle(data);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        <div>{vehicle ? <VehicleDetail vehicle={vehicle} /> : <p>Loading...</p>}</div>
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default VehicleDetailPage;
