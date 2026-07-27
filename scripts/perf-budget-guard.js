#!/usr/bin/env node
/**
 * Performance Budget Guard
 * Fails the build if bundle sizes exceed defined thresholds.
 * 
 * Usage: node scripts/perf-budget-guard.js [--ci]
 */

import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

const BUDGETS = {
  // Initial JS (entry + vendor chunks that load on first page)
  'initial-js-gzip': 300 * 1024, // 300 KB gzip
  
  // CSS budget
  'css-gzip': 100 * 1024, // 100 KB gzip
  
  // Individual chunk budgets (gzip)
  'chunk-vendor-react-gzip': 120 * 1024, // 120 KB
  'chunk-vendor-other-gzip': 100 * 1024, // 100 KB
  'chunk-vendor-animation-gzip': 50 * 1024, // 50 KB
  'chunk-vendor-map-gzip': 60 * 1024, // 60 KB (only loads on map pages)
  'chunk-vendor-i18n-gzip': 20 * 1024, // 20 KB
  'chunk-vendor-http-gzip': 20 * 1024, // 20 KB
  'chunk-vendor-icons-gzip': 15 * 1024, // 15 KB
  'chunk-vendor-query-gzip': 5 * 1024, // 5 KB
  
  // Total page weight budget (for main route)
  'total-page-weight-gzip': 1.5 * 1024 * 1024, // 1.5 MB
};

const DIST_DIR = path.resolve('src/frontend/web/dist');
const ASSETS_DIR = path.resolve('src/frontend/web/dist/assets');

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function getGzipSize(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return gzipSync(content).length;
  } catch {
    return 0;
  }
}

