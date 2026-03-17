const { spawn } = require('child_process');
const path = require('path');

// DOM Elements
const urlInput = document.getElementById('url');
const resSelect = document.getElementById('resolution');
const downloadBtn = document.getElementById('download-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('p-container');
const statusText = document.getElementById('status');

// Helper to get the correct path to engine.py
const enginePath = path.join(__dirname, 'engine.py');

/**
 * PHASE 1: PREVIEW MODE
 * Automatically fetches Title and Thumbnail when a link is pasted
 */
urlInput.addEventListener('input', () => {
    const url = urlInput.value.trim();
    if (url.length < 10) return;

    statusText.innerText = "Analyzing link...";

    // Call engine.py in 'info' mode with -u for unbuffered output
    const infoProcess = spawn('python', ['-u', enginePath, 'info', url]);

    let jsonData = "";
    infoProcess.stdout.on('data', (data) => { jsonData += data; });

    infoProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const info = JSON.parse(jsonData);
                statusText.innerText = `Detected: ${info.title}`;
                console.log("Video Data Captured:", info);
            } catch (e) {
                statusText.innerText = "Link detected (Universal Extractor Active)";
            }
        }
    });

    infoProcess.on('error', (err) => {
        console.error("Info Process Spawn Error:", err);
        statusText.innerText = "Error: Python engine failed to start.";
    });
});

/**
 * PHASE 2: DOWNLOAD MODE
 * Starts the universal download process
 */
downloadBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    const res = resSelect.value;

    if (!url) {
        statusText.innerText = "Please provide a valid URL";
        return;
    }

    // UI Reset
    statusText.innerText = "Warming up engine...";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    downloadBtn.disabled = true;

    // Call engine.py in 'download' mode with -u for unbuffered output
    const downloadProcess = spawn('python', ['-u', enginePath, 'download', url, res]);

    downloadProcess.stdout.on('data', (data) => {
        const output = data.toString();

        // Parse the PROGRESS:XX% format we built in the engine
        if (output.includes("PROGRESS:")) {
            const rawPercent = output.split("PROGRESS:")[1].trim();
            const percent = rawPercent.replace('%', '');

            // Update the UI Bar
            progressBar.style.width = `${percent}%`;
            statusText.innerText = `Downloading: ${percent}%`;
        }
    });

    downloadProcess.stderr.on('data', (data) => {
        console.error(`Engine Error: ${data}`);
    });

    downloadProcess.on('close', (code) => {
        downloadBtn.disabled = false;
        if (code === 0) {
            statusText.innerText = "Download Complete! Saved to project folder.";
            progressBar.style.width = "100%";
            progressBar.style.background = "#28a745"; // Success green
        } else {
            statusText.innerText = "Error: Check URL or Site compatibility.";
            progressBar.style.background = "#dc3545"; // Error red
        }
    });

    downloadProcess.on('error', (err) => {
        console.error("Download Process Spawn Error:", err);
        statusText.innerText = "Fatal: Engine failed to start!";
        downloadBtn.disabled = false;
    });
});