/**
 * Audio module unit tests.
 *
 * Run with:
 *   node --test server/audio/audio.test.mjs
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import path from 'path';

import { AudioCache } from './cache.mjs';
import { AudioService } from './service.mjs';
import { NullAudioProvider, AudioUnavailableError } from './provider.mjs';
import { AzureAudioProvider } from './azure-provider.mjs';

let tmpRoot;

before(async () => {
  tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'pw-audio-test-'));
});
after(async () => {
  await fsp.rm(tmpRoot, { recursive: true, force: true });
});

describe('AudioCache', () => {
  it('put → get round-trips the bytes', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c1') });
    const payload = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    await cache.put('东', 'zh-TW-HsiaoChenNeural', payload);
    const got = await cache.get('东', 'zh-TW-HsiaoChenNeural');
    assert.ok(got, 'expected cache hit');
    assert.deepEqual(Array.from(got.audio), [0x01, 0x02, 0x03, 0x04]);
    assert.equal(got.mimeType, 'audio/mpeg');
    assert.equal(got.sizeBytes, 4);
  });

  it('get returns null for missing entries (no throw)', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c2') });
    const got = await cache.get('never-cached', 'zh-TW-HsiaoChenNeural');
    assert.equal(got, null);
  });

  it('has reflects presence', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c3') });
    assert.equal(await cache.has('x', 'zh-TW-HsiaoChenNeural'), false);
    await cache.put('x', 'zh-TW-HsiaoChenNeural', Buffer.from([1]));
    assert.equal(await cache.has('x', 'zh-TW-HsiaoChenNeural'), true);
  });

  it('delete is safe for nonexistent entries', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c4') });
    await cache.delete('nothing', 'zh-TW-HsiaoChenNeural');
    // No throw = pass
  });

  it('different voices produce different cache entries', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c5') });
    const voiceA = 'zh-TW-HsiaoChenNeural';
    await cache.put('月', voiceA, Buffer.from([0xaa]));
    const got = await cache.get('月', voiceA);
    assert.ok(got);
    assert.equal(got.audio[0], 0xaa);
  });

  it('atomic writes: concurrent puts do not corrupt', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c6') });
    const writes = Array.from({ length: 10 }, (_, i) =>
      cache.put('同', 'zh-TW-HsiaoChenNeural', Buffer.from([i, i, i, i])),
    );
    await Promise.all(writes);
    const got = await cache.get('同', 'zh-TW-HsiaoChenNeural');
    assert.ok(got);
    assert.equal(got.audio.length, 4);
    const firstByte = got.audio[0];
    assert.ok(firstByte >= 0 && firstByte <= 9);
    assert.deepEqual(
      Array.from(got.audio),
      [firstByte, firstByte, firstByte, firstByte],
    );
  });

  it('size() aggregates across the whole tree', async () => {
    const cache = new AudioCache({ rootDir: path.join(tmpRoot, 'c7') });
    await cache.put('a', 'zh-TW-HsiaoChenNeural', Buffer.alloc(100));
    await cache.put('b', 'zh-TW-HsiaoChenNeural', Buffer.alloc(200));
    const s = await cache.size();
    assert.equal(s.fileCount, 2);
    assert.equal(s.totalBytes, 300);
  });
});

describe('NullAudioProvider', () => {
  it('reports unavailable', () => {
    const p = new NullAudioProvider();
    assert.equal(p.isAvailable(), false);
    assert.equal(p.name, 'null');
  });

  it('throws AudioUnavailableError on synthesize', async () => {
    const p = new NullAudioProvider();
    await assert.rejects(
      () => p.synthesize({ text: '东' }),
      AudioUnavailableError,
    );
  });
});

describe('AzureAudioProvider (no network)', () => {
  it('reports unavailable with missing key', () => {
    const p = new AzureAudioProvider({ apiKey: '', region: 'eastus' });
    assert.equal(p.isAvailable(), false);
  });

  it('reports unavailable with missing region', () => {
    const p = new AzureAudioProvider({ apiKey: 'xxx', region: '' });
    assert.equal(p.isAvailable(), false);
  });

  it('reports available with both set', () => {
    const p = new AzureAudioProvider({ apiKey: 'xxx', region: 'eastus' });
    assert.equal(p.isAvailable(), true);
  });
});

describe('AudioService', () => {
  it('uses null provider when no Azure config', () => {
    const dir = path.join(tmpRoot, 's1');
    const svc = new AudioService({ cacheDir: dir });
    assert.equal(svc.providerName, 'null');
    assert.equal(svc.isAvailable(), false);
  });

  it('uses Azure provider when config provided', () => {
    const dir = path.join(tmpRoot, 's2');
    const svc = new AudioService({
      cacheDir: dir,
      azure: { apiKey: 'xxx', region: 'eastus' },
    });
    assert.equal(svc.providerName, 'azure-speech');
    assert.equal(svc.isAvailable(), true);
  });

  it('serves from cache without calling provider', async () => {
    const dir = path.join(tmpRoot, 's3');
    const cache = new AudioCache({ rootDir: dir });
    await cache.put('东', 'zh-TW-HsiaoChenNeural', Buffer.from([0xff, 0xfe]));

    const svc = new AudioService({ cacheDir: dir });
    const result = await svc.synthesize('东', 'zh-TW-HsiaoChenNeural');
    assert.equal(result.cacheHit, true);
    assert.deepEqual(Array.from(result.audio), [0xff, 0xfe]);
  });

  it('throws AudioUnavailableError when no provider and no cache', async () => {
    const dir = path.join(tmpRoot, 's4');
    const svc = new AudioService({ cacheDir: dir });
    await assert.rejects(
      () => svc.synthesize('completely-new-text-never-cached'),
      AudioUnavailableError,
    );
  });

  it('rejects empty text', async () => {
    const dir = path.join(tmpRoot, 's5');
    const svc = new AudioService({ cacheDir: dir });
    await assert.rejects(() => svc.synthesize(''), /Empty text/);
    await assert.rejects(() => svc.synthesize('   '), /Empty text/);
  });
});

describe('Azure SSML construction (private behavior via fetch mock)', () => {
  it('wraps plain text in <speak> with correct voice and locale', async () => {
    const p = new AzureAudioProvider({ apiKey: 'test', region: 'eastus' });

    const originalFetch = globalThis.fetch;
    let capturedBody = '';
    let capturedHeaders = {};
    globalThis.fetch = async (url, init) => {
      capturedBody = init.body;
      capturedHeaders = init.headers;
      return new Response(new ArrayBuffer(100), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    };

    try {
      await p.synthesize({ text: '东风' });
      assert.match(capturedBody, /<speak[^>]+xml:lang="zh-TW"/);
      assert.match(capturedBody, /<voice name="zh-TW-HsiaoChenNeural">/);
      assert.match(capturedBody, /东风/);
      assert.equal(capturedHeaders['Ocp-Apim-Subscription-Key'], 'test');
      assert.equal(capturedHeaders['Content-Type'], 'application/ssml+xml');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('escapes XML-significant characters in plain text', async () => {
    const p = new AzureAudioProvider({ apiKey: 'test', region: 'eastus' });
    const originalFetch = globalThis.fetch;
    let capturedBody = '';
    globalThis.fetch = async (_url, init) => {
      capturedBody = init.body;
      return new Response(new ArrayBuffer(0));
    };

    try {
      await p.synthesize({ text: 'a & b < c > d' });
      assert.match(capturedBody, /a &amp; b &lt; c &gt; d/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
