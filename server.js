const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3001;

// PostgreSQL 연결 설정
// 실제 환경에서는 비밀번호와 데이터베이스 설정을 환경 변수로 관리하는 것이 좋습니다.
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "5432", // 실제 비밀번호로 대체
  port: 5432,
});

// CORS 미들웨어 사용
app.use(cors({
  origin: "http://localhost:3000", // 클라이언트의 도메인
  credentials: true, // 쿠키를 허용합니다
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

// cookieParser 미들웨어 사용
app.use(cookieParser());

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

  let query = "SELECT * FROM vehicle WHERE 1=1"; // 기본 쿼리, WHERE 1=1은 조건 추가를 쉽게 하기 위함
  const queryParams = []; // SQL 쿼리에 사용할 매개변수
  const filterConditions = []; // 필터 조건을 담을 배열

  // 브랜드 필터링 (합집합 처리)
  if (brand) {
    const brands = brand.split(",");
    filterConditions.push(`브랜드 = ANY(ARRAY[${brands.map((_, i) => `$${queryParams.length + i + 1}`).join(", ")}])`);
    queryParams.push(...brands);
  }

  // 차종 필터링 (합집합 처리)
  if (type) {
    const types = type.split(",");
    filterConditions.push(`차종 = ANY(ARRAY[${types.map((_, i) => `$${queryParams.length + i + 1}`).join(", ")}])`);
    queryParams.push(...types);
  }

  // 엔진 필터링 (합집합 처리)
  if (engine) {
    const engines = engine.split(",");
    filterConditions.push(engines.map((_, i) => `엔진 ILIKE $${queryParams.length + i + 1}`).join(" OR "));
    engines.forEach((eng) => queryParams.push(`%${eng}%`));
  }

  // 가격 필터링 (교집합 처리)
  if (minPrice) {
    queryParams.push(minPrice);
    filterConditions.push(`최소가격 >= $${queryParams.length}`);
  }

  if (maxPrice) {
    queryParams.push(maxPrice);
    filterConditions.push(`최대가격 <= $${queryParams.length}`);
  }

  // 연비 필터링 (교집합 처리)
  if (fuelEfficiency) {
    const fuelEfficiencies = fuelEfficiency.split(",");
    const conditions = fuelEfficiencies.map((range) => {
      const [min, max] = range.split("-").map(Number);
      queryParams.push(min, max);
      return `((최소연비 >= $${queryParams.length - 1} AND 최소연비 <= $${queryParams.length}) OR (최대연비 >= $${queryParams.length - 1} AND 최대연비 <= $${queryParams.length}))`;
    });
    filterConditions.push(`(${conditions.join(" OR ")})`);
  }

  // 출력 필터링 (교집합 처리)
  if (power) {
    const powers = power.split(",");
    const conditions = powers.map((range) => {
      const [min, max] = range.split("-").map(Number);
      queryParams.push(min, max);
      return `((최소출력 >= $${queryParams.length - 1} AND 최소출력 <= $${queryParams.length}) OR (최대출력 >= $${queryParams.length - 1} AND 최대출력 <= $${queryParams.length}))`;
    });
    filterConditions.push(`(${conditions.join(" OR ")})`);
  }

  // 이름 필터링 (검색어)
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
    const result = await pool.query(query, queryParams); // 데이터베이스 쿼리 실행
    res.json(result.rows); // 결과 반환
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" }); // 오류 처리
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
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" }); // 차량이 없을 때
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" }); // 오류 처리
  }
});

// 게시글 작성
app.post("/api/posts", async (req, res) => {
  const { title, content, category, email } = req.body;

  // 필수 필드 검증 - 없어도 될 듯
  if (!title || !content || !category || !email) {
    return res.status(400).json({ error: "모든 필드를 입력해 주세요." });
  }

  try {
    // 반환 받은 post는 추후 제거
    // 게시글을 데이터베이스에 삽입
    const result = await pool.query("INSERT INTO posts (title, content, author, category) VALUES ($1, $2, $3, $4) RETURNING *", [title, content, email, category]);

    const newPost = result.rows[0];

    // 성공 응답
    res.status(201).json({ message: "게시글이 성공적으로 등록되었습니다.", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "서버에 문제가 발생했습니다. 다시 시도해 주세요." });
  }
});

