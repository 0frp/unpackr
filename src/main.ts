import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { extractArchive } from "./extraction";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 980,
    minHeight: 680,
    title: "Unpackr",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(join(__dirname, "renderer.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("pickArchive", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select archive",
    properties: ["openFile"],
    filters: [
      {
        name: "Archive Files",
        extensions: ["zip", "rar", "7z", "tar", "gz", "xz", "bz2", "iso"]
      },
      {
        name: "All Files",
        extensions: ["*"]
      }
    ]
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("pickOutput", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select extraction destination",
    properties: ["openDirectory", "createDirectory"]
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("extract", async (_, payload: { archivePath: string; outputPath: string; password?: string }) => {
  return extractArchive(payload);
});
