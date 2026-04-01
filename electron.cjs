const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 600,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, "public/icon.png"),
    });

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        // Fix: use the correct path to built files
        win.loadFile(path.join(__dirname, "dist/index.html"));
    }

    // Uncomment this to debug what's happening:
    // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});