// 게시글 목록 불러오기
app.get("/api/posts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const term = req.query.term;
  const option = req.query.option;

  console.log(term, option);

  try {
    // 검색 키워드가 없을 때
    if (!term) {
      console.log("키워드 ㄴㄴ");
      let query = `
      SELECT id, title, author, category, created_at, views, comment_count
      FROM posts
      WHERE 1=1
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;

      // 전체 게시글 수 쿼리
      let totalQuery = `
      SELECT COUNT(*) AS count
      FROM posts
      WHERE 1=1
    `;
      const [result, totalResult] = await Promise.all([pool.query(query, [limit, offset]), pool.query(totalQuery)]);
      const totalPosts = parseInt(totalResult.rows[0].count);
      const totalPages = Math.ceil(totalPosts / limit);

      // 클라이언트에 데이터 반환
      res.json({
        posts: result.rows,
        totalPages: totalPages,
      });
    }
    // 검색 키워드가 있을 때
    else {
      console.log("키워드 ㅇㅇ");
      let query = `
      SELECT id, title, author, category, created_at, views
      FROM posts
      WHERE 1=1
    `;
      if (option === "title") {
        query += ` AND title LIKE $1`;
      } else if (option === "titleAndContent") {
        query += ` AND (title LIKE $1 OR content LIKE $1)`;
      } else if (option === "author") {
        query += ` AND author LIKE $1`;
      }
      query += `
      ORDER BY id DESC
      LIMIT $2 OFFSET $3
    `;

      // 전체 게시글 수 쿼리
      let totalQuery = `
      SELECT COUNT(*) AS count
      FROM posts
      WHERE 1=1
    `;
      if (option === "title") {
        totalQuery += ` AND title LIKE $1`;
      } else if (option === "titleAndContent") {
        totalQuery += ` AND (title LIKE $1 OR content LIKE $1)`;
      } else if (option === "author") {
        totalQuery += ` AND author LIKE $1`;
      }
      const [result, totalResult] = await Promise.all([pool.query(query, [`%${term}%`, limit, offset]), pool.query(totalQuery, [`%${term}%`])]);
      const totalPosts = parseInt(totalResult.rows[0].count);
      const totalPages = Math.ceil(totalPosts / limit);

      // 클라이언트에 데이터 반환
      res.json({
        posts: result.rows,
        totalPages: totalPages,
      });
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 해당 게시글 가져오기
app.get("/api/post", async (req, res) => {
  const postId = parseInt(req.query.postId) || 1;
  const userCookieName = `viewed_post_${postId}`;

  try {
    // 쿠키 확인
    if (!req.cookies[userCookieName]) {
      await pool.query("UPDATE posts SET views = views + 1 WHERE id = $1", [postId]);

      // 쿠키 설정 (1시간 동안 조회수 증가 방지)
      res.cookie(userCookieName, "true", { maxAge: 3600000, httpOnly: true });
    }

    const query = `
      SELECT 
        title, 
        content, 
        author, 
        category, 
        created_at, 
        is_edited, 
        like_count, 
        views
      FROM posts
      WHERE id = $1;
    `;

    const result = await pool.query(query, [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = result.rows[0];

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 댓글 가져오기
app.get("/api/getComments", async (req, res) => {
  const postId = parseInt(req.query.postId) || 1;

  try {
    const query = `
      SELECT 
        id,
        parent_id,
        content,
        author, 
        created_at,
        is_edited,
        like_count
      FROM comments
      WHERE post_id = $1;
    `;

    const result = await pool.query(query, [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comments not found" });
    }

    const comments = result.rows;

    res.json(comments);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 댓글 등록
app.post("/api/addComments", async (req, res) => {
  const { postId, email, commentContent, parent_id } = req.body;
  console.log(postId, email, commentContent, parent_id);

  try {
    // 댓글
    if (parent_id === null) {
      const result = await pool.query("INSERT INTO comments (post_id, author, content) VALUES ($1, $2, $3) RETURNING *", [postId, email, commentContent]);

      res.status(201).json({
        success: true,
        comment: result.rows[0],
      });
    } else {
      // 대댓글
      const result = await pool.query("INSERT INTO comments (post_id, parent_id, author, content) VALUES ($1, $2, $3, $4) RETURNING *", [postId, parent_id, email, commentContent]);

      res.status(201).json({
        success: true,
        comment: result.rows[0],
      });
    }
  } catch (error) {
    console.error("Error inserting comment:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// React 앱 제공
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html")); // React 빌드 파일 제공
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