function findChunkFiles(pattern) {
  if (!fs.existsSync(ASSETS_DIR)) return [];
  const files = fs.readdirSync(ASSETS_DIR);
  return files.filter(f => f.match(pattern) && f.endsWith('.js'));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function checkBudgets() {
  console.log('📊 Performance Budget Check\n');
  console.log('='.repeat(60));
  
  let hasFailures = false;
  const results = [];
  
  // Check individual chunks
  const chunks = [
    { pattern: /^vendor-react-.*\.js$/, budget: 'chunk-vendor-react-gzip', label: 'vendor-react' },
    { pattern: /^vendor-other-.*\.js$/, budget: 'chunk-vendor-other-gzip', label: 'vendor-other' },
    { pattern: /^vendor-animation-.*\.js$/, budget: 'chunk-vendor-animation-gzip', label: 'vendor-animation (framer-motion)' },
    { pattern: /^vendor-map-.*\.js$/, budget: 'chunk-vendor-map-gzip', label: 'vendor-map (leaflet)' },
    { pattern: /^vendor-i18n-.*\.js$/, budget: 'chunk-vendor-i18n-gzip', label: 'vendor-i18n' },
    { pattern: /^vendor-http-.*\.js$/, budget: 'chunk-vendor-http-gzip', label: 'vendor-http (axios)' },
    { pattern: /^vendor-icons-.*\.js$/, budget: 'chunk-vendor-icons-gzip', label: 'vendor-icons (lucide)' },
    { pattern: /^vendor-query-.*\.js$/, budget: 'chunk-vendor-query-gzip', label: 'vendor-query (tanstack)' },
  ];
  
  let initialJsGzip = 0;
  
  for (const chunk of chunks) {
    const files = findChunkFiles(chunk.pattern);
    if (files.length === 0) continue;
    
    const file = files[0];
    const filePath = path.join(ASSETS_DIR, file);
    const rawSize = getFileSize(filePath);
    const gzipSize = getGzipSize(filePath);
    const budget = BUDGETS[chunk.budget];
    const passed = gzipSize <= budget;
    
    if (!passed) hasFailures = true;
    
    // Chunks that load on initial page (not lazy-loaded routes)
    const isInitialChunk = ['vendor-react', 'vendor-other', 'vendor-animation', 'vendor-icons', 'vendor-i18n', 'vendor-http', 'vendor-query'].includes(chunk.label.split(' ')[0].replace('vendor-', 'vendor-'));
    if (isInitialChunk) {
      initialJsGzip += gzipSize;
    }
    
    results.push({
      label: chunk.label,
      raw: formatBytes(rawSize),
      gzip: formatBytes(gzipSize),
      budget: formatBytes(budget),
      status: passed ? '✅ PASS' : '❌ FAIL',
    });
  }
  
  // Check initial JS budget
  const initialBudget = BUDGETS['initial-js-gzip'];
  const initialPassed = initialJsGzip <= initialBudget;
  if (!initialPassed) hasFailures = true;
  results.push({
    label: 'TOTAL INITIAL JS (gzip)',
    raw: formatBytes(0),
    gzip: formatBytes(initialJsGzip),
    budget: formatBytes(initialBudget),
    status: initialPassed ? '✅ PASS' : '❌ FAIL',
  });
  
  // Check CSS
  const cssFiles = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.css'));
  let totalCssGzip = 0;
  for (const cssFile of cssFiles) {
    const filePath = path.join(ASSETS_DIR, cssFile);
    totalCssGzip += getGzipSize(filePath);
  }
  const cssBudget = BUDGETS['css-gzip'];
  const cssPassed = totalCssGzip <= cssBudget;
  if (!cssPassed) hasFailures = true;
  results.push({
    label: 'TOTAL CSS (gzip)',
    raw: formatBytes(0),
    gzip: formatBytes(totalCssGzip),
    budget: formatBytes(cssBudget),
    status: cssPassed ? '✅ PASS' : '❌ FAIL',
  });
  
  // Check total page weight (HTML + initial JS + CSS)
  const htmlPath = path.join(DIST_DIR, 'index.html');
  const htmlGzip = getGzipSize(htmlPath);
  const totalPageWeight = htmlGzip + initialJsGzip + totalCssGzip;
  const pageBudget = BUDGETS['total-page-weight-gzip'];
  const pagePassed = totalPageWeight <= pageBudget;
  if (!pagePassed) hasFailures = true;
  results.push({
    label: 'TOTAL PAGE WEIGHT (gzip)',
    raw: formatBytes(0),
    gzip: formatBytes(totalPageWeight),
    budget: formatBytes(pageBudget),
    status: pagePassed ? '✅ PASS' : '❌ FAIL',
  });
  
  // Print results table
  const colWidths = {
    label: Math.max(...results.map(r => r.label.length), 'Metric'.length),
    raw: 10,
    gzip: 10,
    budget: 10,
    status: 10,
  };
  
  const header = `  ${'Metric'.padEnd(colWidths.label)}  ${'Raw'.padEnd(colWidths.raw)}  ${'Gzip'.padEnd(colWidths.gzip)}  ${'Budget'.padEnd(colWidths.budget)}  ${'Status'.padEnd(colWidths.status)}`;
  console.log(header);
  console.log('  ' + '-'.repeat(header.length - 2));
  
  for (const r of results) {
    console.log(`  ${r.label.padEnd(colWidths.label)}  ${r.raw.padEnd(colWidths.raw)}  ${r.gzip.padEnd(colWidths.gzip)}  ${r.budget.padEnd(colWidths.budget)}  ${r.status.padEnd(colWidths.status)}`);
  }
  
  console.log('='.repeat(60));
  
  if (hasFailures) {
    console.log('\n❌ PERFORMANCE BUDGET EXCEEDED\n');
    console.log('Recommendations:');
    console.log('  - Lazy load heavy components (charts, maps, editors)');
    console.log('  - Split vendor-other into smaller chunks');
    console.log('  - Remove unused dependencies');
    console.log('  - Optimize images (WebP/AVIF, responsive sizes)');
    process.exit(1);
  } else {
    console.log('\n✅ ALL PERFORMANCE BUDGETS MET\n');
    process.exit(0);
  }
}

checkBudgets();