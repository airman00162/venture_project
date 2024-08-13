// Firebase Functions 및 Firebase Admin SDK를 가져옵니다.
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// PostgreSQL 데이터베이스와 연결하기 위한 pg 모듈에서 Pool 객체를 가져옵니다.
const { Pool } = require("pg");

// CORS 미들웨어와 Express 웹 프레임워크를 가져옵니다.
const cors = require("cors");
const express = require("express");

// Firebase Admin을 초기화합니다.
admin.initializeApp();

// PostgreSQL 데이터베이스 연결 설정
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

// 차량 정보를 조회하는 API 엔드포인트 정의 (GET /api/vehicles)
// 이 엔드포인트는 "vehicle" 테이블의 모든 데이터를 조회합니다.
app.get("/api/vehicles", async (req, res) => {
  try {
    // PostgreSQL 데이터베이스에서 차량 데이터를 조회하는 쿼리 실행
    const result = await pool.query("SELECT * FROM vehicle");
    // 조회된 데이터를 JSON 형태로 클라이언트에 응답
    res.json(result.rows);
  } catch (err) {
    // 데이터 조회 실패 시 에러 로그를 기록하고 500 에러 응답을 보냅니다.
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// 특정 차량 정보를 조회하는 API 엔드포인트 정의 (GET /api/vehicles/:id)
// 이 엔드포인트는 "vehicle" 테이블에서 특정 차량번호에 해당하는 데이터를 조회합니다.
app.get("/api/vehicles/:id", async (req, res) => {
  const { id } = req.params; // URL 파라미터에서 차량 번호(id)를 가져옵니다.

  // 차량 번호가 제공되지 않은 경우 400 에러를 반환합니다.
  if (!id) {
    return res.status(400).json({ error: "Vehicle ID is required" });
  }

  try {
    // PostgreSQL 데이터베이스에서 특정 차량 번호에 해당하는 데이터를 조회하는 쿼리 실행
    const result = await pool.query("SELECT * FROM vehicle WHERE 차량번호 = $1", [id]);

    // 조회된 데이터가 없는 경우 404 에러를 반환합니다.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // 조회된 데이터를 JSON 형태로 클라이언트에 응답
    res.json(result.rows[0]);
  } catch (err) {
    // 데이터 조회 실패 시 에러 로그를 기록하고 500 에러 응답을 보냅니다.
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// 데이터베이스 연결을 테스트하는 API 엔드포인트 정의 (GET /api/test-db-connection)
// 이 엔드포인트는 단순히 데이터베이스 연결을 확인하기 위해 현재 시간을 조회합니다.
app.get("/api/test-db-connection", async (req, res) => {
  try {
    // PostgreSQL 데이터베이스에서 현재 시간을 조회하는 쿼리 실행
    const result = await pool.query("SELECT NOW()");

    // 조회된 현재 시간을 JSON 형태로 클라이언트에 응답
    res.json(result.rows[0]);
  } catch (err) {
    // 데이터베이스 연결 테스트 실패 시 에러 로그를 기록하고 500 에러 응답을 보냅니다.
    console.error("Error testing database connection:", err);
    res.status(500).json({ error: "Database connection test failed" });
  }
});

// Firebase Functions로 Express 앱을 HTTPS 요청 처리로 노출
exports.myApi = functions.https.onRequest(app);
