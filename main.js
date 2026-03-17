const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        backgroundColor: '#0f0f0f', // Matches your luxury dark theme
        titleBarStyle: 'hiddenInset', // Makes it look like a premium Mac/Win app
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Allows renderer.js to use 'require' for Python
        },
    });

    win.loadFile('index.html');

    // Optional: Open DevTools while you are building
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});