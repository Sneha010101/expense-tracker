const http = require("http");

const BASE = "http://127.0.0.1:5000/api";
const results = [];
let passed = 0;
let failed = 0;
let total = 0;

// Helper: make HTTP request
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on("error", (err) => resolve({ status: 0, error: err.message, body: null, headers: {} }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "timeout", body: null, headers: {} }); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, passed_bool, detail) {
  total++;
  if (passed_bool) {
    passed++;
    results.push({ name, status: "✅ PASS", detail });
  } else {
    failed++;
    results.push({ name, status: "❌ FAIL", detail });
  }
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("  EXPENSE TRACKER — SECURITY ATTACK SUITE");
  console.log("  Target: " + BASE);
  console.log("  Time: " + new Date().toLocaleString());
  console.log("=".repeat(60));
  console.log();

  // =====================================================
  // TEST 1: Security Headers (Helmet)
  // =====================================================
  console.log("🔍 Testing Security Headers...");
  const headersRes = await request("GET", "/auth/login");
  const h = headersRes.headers;

  test(
    "X-Content-Type-Options header",
    h["x-content-type-options"] === "nosniff",
    h["x-content-type-options"] || "MISSING"
  );

  test(
    "X-Frame-Options / CSP frame-ancestors",
    h["x-frame-options"] || (h["content-security-policy"] && h["content-security-policy"].includes("frame-ancestors")),
    h["x-frame-options"] || "Check CSP"
  );

  test(
    "Strict-Transport-Security header",
    !!h["strict-transport-security"],
    h["strict-transport-security"] || "MISSING (OK for localhost)"
  );

  test(
    "X-Powered-By hidden",
    !h["x-powered-by"],
    h["x-powered-by"] ? "EXPOSED: " + h["x-powered-by"] : "Hidden"
  );

  test(
    "Content-Security-Policy header",
    !!h["content-security-policy"],
    h["content-security-policy"] ? "Present" : "MISSING"
  );

  // =====================================================
  // TEST 2: NoSQL Injection Attacks
  // =====================================================
  console.log("🔍 Testing NoSQL Injection...");

  // Attack: bypass login with $ne operator
  const nosqlLogin = await request("POST", "/auth/login", {
    email: { "$ne": "" },
    password: { "$ne": "" },
  });
  test(
    "NoSQL Injection on login ($ne bypass)",
    nosqlLogin.status >= 400,
    `Status: ${nosqlLogin.status} — ${nosqlLogin.body?.message || "blocked"}`
  );

  // Attack: $gt operator injection
  const nosqlGt = await request("POST", "/auth/login", {
    email: { "$gt": "" },
    password: "test123",
  });
  test(
    "NoSQL Injection ($gt operator)",
    nosqlGt.status >= 400,
    `Status: ${nosqlGt.status} — ${nosqlGt.body?.message || "blocked"}`
  );

  // Attack: $where injection
  const nosqlWhere = await request("POST", "/auth/login", {
    email: "test@test.com",
    password: { "$where": "return true" },
  });
  test(
    "NoSQL Injection ($where clause)",
    nosqlWhere.status >= 400,
    `Status: ${nosqlWhere.status} — ${nosqlWhere.body?.message || "blocked"}`
  );

  // =====================================================
  // TEST 3: Authentication Bypass
  // =====================================================
  console.log("🔍 Testing Authentication Bypass...");

  // Access protected route without token
  const noTokenRes = await request("GET", "/expenses");
  test(
    "Access expenses without token",
    noTokenRes.status === 401,
    `Status: ${noTokenRes.status} — ${noTokenRes.body?.message || ""}`
  );

  const noTokenPortfolio = await request("GET", "/portfolio");
  test(
    "Access portfolio without token",
    noTokenPortfolio.status === 401,
    `Status: ${noTokenPortfolio.status}`
  );

  // Fake JWT token
  const fakeToken = await request("GET", "/expenses", null, {
    Authorization: "Bearer fakejwttoken123456",
  });
  test(
    "Access with forged JWT token",
    fakeToken.status === 401,
    `Status: ${fakeToken.status} — ${fakeToken.body?.message || ""}`
  );

  // Tampered JWT (valid format, wrong signature)
  const tamperedJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NiIsImlhdCI6MTcwMDAwMDAwMH0.tampered_signature_here";
  const tamperedRes = await request("GET", "/expenses", null, {
    Authorization: `Bearer ${tamperedJwt}`,
  });
  test(
    "Access with tampered JWT signature",
    tamperedRes.status === 401,
    `Status: ${tamperedRes.status}`
  );

  // Empty Authorization header
  const emptyAuth = await request("GET", "/expenses", null, {
    Authorization: "",
  });
  test(
    "Access with empty Authorization header",
    emptyAuth.status === 401,
    `Status: ${emptyAuth.status}`
  );

  // =====================================================
  // TEST 4: Mass Assignment Attack
  // =====================================================
  console.log("🔍 Testing Mass Assignment...");

  // Try to create expense with injected userId (without valid token, should be 401)
  const massAssign = await request("POST", "/expenses", {
    title: "Hack",
    amount: 9999,
    userId: "666666666666666666666666",
    isAdmin: true,
    role: "admin",
  });
  test(
    "Mass assignment blocked (no auth)",
    massAssign.status === 401,
    `Status: ${massAssign.status}`
  );

  // =====================================================
  // TEST 5: Large Payload Attack (DoS)
  // =====================================================
  console.log("🔍 Testing Large Payload Attack...");

  const largeBody = { data: "x".repeat(50000) };
  const largeRes = await request("POST", "/auth/login", largeBody);
  test(
    "Large payload rejected (50KB body)",
    largeRes.status === 413 || largeRes.status >= 400,
    `Status: ${largeRes.status} — ${largeRes.status === 413 ? "Payload too large" : "Rejected"}`
  );

  // =====================================================
  // TEST 6: XSS via Input
  // =====================================================
  console.log("🔍 Testing XSS Input Handling...");

  const xssRegister = await request("POST", "/auth/register", {
    name: '<script>alert("xss")</script>',
    email: "xss@test.com",
    phone: "+911234567890",
    password: "test123",
  });
  test(
    "XSS in registration name field",
    xssRegister.status !== 500,
    `Status: ${xssRegister.status} — Server didn't crash`
  );

  // =====================================================
  // TEST 7: CORS Policy
  // =====================================================
  console.log("🔍 Testing CORS Policy...");

  const corsRes = await request("GET", "/expenses", null, {
    Origin: "https://evil-site.com",
  });
  const allowOrigin = corsRes.headers["access-control-allow-origin"];
  test(
    "CORS blocks unauthorized origin",
    !allowOrigin || allowOrigin !== "*",
    `Access-Control-Allow-Origin: ${allowOrigin || "NOT SET (good - blocked)"}`
  );

  // =====================================================
  // TEST 8: Rate Limiting
  // =====================================================
  console.log("🔍 Testing Rate Limiting on Auth...");

  let rateLimited = false;
  let lastStatus = 0;
  for (let i = 0; i < 12; i++) {
    const r = await request("POST", "/auth/login", {
      email: "ratetest@test.com",
      password: "wrong",
    });
    lastStatus = r.status;
    if (r.status === 429) {
      rateLimited = true;
      break;
    }
  }
  test(
    "Rate limiting on auth endpoints",
    rateLimited,
    rateLimited ? "Blocked after rapid requests (429)" : `Not triggered after 12 attempts (last: ${lastStatus})`
  );

  // =====================================================
  // TEST 9: Path Traversal
  // =====================================================
  console.log("🔍 Testing Path Traversal...");

  const traversal = await request("GET", "/reports/download/../../etc/passwd");
  test(
    "Path traversal in report range param",
    traversal.status !== 200 || !traversal.body?.toString().includes("root:"),
    `Status: ${traversal.status} — No file leak`
  );

  // =====================================================
  // TEST 10: Invalid ObjectId Crash
  // =====================================================
  console.log("🔍 Testing Invalid ObjectId Handling...");

  const badId = await request("DELETE", "/expenses/not-a-valid-id", null, {
    Authorization: "Bearer fakejwttoken",
  });
  test(
    "Invalid ObjectId doesn't crash server",
    badId.status !== 500 || badId.status === 401,
    `Status: ${badId.status} — Server still running`
  );

  // =====================================================
  // TEST 11: OTP without login
  // =====================================================
  console.log("🔍 Testing OTP Bypass...");

  const otpBypass = await request("POST", "/auth/verify-otp", {
    email: "nobody@test.com",
    otp: "123456",
  });
  test(
    "OTP verification without prior login",
    otpBypass.status === 400,
    `Status: ${otpBypass.status} — ${otpBypass.body?.message || ""}`
  );

  // Brute force OTP
  const otpBrute = await request("POST", "/auth/verify-otp", {
    email: "nobody@test.com",
    otp: "000000",
  });
  test(
    "Brute force OTP rejected",
    otpBrute.status >= 400,
    `Status: ${otpBrute.status} — ${otpBrute.body?.message || ""}`
  );

  // =====================================================
  // RESULTS
  // =====================================================
  console.log();
  console.log("=".repeat(60));
  console.log("  SECURITY TEST RESULTS");
  console.log("=".repeat(60));
  console.log();

  results.forEach((r, i) => {
    console.log(`  ${String(i + 1).padStart(2, " ")}. ${r.status}  ${r.name}`);
    console.log(`      └─ ${r.detail}`);
  });

  console.log();
  console.log("─".repeat(60));

  const score = Math.round((passed / total) * 100);
  const grade =
    score >= 90 ? "A+" :
    score >= 80 ? "A" :
    score >= 70 ? "B" :
    score >= 60 ? "C" :
    score >= 50 ? "D" : "F";

  console.log();
  console.log(`  TOTAL TESTS:  ${total}`);
  console.log(`  PASSED:       ${passed} ✅`);
  console.log(`  FAILED:       ${failed} ❌`);
  console.log(`  SCORE:        ${score}/100`);
  console.log(`  GRADE:        ${grade}`);
  console.log();

  if (score >= 90) {
    console.log("  🏆 EXCELLENT! Your app is well-secured.");
  } else if (score >= 70) {
    console.log("  👍 GOOD. A few areas need attention.");
  } else {
    console.log("  ⚠️  NEEDS WORK. Several vulnerabilities found.");
  }

  console.log();
  console.log("=".repeat(60));
}

runTests().catch(console.error);
