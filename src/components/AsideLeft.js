// AsideLeft.js
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom"; // useNavigate 훅 임포트
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";

const AsideLeft = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const firstName = userData.firstName || "이름없음";
        const lastName = userData.lastName || "";
        setUserName(`${firstName}${lastName}`.trim());

        const wishlist = userData.wishlist || [];
        setWishlist(wishlist);

        const viewedVehicles = userData.viewedVehicles || [];
        const allVehicles = [...wishlist, ...viewedVehicles];

        const vehicleCounts = allVehicles.reduce((acc, vehicleId) => {
          acc[vehicleId] = (acc[vehicleId] || 0) + 1;
          return acc;
        }, {});

        const sortedVehicleIds = Object.keys(vehicleCounts).sort((a, b) => vehicleCounts[b] - vehicleCounts[a]);

        const topVehicleIds = sortedVehicleIds.slice(0, 3);
        const vehiclePromises = topVehicleIds.map((vehicleId) => fetch(`https://us-central1-findingcar.cloudfunctions.net/myApi/api/vehicles/${vehicleId}`).then((res) => res.json()));

        const vehiclesData = await Promise.all(vehiclePromises);
        setVehicles(vehiclesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommended vehicles:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleDetailClick = async (vehicle) => {
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        viewedVehicles: arrayUnion(vehicle.차량번호),
      });
    }
    // 상세 페이지로 이동
    navigate(`/vehicle/${vehicle.차량번호}`); // 차량 번호를 사용하여 상세 페이지로 이동
  };

  const handleAddToWishlist = async (vehicleId) => {
    if (user) {
      try {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayUnion(vehicleId),
        });
        setWishlist((prevWishlist) => [...prevWishlist, vehicleId]);
        alert("찜목록에 추가되었습니다.");
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }
    } else {
      alert("로그인이 필요합니다.");
    }
  };

  const handleRemoveFromWishlist = async (vehicleId) => {
    if (user) {
      try {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayRemove(vehicleId),
        });
        setWishlist((prevWishlist) => prevWishlist.filter((id) => id !== vehicleId));
        alert("찜목록에서 제거되었습니다.");
      } catch (error) {
        console.error("Error removing from wishlist:", error);
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
