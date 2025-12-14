#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function fetchWithFallback(url) {
  try {
    // Try native fetch first (Node 18+)
    if (typeof fetch !== 'undefined') {
      return await fetch(url);
    }
    
    // Fallback to https module for older Node versions
    const https = await import('node:https');
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => new Promise((jsonResolve, jsonReject) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                jsonResolve(JSON.parse(data));
              } catch (e) {
                jsonReject(e);
              }
            });
          })
        });
      });
      req.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

async function runSmokeTest() {
  try {
    console.log('🧪 Running smoke tests...');
    
    // Test health endpoint
    console.log('  ✓ Testing /healthz endpoint...');
    const healthResponse = await fetchWithFallback(`${BASE_URL}/healthz`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed with status ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    if (healthData.status !== 'ok') {
      throw new Error(`Health check returned invalid status: ${healthData.status}`);
    }
    
    // Test workspace endpoint
    console.log('  ✓ Testing /workspace endpoint...');
    const workspaceResponse = await fetchWithFallback(`${BASE_URL}/workspace`);
    if (!workspaceResponse.ok) {
      throw new Error(`Workspace endpoint failed with status ${workspaceResponse.status}`);
    }
    
    console.log('✅ Smoke passed');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Smoke test failed: ${error.message}`);
    process.exit(1);
  }
}

runSmokeTest();
