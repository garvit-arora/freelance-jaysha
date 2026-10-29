# Song dedications

Audio starts only when the Song Button on `/magic-buttons` is clicked. Each click plays another shuffled selection without a popup. Escape stops playback, and leaving Magic Buttons also stops it. The welcome page has its own speaker for the first 26 seconds of the selected welcome song. It attempts autoplay on load and starts on any click if the browser blocks autoplay. No floating speaker is shown on other pages.

The collection includes 48 original Shorts, 26 ImageKit-hosted compilation segments, and 24 new dedications (23 Shorts plus the 0:26?1:20 excerpt from `9cSi5bt9MtY`).

## Download tools

- `npm run songs:download`: refresh the original Shorts MP3 collection.
- `npm run songs:download:additional`: refresh the new batch, including the timed excerpt.
- `node scripts/extract-song-clips.mjs` then `node scripts/upload-song-audio.mjs`: refresh compilation segments and their ImageKit links.

The downloader reuses completed MP3s and reports failures. Files are saved in `public/shorts-audio`, with manifests in `src/shorts-audio.json` and `src/additional-song-audio.json`. It does not access browser cookies or accounts.

Install yt-dlp with `python -m pip install --target .tools/python yt-dlp`. The tools use the project FFmpeg installation; set `FFMPEG_PATH` to use another executable.

The compilation source video and extracted local compilation clips are ignored by Git and excluded from the production build. Hosted references are saved in `src/song-clips.json`.
