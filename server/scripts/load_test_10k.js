import http from 'http';

const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 150;
const BASE_HOST = '127.0.0.1';
const BASE_PORT = 3008;

// Endpoint distributions
const ENDPOINTS = [
  // 4,000 ML Predictions requests
  ...Array(40).fill('/api/predictions/22225'),
  ...Array(40).fill('/api/predictions/12124'),
  ...Array(40).fill('/api/predictions/11008'),
  ...Array(40).fill('/api/predictions/11322'),
  
  // 3,000 Station Board requests
  ...Array(30).fill('/api/stations/PUNE/board'),
  ...Array(30).fill('/api/stations/CSMT/board'),
  ...Array(30).fill('/api/stations/SUR/board'),
  ...Array(30).fill('/api/stations/NGP/board'),

  // 2,000 Analytics Corridor Trend requests
  ...Array(40).fill('/api/analytics/corridor-trend?corridor=CSMT-SUR&days=7'),
  ...Array(40).fill('/api/analytics/corridor-trend?corridor=CSMT-NGP&days=7'),

  // 1,000 Network & Fleet requests
  ...Array(20).fill('/api/network/stats'),
  ...Array(20).fill('/api/trains')
];

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 300,
  timeout: 10000
});

function makeRequest(path) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.get(
      {
        host: BASE_HOST,
        port: BASE_PORT,
        path: path,
        agent: agent
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const duration = performance.now() - start;
          const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
          resolve({
            success: isSuccess,
            statusCode: res.statusCode,
            duration,
            path
          });
        });
      }
    );

    req.on('error', (err) => {
      const duration = performance.now() - start;
      resolve({
        success: false,
        error: err.message,
        duration,
        path
      });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'TIMEOUT',
        duration: 8000,
        path
      });
    });
  });
}

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return {};
  const sorted = [...latencies].sort((a, b) => a - b);
  const p = (pct) => {
    const idx = Math.min(sorted.length - 1, Math.floor((pct / 100) * sorted.length));
    return Math.round(sorted[idx] * 100) / 100;
  };

  return {
    min: Math.round(sorted[0] * 100) / 100,
    p50: p(50),
    p90: p(90),
    p95: p(95),
    p99: p(99),
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    avg: Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 100) / 100
  };
}

async function runLoadTest() {
  console.log(`=============================================================`);
  console.log(`🚀 STARTING RAILMIND 10,000 DUMMY USER STRESS TEST`);
  console.log(`👥 Total Simulated Users / Requests: ${TOTAL_REQUESTS}`);
  console.log(`⚡ Concurrency Pool: ${CONCURRENCY} parallel workers`);
  console.log(`🎯 Target Services: Express (3008) + FastAPI ML Service (8008)`);
  console.log(`=============================================================\n`);

  const startTime = performance.now();
  let completed = 0;
  const results = [];
  let requestIndex = 0;

  // Worker loop
  async function worker() {
    while (true) {
      const idx = requestIndex++;
      if (idx >= TOTAL_REQUESTS) break;
      
      const endpoint = ENDPOINTS[idx % ENDPOINTS.length];
      const res = await makeRequest(endpoint);
      results.push(res);
      completed++;

      if (completed % 1000 === 0) {
        const elapsed = (performance.now() - startTime) / 1000;
        const rps = Math.round(completed / elapsed);
        console.log(`[Progress] Completed ${completed} / ${TOTAL_REQUESTS} users (${Math.round((completed / TOTAL_REQUESTS) * 100)}%) · Current Throughput: ${rps} req/s`);
      }
    }
  }

  const workers = Array(CONCURRENCY).fill(0).map(() => worker());
  await Promise.all(workers);

  const totalTimeSeconds = (performance.now() - startTime) / 1000;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errorRate = ((failed / TOTAL_REQUESTS) * 100).toFixed(2);
  const throughputRps = Math.round(TOTAL_REQUESTS / totalTimeSeconds);
  const latencies = results.map(r => r.duration);
  const stats = calculatePercentiles(latencies);

  console.log(`\n=============================================================`);
  console.log(`📊 10,000 DUMMY USER STRESS TEST RESULTS`);
  console.log(`=============================================================`);
  console.log(`⏱️  Total Duration:      ${totalTimeSeconds.toFixed(2)} seconds`);
  console.log(`⚡ Throughput:            ${throughputRps} Requests / Second`);
  console.log(`✅ Success Rate:          ${((successful / TOTAL_REQUESTS) * 100).toFixed(2)}% (${successful} / ${TOTAL_REQUESTS})`);
  console.log(`❌ Error Rate:            ${errorRate}% (${failed} failed)`);
  console.log(`-------------------------------------------------------------`);
  console.log(`📈 Latency Distribution (Round-Trip):`);
  console.log(`   • Min Latency:         ${stats.min} ms`);
  console.log(`   • Average Latency:     ${stats.avg} ms`);
  console.log(`   • p50 (Median):        ${stats.p50} ms`);
  console.log(`   • p90:                 ${stats.p90} ms`);
  console.log(`   • p95:                 ${stats.p95} ms`);
  console.log(`   • p99:                 ${stats.p99} ms`);
  console.log(`   • Max Latency:         ${stats.max} ms`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    const errorSample = results.filter(r => !r.success).slice(0, 5);
    console.log(`⚠️ Error Sample:`, JSON.stringify(errorSample, null, 2));
  }
}

runLoadTest().catch(console.error);
