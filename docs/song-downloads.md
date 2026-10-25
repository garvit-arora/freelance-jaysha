# Shorts MP3 collection

Run `npm run songs:download` from the project folder. The downloader reads the 48 Shorts in `src/song-dedications.json`, saves MP3 files in `public/shorts-audio`, and updates `src/shorts-audio.json`. Finished files are reused on subsequent runs, and unavailable videos are reported separately. It does not access browser cookies or logged-in accounts.

Dependencies: `python -m pip install --target .tools/python yt-dlp`, and FFmpeg. The script uses the project FFmpeg installation by default; set `FFMPEG_PATH` to use another executable.

The speaker uses the downloaded MP3 collection. Each speaker click plays the next shuffled MP3 in the background without a popup. Escape stops playback. The Magic Buttons song collection continues to use the 26 audio segments from the supplied compilation.

On the welcome screen, the first click starts a random audio segment from the supplied compilation. These 26 clips are hosted on ImageKit; the source video and local extracted clips are ignored by Git. Run `node scripts/extract-song-clips.mjs` then `node scripts/upload-song-audio.mjs` to refresh them. The speaker uses compilation clips on the welcome screen and downloaded Shorts elsewhere.
