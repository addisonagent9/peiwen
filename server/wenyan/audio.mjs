/**
 * 文言教材 audio endpoint (#26 stage D-2).
 *
 * Serves approved Yunxi audio clips by usage_context tag. Designed to be
 * mounted on the wenyan router, inheriting requireAuth + requireWenyanAdmin
 * gates from server/wenyan/index.mjs.
 *
 * GET /audio?tag=<wenyan:...>
 *   200  audio/mpeg                       — file streamed
 *   400  { error: 'INVALID_TAG' }         — missing/empty/oversized tag
 *   400  { error: 'INVALID_TAG_PREFIX' }  — tag doesn't start with 'wenyan:'
 *   404  { error: 'AUDIO_NOT_FOUND' }     — no approved row matches the tag
 *   500  { error: 'AUDIO_FILE_MISSING' }  — DB row points to a missing file
 */

import fsp from 'fs/promises';
import { existsSync } from 'fs';

const TAG_MAX_LENGTH = 200;

export function mountWenyanAudio(router, db) {
  const stmtFindAudio = db.prepare(`
    SELECT file_path FROM audio_clips
    WHERE status = 'approved'
      AND voice_id = 'zh-CN-YunxiNeural'
      AND usage_context LIKE ?
    LIMIT 1
  `);

  router.get('/audio', async (req, res, next) => {
    try {
      const tag = req.query.tag;
      if (typeof tag !== 'string' || tag.length === 0 || tag.length > TAG_MAX_LENGTH) {
        return res.status(400).json({ error: 'INVALID_TAG' });
      }
      if (!tag.startsWith('wenyan:')) {
        return res.status(400).json({ error: 'INVALID_TAG_PREFIX' });
      }

      // Match the tag inside the JSON usage_context array. Wenyan rows
      // store usage_context as `["wenyan:vocab:..."]` etc., so the quoted
      // tag substring is unambiguous within the (status, voice_id) scope.
      const likePattern = `%"${tag}"%`;
      const row = stmtFindAudio.get(likePattern);

      if (!row || !row.file_path) {
        return res.status(404).json({ error: 'AUDIO_NOT_FOUND', tag });
      }

      if (!existsSync(row.file_path)) {
        return res.status(500).json({ error: 'AUDIO_FILE_MISSING', tag });
      }

      const audio = await fsp.readFile(row.file_path);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', String(audio.length));
      // Long private cache: file_path is content-addressed (SHA-256 of
      // text+voice+provider), so any regen produces a NEW path → no
      // invalidation race. `private` because admin-gated.
      res.setHeader('Cache-Control', 'private, max-age=31536000');
      res.send(audio);
    } catch (err) {
      next(err);
    }
  });
}
