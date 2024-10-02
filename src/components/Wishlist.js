import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Wishlist = () => {
  const [user] = useAuthState(auth); // Firebase 인증 상태를 확인합니다.
  const [wishlist, setWishlist] = useState([]); // 사용자의 찜 목록 상태를 관리합니다.
  const [vehicles, setVehicles] = useState([]); // 찜 목록에 해당하는 차량 데이터를 상태로 관리합니다.
  const [userName, setUserName] = useState(""); // 사용자의 이름 상태를 관리합니다.
  const navigate = useNavigate();

  useEffect(() => {
    // 사용자 데이터(찜 목록 및 이름)를 가져오는 함수입니다.
    const fetchWishlistAndUserName = async () => {
      if (user) {
        try {
          // Firebase Firestore에서 사용자 데이터를 가져옵니다.
          const userRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setWishlist(userData.wishlist || []); // 찜 목록을 상태에 저장합니다.
            setUserName(`${userData.firstName || ""} ${userData.lastName || ""}`.trim()); // 사용자의 이름을 상태에 저장합니다.
          }
        } catch (error) {
          console.error("Error fetching user data:", error); // 오류 발생 시 로그를 기록합니다.
        }
      }
    };

    fetchWishlistAndUserName();
  }, [user]); // 사용자가 변경될 때마다 실행됩니다.

  useEffect(() => {
    // 찜 목록에 있는 차량 데이터를 가져오는 함수입니다.
    const fetchVehicles = async () => {
      if (wishlist.length > 0) {
        try {
          // axios를 사용하여 각 차량의 데이터를 가져옵니다.
          const vehiclePromises = wishlist.map((vehicleId) => axios.get(`https://us-central1-findingcar.cloudfunctions.net/myApi/api/vehicles/${vehicleId}`).then((response) => response.data));
          const vehiclesData = await Promise.all(vehiclePromises); // 모든 요청이 완료될 때까지 기다립니다.
          setVehicles(vehiclesData); // 차량 데이터를 상태에 저장합니다.
        } catch (error) {
          console.error("Error fetching vehicle data:", error); // 오류 발생 시 로그를 기록합니다.
        }
      }
    };

    fetchVehicles();
  }, [wishlist]); // 찜 목록이 변경될 때마다 실행됩니다.

  // 찜 목록에서 차량을 제거하는 함수입니다.
  const handleRemoveFromWishlist = async (vehicleId) => {
    if (user) {
      try {
        // Firebase Firestore에서 찜 목록을 업데이트합니다.
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayRemove(vehicleId),
        });
        setWishlist(wishlist.filter((id) => id !== vehicleId)); // 상태에서 해당 차량을 제거합니다.
        alert("찜목록에서 제거되었습니다.");
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        alert("찜목록에서 제거하는데 실패했습니다.");
      }
    } else {
      alert("로그인이 필요합니다.");
    }
  };

  // 차량 상세 페이지로 이동하는 함수
  const handleDetailClick = async (vehicleId) => {
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        viewedVehicles: arrayUnion(vehicleId),
      });
    }
    // 차량 상세 페이지로 이동합니다.
    navigate(`/vehicle/${vehicleId}`);
  };

  return (
    <div className="wishlist">
      <h2>{userName ? `${userName}의 찜목록` : "찜목록"}</h2>
      <div className="vehicles-section">
        {vehicles.map((vehicle) => (
          <div key={vehicle.차량번호} className="vehicle-card">
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
                <button className="detail-button" onClick={() => handleDetailClick(vehicle.차량번호)}>
                  상세 보기
                </button>
                <button className="like-button" onClick={() => handleRemoveFromWishlist(vehicle.차량번호)}>
                  찜해제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
