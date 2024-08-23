// Firebase Functions 및 Firebase Admin SDK를 가져옵니다.
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// PostgreSQL 데이터베이스와 연결하기 위한 pg 모듈에서 Pool 객체를 가져옵니다.
const { Pool } = require("pg");

// CORS 미들웨어와 Express 웹 프레임워크를 가져옵니다.
const cors = require("cors");
const express = require("express");
const path = require("path");

// Firebase Admin을 초기화합니다.
admin.initializeApp();

// PostgreSQL 데이터베이스 연결 설정 (환경 변수로부터 값을 가져옵니다)
const pool = new Pool({
  user: functions.config().postgres.user, // 데이터베이스 사용자 이름
  host: functions.config().postgres.host, // 데이터베이스 호스트 주소
  database: functions.config().postgres.database, // 데이터베이스 이름
  password: functions.config().postgres.password, // 데이터베이스 비밀번호
  port: functions.config().postgres.port, // 데이터베이스 포트 번호
});

// Express 애플리케이션을 생성합니다.
const app = express();

// CORS 미들웨어 설정: 모든 도메인에서의 요청을 허용합니다.
app.use(cors({ origin: true }));

// JSON 형태의 요청 바디를 처리할 수 있도록 Express에 JSON 미들웨어 추가
app.use(express.json());

// 차량 데이터 조회 API
// 필터링, 정렬, 페이지네이션을 포함한 데이터 조회를 처리합니다.
app.get("/api/vehicles", async (req, res) => {
  const {
    page = 1, // 페이지 번호
    limit = 20, // 한 페이지에서 가져올 데이터 수
    brand, // 브랜드 필터
    type, // 차종 필터
    engine, // 엔진 타입 필터
    minPrice, // 최소 가격 필터
    maxPrice, // 최대 가격 필터
    fuelEfficiency, // 연비 필터
    power, // 출력 필터
    searchTerm, // 검색어 필터
    sortOption, // 정렬 옵션
  } = req.query;

  const offset = (page - 1) * limit; // 페이지네이션 오프셋 계산

  // 기본 쿼리 및 파라미터 배열을 정의합니다.
  let query = "SELECT * FROM vehicle WHERE 1=1"; // 기본 쿼리, WHERE 1=1은 조건 추가를 쉽게 하기 위함
  const queryParams = []; // SQL 쿼리에 사용할 매개변수 배열
  const filterConditions = []; // 필터 조건을 저장할 배열

  // 필터 조건 추가
  if (brand) {
    const brands = brand.split(",");
    filterConditions.push(`브랜드 = ANY(ARRAY[${brands.map((_, i) => `$${queryParams.length + i + 1}`).join(", ")}])`);
    queryParams.push(...brands);
  }

  if (type) {
    const types = type.split(",");
    filterConditions.push(`차종 = ANY(ARRAY[${types.map((_, i) => `$${queryParams.length + i + 1}`).join(", ")}])`);
    queryParams.push(...types);
  }

  if (engine) {
    const engines = engine.split(",");
    filterConditions.push(engines.map((_, i) => `엔진 ILIKE $${queryParams.length + i + 1}`).join(" OR "));
    engines.forEach((eng) => queryParams.push(`%${eng}%`));
  }

  if (minPrice) {
    queryParams.push(minPrice);
    filterConditions.push(`최소가격 >= $${queryParams.length}`);
  }

  if (maxPrice) {
    queryParams.push(maxPrice);
    filterConditions.push(`최대가격 <= $${queryParams.length}`);
  }

  if (fuelEfficiency) {
    const fuelEfficiencies = fuelEfficiency.split(",");
    const conditions = fuelEfficiencies.map((range) => {
      const [min, max] = range.split("-").map(Number);
      queryParams.push(min, max);
      return `((최소연비 >= $${queryParams.length - 1} AND 최소연비 <= $${queryParams.length}) OR (최대연비 >= $${queryParams.length - 1} AND 최대연비 <= $${queryParams.length}))`;
    });
    filterConditions.push(`(${conditions.join(" OR ")})`);
  }

  if (power) {
    const powers = power.split(",");
    const conditions = powers.map((range) => {
      const [min, max] = range.split("-").map(Number);
      queryParams.push(min, max);
      return `((최소출력 >= $${queryParams.length - 1} AND 최소출력 <= $${queryParams.length}) OR (최대출력 >= $${queryParams.length - 1} AND 최대출력 <= $${queryParams.length}))`;
    });
    filterConditions.push(`(${conditions.join(" OR ")})`);
  }

  if (searchTerm) {
    queryParams.push(`%${searchTerm}%`);
    filterConditions.push(`이름 ILIKE $${queryParams.length}`);
  }

  // 필터 조건들을 결합하여 최종 쿼리 생성
  if (filterConditions.length > 0) {
    query += " AND (" + filterConditions.join(") AND (") + ")";
  }

  // 정렬 옵션 처리
  if (sortOption && sortOption !== "브랜드순") {
    if (sortOption === "낮은 가격순") {
      query += " ORDER BY 최소가격 ASC";
    } else if (sortOption === "높은 가격순") {
      query += " ORDER BY 최대가격 DESC";
    } else if (sortOption === "낮은 연비순") {
      query += " ORDER BY 최소연비 ASC";
    } else if (sortOption === "높은 연비순") {
      query += " ORDER BY 최대연비 DESC";
    } else if (sortOption === "낮은 출력순") {
      query += " ORDER BY 최소출력 ASC";
    } else if (sortOption === "높은 출력순") {
      query += " ORDER BY 최대출력 DESC";
    }
  }

  // 페이지네이션 처리 (LIMIT과 OFFSET)
  queryParams.push(limit, offset);
  query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// 특정 차량 데이터 조회 (상세 페이지)
app.get("/api/vehicles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
        `
      WITH filtered_vehicle AS (
        SELECT * 
        FROM vehicle 
        WHERE 차량번호 = $1
      )
      SELECT * 
      FROM filtered_vehicle v
      LEFT JOIN vehicle_detail vd ON v.차량번호 = vd.차량번호
      `,
        [id],
    ); // main에서 선택한 차량카드의 차량번호로 검색해서 왼쪽 조인함.

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// React 앱 제공
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Firebase Functions로 Express 앱을 HTTPS 요청 처리로 노출
exports.myApi = functions.https.onRequest(app);
