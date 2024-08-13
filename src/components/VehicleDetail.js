import React, { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const VehicleDetail = ({ vehicle, onBack }) => {
  const [wishlist, setWishlist] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setWishlist(userData.wishlist || []);
        }
      }
    };

    fetchWishlist();
  }, [user]);

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

  const renderColors = () => {
    return Array.from({ length: 10 }, (_, i) => i + 1).map((i) => {
      const colorName = vehicle[`색상${i}`];
      const colorCode = vehicle[`색상${i}코드`];
      return colorName ? (
        <div key={i} className="color-item">
          <div className="color-box" style={{ backgroundColor: colorCode }}></div>
          <div className="color-name">{colorName}</div>
        </div>
      ) : null;
    });
  };

  return (
    <div className="vehicle-detail">
      <div className="vehicle-image-section">
        <div className="image-container">
          <div className="top-text">
            <h2>{`${vehicle.브랜드} ${vehicle.이름}`}</h2>
          </div>
          <img src={`/innerimages/${vehicle.상세사진}.jpg`} alt={vehicle.이름} className="vehicle-image" />
          <div className="middle-text">
            <div className="release-year">{`${vehicle.출시년도}년형`}</div>
          </div>
          <div className="bottom-text">
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
      <div className="vehicle-specs">
        <h2>차량 스펙</h2>
        <h3>차종: {vehicle.차종}</h3>
        <h3>엔진: {vehicle.엔진}</h3>
        <h3>연비: {`${vehicle.최소연비} ~ ${vehicle.최대연비} km/l`}</h3>
        <h3>출력: {`${vehicle.최소출력} ~ ${vehicle.최대출력} hp`}</h3>
        <h3>가격: {`${vehicle.최소가격} ~ ${vehicle.최대가격} 만원`}</h3>
      </div>
      <div className="vehicle-colors">
        <h3>외장 색상</h3>
        <hr />
        <div className="colors">{renderColors()}</div>
      </div>
      <div className="vehicle-description">
        <h2>설명</h2>
        <h3>{vehicle.내용}</h3>
      </div>
    </div>
  );
};

export default VehicleDetail;
