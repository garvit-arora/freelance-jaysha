"""Download the supplied public Shorts and convert successful downloads to MP3.

Run: python scripts/download-shorts.py [--limit 1]
Prerequisite: python -m pip install --target .tools/python yt-dlp
Unavailable videos are reported, without accessing browser cookies or accounts.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / '.tools/python'))
import yt_dlp

parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int)
parser.add_argument('--source', default='src/song-dedications.json')
parser.add_argument('--manifest', default='src/shorts-audio.json')
parser.add_argument('--include-clips', action='store_true')
parser.add_argument('--workers', type=int, default=4)
args = parser.parse_args()
ffmpeg = os.environ.get('FFMPEG_PATH', str(ROOT / '.tools/python/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'))
songs = [song for song in json.loads((ROOT / args.source).read_text()) if song['short'] or args.include_clips]
if args.limit:
    songs = songs[:args.limit]
output = ROOT / 'public/shorts-audio'
output.mkdir(parents=True, exist_ok=True)
cache = ROOT / '.tools/shorts-downloads'
cache.mkdir(parents=True, exist_ok=True)
manifest_path = ROOT / args.manifest
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
failed = []
def download(song):
    video_id = song['id']
    file_id = video_id if song.get('short') else f"{video_id}-{song.get('start',0)}-{song.get('end','end')}"
    destination = output / f'{file_id}.mp3'
    try:
        if not destination.exists() or destination.stat().st_size == 0:
            options = {'format': 'bestaudio/best', 'outtmpl': str(cache / '%(id)s.%(ext)s'),
                       'noplaylist': True, 'socket_timeout': 15, 'retries': 1,
                       'quiet': True, 'noprogress': True, 'js_runtimes': {'node': {}}}
            with yt_dlp.YoutubeDL(options) as downloader:
                info = downloader.extract_info(f'https://www.youtube.com/shorts/{video_id}', download=True)
                source = downloader.prepare_filename(info)
            temporary = destination.with_suffix('.partial.mp3')
            command = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-y']
            if song.get('start'): command += ['-ss', str(song['start'])]
            command += ['-i', source]
            if song.get('end'): command += ['-t', str(song['end'] - song.get('start', 0))]
            command += ['-vn', '-c:a', 'libmp3lame', '-b:a', '160k', str(temporary)]
            subprocess.run(command, check=True)
            temporary.replace(destination)
        entry = {'id': video_id, 'url': f'/shorts-audio/{file_id}.mp3'}
        return entry
    except Exception as error:
        print(f'Unavailable: {video_id}: {error}', flush=True)
        return None

with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 4))) as pool:
    tasks = {pool.submit(download, song): song['id'] for song in songs}
    for task in as_completed(tasks):
        entry = task.result()
        if entry:
            manifest = [item for item in manifest if item['id'] != entry['id']] + [entry]
            manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
            print('Ready:', entry['id'], flush=True)
        else:
            failed.append(tasks[task])
print(f'{len(manifest)} MP3s ready; {len(failed)} unavailable in this run.')
if failed:
    sys.exit(1)
