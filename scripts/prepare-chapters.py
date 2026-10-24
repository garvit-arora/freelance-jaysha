from pathlib import Path
import subprocess,sys
sys.path.insert(0,str(Path('.tools/python').resolve()))
import imageio_ffmpeg
exe=imageio_ffmpeg.get_ffmpeg_exe()
out=Path('.tools/chapter-media');out.mkdir(parents=True,exist_ok=True)
for name in ['chapter5.MP4','v1.MP4','v2.MOV','v3.MOV','chapter7.MOV']:
 src=Path('public/chapters')/name;target=out/(src.stem+'.mp4');poster=out/(src.stem+'-poster.jpg')
 if not target.exists():
  subprocess.run([exe,'-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-map','0:a:0?','-vf',"scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",'-c:v','libx264','-preset','veryfast','-crf','25','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
 if not poster.exists(): subprocess.run([exe,'-hide_banner','-loglevel','error','-y','-ss','0.3','-i',str(target),'-frames:v','1',str(poster)],check=True)
 print(name,round(src.stat().st_size/1e6,1),'MB ->',round(target.stat().st_size/1e6,1),'MB',flush=True)
