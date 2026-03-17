import subprocess
import sys
import os
import json

# Setup Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIN_PATH = os.path.join(BASE_DIR, 'resources', 'bin')
YT_DLP_EXE = os.path.join(BIN_PATH, 'yt-dlp.exe')

def get_info(url):
    """Fetches metadata (Title, Thumbnail, Formats) without downloading."""
    command = [
        YT_DLP_EXE,
        "--dump-json",
        "--no-playlist",
        url
    ]
    result = subprocess.run(command, capture_output=True, text=True, encoding='utf-8')
    return result.stdout

def download_universal(url, resolution="1080"):
    """Downloads from any of the 1700+ supported sites."""
    command = [
        YT_DLP_EXE,
        url,
        "--ffmpeg-location", BIN_PATH,
        # The 'bestvideo+bestaudio' logic is universal across all sites
        "-f", f"bestvideo[height<={resolution}]+bestaudio/best",
        "--merge-output-format", "mp4",
        "--newline", # Crucial for Electron to read progress line-by-line
        "--progress-template", "PROGRESS:%(progress._percent_str)s",
        "--no-mtime"
    ]
    
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
    
    for line in process.stdout:
        # This sends clean progress to your Electron UI (e.g., PROGRESS:10%)
        print(line.strip(), flush=True)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        mode = sys.argv[1] # 'info' or 'download'
        link = sys.argv[2]
        
        if mode == "info":
            print(get_info(link))
        elif mode == "download":
            res = sys.argv[3] if len(sys.argv) > 3 else "1080"
            download_universal(link, res)