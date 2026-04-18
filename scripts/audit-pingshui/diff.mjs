#!/usr/bin/env node
// Diff our dictionary against consensus and produce audit report
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const auditDir = resolve(root, 'data/audit');

const ours = JSON.parse(readFileSync(resolve(auditDir, 'ours.json'), 'utf8'));
const consensus = JSON.parse(readFileSync(resolve(auditDir, 'consensus.json'), 'utf8'));

const findings = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };

const ourChars = new Set(Object.keys(ours));
const consChars = new Set(Object.keys(consensus));

// Stats
let inBoth = 0, onlyOurs = 0, onlyConsensus = 0;

// Check each char in consensus
for (const [ch, con] of Object.entries(consensus)) {
  if (!ourChars.has(ch)) {
    // In consensus but missing from ours
    if (con.presentIn.length >= 2) {
      findings.HIGH.push({
        char: ch,
        issue: 'missing from our dictionary',
        consensus: con.readings.filter(r => r.confirmed).map(r => `${r.tone}/${r.rhyme}`).join(', '),
        sources: con.presentIn.join(', '),
      });
    }
    onlyConsensus++;
    continue;
  }

  inBoth++;
  const ourReadings = ours[ch];
  const ourDefault = ourReadings[0]; // first reading is default

  // Get confirmed consensus readings
  const confirmedReadings = con.readings.filter(r => r.confirmed);
  const allRefReadings = con.readings;

  if (confirmedReadings.length === 0) {
    // No confirmed reading — single-source only
    // Check if our default matches any ref reading at all
    const matchesAny = allRefReadings.some(r => r.tone === ourDefault.tone && r.rhyme === ourDefault.rhyme);
    if (!matchesAny && allRefReadings.length > 0) {
      findings.MEDIUM.push({
        char: ch,
        issue: 'our default not in any single-source ref reading',
        ours: `${ourDefault.tone}/${ourDefault.rhyme}`,
        refs: allRefReadings.map(r => `${r.tone}/${r.rhyme} (${r.sources.join(',')})`).join('; '),
      });
    }
    continue;
  }

  // Check if our default matches any confirmed reading
  const defaultMatchesConfirmed = confirmedReadings.some(
    r => r.tone === ourDefault.tone && r.rhyme === ourDefault.rhyme
  );

  if (!defaultMatchesConfirmed) {
    // Our default disagrees with consensus
    // Check if any of our secondary readings match confirmed
    const anyOurReadingMatchesConfirmed = ourReadings.some(our =>
      confirmedReadings.some(r => r.tone === our.tone && r.rhyme === our.rhyme)
    );

    if (!anyOurReadingMatchesConfirmed) {
      // CRITICAL: our default disagrees AND none of our readings match consensus
      findings.CRITICAL.push({
        char: ch,
        issue: 'default disagrees with consensus, not even in secondary readings',
        ours: ourReadings.map(r => `${r.tone}/${r.rhyme}`).join(', '),
        consensus: confirmedReadings.map(r => `${r.tone}/${r.rhyme} (${r.sources.join(',')})`).join('; '),
      });
    } else {
      // HIGH: default is wrong but we have the right reading as secondary
      findings.HIGH.push({
        char: ch,
        issue: 'default reading disagrees with consensus (correct reading exists in secondary)',
        oursDefault: `${ourDefault.tone}/${ourDefault.rhyme}`,
        oursAll: ourReadings.map(r => `${r.tone}/${r.rhyme}`).join(', '),
        consensus: confirmedReadings.map(r => `${r.tone}/${r.rhyme} (${r.sources.join(',')})`).join('; '),
      });
    }
  }

  // Also check: our default not in ANY ref reading at all
  const defaultInAnyRef = allRefReadings.some(
    r => r.tone === ourDefault.tone && r.rhyme === ourDefault.rhyme
  );
  if (!defaultInAnyRef && !defaultMatchesConfirmed) {
    // Already captured above, but flag if not
  }
}

// Check chars only in ours
for (const ch of ourChars) {
  if (!consChars.has(ch)) {
    onlyOurs++;
    findings.LOW.push({ char: ch });
  }
}

// ─── Previously patched chars ───
// Check both simplified and traditional forms of patched chars
const patchedChars = ['种', '据', '干', '肮', '睾', '宁', '听', '几', '徑', '研',
                      '種', '據', '幹', '骯', '寧', '聽', '幾'];
const patchedCharsExt = [...new Set(patchedChars)];
const patchedReport = [];

for (const ch of [...new Set(patchedCharsExt)]) {
  const ourR = ours[ch];
  const conR = consensus[ch];
  if (!ourR && !conR) continue;

  const entry = {
    char: ch,
    ours: ourR ? ourR.map(r => `${r.tone}/${r.rhyme}`).join(', ') : 'MISSING',
    consensus: 'N/A',
    status: '?',
  };

  if (conR) {
    const confirmed = conR.readings.filter(r => r.confirmed);
    entry.consensus = confirmed.length > 0
      ? confirmed.map(r => `${r.tone}/${r.rhyme} (${r.sources.join(',')})`).join('; ')
      : conR.readings.map(r => `${r.tone}/${r.rhyme} (${r.sources.join(',')})`).join('; ') + ' [unconfirmed]';

    if (ourR && confirmed.length > 0) {
      const defaultOk = confirmed.some(r => r.tone === ourR[0].tone && r.rhyme === ourR[0].rhyme);
      entry.status = defaultOk ? 'OK' : 'MISMATCH';
    } else if (ourR) {
      entry.status = 'no consensus';
    }
  } else {
    entry.consensus = 'not in any reference';
    entry.status = ourR ? 'unique to us' : 'missing everywhere';
  }

  patchedReport.push(entry);
}

