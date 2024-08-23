import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom"; // useNavigate 훅 임포트
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import axios from "axios";

const AsideLeft = () => {
  const [vehicles, setVehicles] = useState([]); // 추천 차량 목록을 저장하는 상태입니다.
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태를 관리합니다.
  const [user] = useAuthState(auth); // 현재 로그인된 사용자 정보를 가져옵니다.
  const [userName, setUserName] = useState(""); // 사용자의 이름을 저장합니다.
  const [wishlist, setWishlist] = useState([]); // 사용자의 찜 목록을 저장합니다.
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅을 사용합니다.

  useEffect(() => {
    // 사용자 데이터를 가져오는 함수입니다.
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Firebase Firestore에서 사용자 데이터를 가져옵니다.
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const firstName = userData.firstName || "이름없음";
        const lastName = userData.lastName || "";
        setUserName(`${firstName}${lastName}`.trim());

        const wishlist = userData.wishlist || [];
        setWishlist(wishlist);

        // 사용자가 찜한 차량과 최근 본 차량을 합칩니다.
        const viewedVehicles = userData.viewedVehicles || [];
        const allVehicles = [...wishlist, ...viewedVehicles];

        // 각 차량의 출현 횟수를 계산합니다.
        const vehicleCounts = allVehicles.reduce((acc, vehicleId) => {
          acc[vehicleId] = (acc[vehicleId] || 0) + 1;
          return acc;
        }, {});

        // 차량 출현 횟수에 따라 정렬된 차량 ID 목록을 가져옵니다.
        const sortedVehicleIds = Object.keys(vehicleCounts).sort((a, b) => vehicleCounts[b] - vehicleCounts[a]);

        // 상위 3개의 차량 ID를 가져옵니다.
        const topVehicleIds = sortedVehicleIds.slice(0, 3);

        // 차량 데이터를 가져옵니다.
        const vehiclePromises = topVehicleIds.map((vehicleId) => axios.get(`https://us-central1-findingcar.cloudfunctions.net/myApi/api/vehicles/${vehicleId}`).then((res) => res.data));

        const vehiclesData = await Promise.all(vehiclePromises);
        setVehicles(vehiclesData); // 가져온 차량 데이터를 상태에 저장합니다.
        setLoading(false); // 로딩 상태를 false로 설정합니다.
      } catch (error) {
        console.error("Error fetching recommended vehicles:", error); // 에러 발생 시 콘솔에 로그를 남깁니다.
        setLoading(false); // 에러 발생 시에도 로딩을 중단합니다.
      }
    };

    fetchUserData();
  }, [user]);

  // 상세 페이지로 이동하면서 최근 본 차량 목록에 추가합니다.
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

  // 차량을 찜 목록에 추가하는 함수입니다.
  const handleAddToWishlist = async (vehicleId) => {
    if (user) {
      try {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayUnion(vehicleId),
        });
        setWishlist((prevWishlist) => [...prevWishlist, vehicleId]); // 찜 목록 상태를 업데이트합니다.
        alert("찜목록에 추가되었습니다.");
      } catch (error) {
        console.error("Error adding to wishlist:", error); // 에러 발생 시 콘솔에 로그를 남깁니다.
      }
    } else {
      alert("로그인이 필요합니다.");
    }
  };

  // 차량을 찜 목록에서 제거하는 함수입니다.
  const handleRemoveFromWishlist = async (vehicleId) => {
    if (user) {
      try {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayRemove(vehicleId),
        });
        setWishlist((prevWishlist) => prevWishlist.filter((id) => id !== vehicleId)); // 찜 목록 상태를 업데이트합니다.
        alert("찜목록에서 제거되었습니다.");
      } catch (error) {
        console.error("Error removing from wishlist:", error); // 에러 발생 시 콘솔에 로그를 남깁니다.
        alert("찜목록에서 제거하는데 실패했습니다.");
      }
    } else {
      alert("로그인이 필요합니다.");
    }
  };

  return (
    <div className="aside-left">
      <div className="RS">
        {userName}님의 추천 시스템
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.차량번호} className="box">
              <img src={`/images/${vehicle.차량번호}.png`} alt={vehicle.이름} />
              <div>{vehicle.이름}</div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default AsideLeft;