// ─── Generate report ───
const lines = [];
lines.push('# Pingshui Dictionary Audit Report v2');
lines.push('');
lines.push(`Generated: ${new Date().toISOString().split('T')[0]}`);
lines.push('');
lines.push('## Coverage Statistics');
lines.push('');
lines.push(`| Metric | Count |`);
lines.push(`|--------|-------|`);
lines.push(`| Our dictionary chars | ${ourChars.size} |`);
lines.push(`| Consensus chars (union of 3 refs) | ${consChars.size} |`);
lines.push(`| In both | ${inBoth} |`);
lines.push(`| Only in ours | ${onlyOurs} |`);
lines.push(`| Only in consensus | ${onlyConsensus} |`);
lines.push('');
lines.push('## Findings Summary');
lines.push('');
lines.push(`| Severity | Count |`);
lines.push(`|----------|-------|`);
lines.push(`| CRITICAL | ${findings.CRITICAL.length} |`);
lines.push(`| HIGH | ${findings.HIGH.length} |`);
lines.push(`| MEDIUM | ${findings.MEDIUM.length} |`);
lines.push(`| LOW | ${findings.LOW.length} |`);
lines.push('');

// CRITICAL
lines.push('## CRITICAL Findings');
lines.push('');
lines.push('Default reading disagrees with consensus AND consensus reading not even in our secondary readings.');
lines.push('');
if (findings.CRITICAL.length === 0) {
  lines.push('None found.');
} else {
  lines.push('| Char | Our Readings | Consensus | Issue |');
  lines.push('|------|-------------|-----------|-------|');
  for (const f of findings.CRITICAL.slice(0, 200)) {
    lines.push(`| ${f.char} | ${f.ours} | ${f.consensus} | ${f.issue} |`);
  }
  if (findings.CRITICAL.length > 200) {
    lines.push(`| ... | ... | ... | (${findings.CRITICAL.length - 200} more) |`);
  }
}
lines.push('');

// HIGH
lines.push('## HIGH Findings');
lines.push('');
lines.push('Default reading wrong (but may exist in secondary), or char in consensus but missing from ours.');
lines.push('');
if (findings.HIGH.length === 0) {
  lines.push('None found.');
} else {
  lines.push('| Char | Issue | Details |');
  lines.push('|------|-------|---------|');
  const highSample = findings.HIGH.slice(0, 200);
  for (const f of highSample) {
    if (f.issue === 'missing from our dictionary') {
      lines.push(`| ${f.char} | missing | consensus: ${f.consensus} (${f.sources}) |`);
    } else {
      lines.push(`| ${f.char} | default mismatch | default: ${f.oursDefault}, consensus: ${f.consensus} |`);
    }
  }
  if (findings.HIGH.length > 200) {
    lines.push(`| ... | ... | (${findings.HIGH.length - 200} more) |`);
  }
}
lines.push('');

// MEDIUM
lines.push('## MEDIUM Findings');
lines.push('');
lines.push('Our default not matching any single-source reference reading.');
lines.push('');
if (findings.MEDIUM.length === 0) {
  lines.push('None found.');
} else {
  lines.push('| Char | Our Default | Ref Readings |');
  lines.push('|------|------------|-------------|');
  const medSample = findings.MEDIUM.slice(0, 100);
  for (const f of medSample) {
    lines.push(`| ${f.char} | ${f.ours} | ${f.refs} |`);
  }
  if (findings.MEDIUM.length > 100) {
    lines.push(`| ... | ... | (${findings.MEDIUM.length - 100} more) |`);
  }
}
lines.push('');

// LOW
lines.push('## LOW Findings');
lines.push('');
lines.push(`${findings.LOW.length} chars in our dictionary but not in any reference.`);
lines.push('');
if (findings.LOW.length > 0) {
  lines.push('Sample (first 30):');
  lines.push('');
  lines.push('```');
  lines.push(findings.LOW.slice(0, 30).map(f => f.char).join(' '));
  lines.push('```');
}
lines.push('');

// Appendix: patched chars
lines.push('## Appendix: Previously Patched Characters');
lines.push('');
lines.push('Cross-referencing our 10 previously-patched chars against consensus.');
lines.push('');
lines.push('| Char | Our Readings | Consensus | Status |');
lines.push('|------|-------------|-----------|--------|');
for (const p of patchedReport) {
  lines.push(`| ${p.char} | ${p.ours} | ${p.consensus} | ${p.status} |`);
}
lines.push('');

const report = lines.join('\n');
writeFileSync(resolve(root, 'dictionary-audit-v2.md'), report);
console.log(`[diff] report written to dictionary-audit-v2.md`);
console.log(`[diff] CRITICAL: ${findings.CRITICAL.length}, HIGH: ${findings.HIGH.length}, MEDIUM: ${findings.MEDIUM.length}, LOW: ${findings.LOW.length}`);
console.log('[diff] done');
