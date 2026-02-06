import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("unpackr", {
  pickArchive: (): Promise<string | null> => ipcRenderer.invoke("pickArchive"),
  pickOutput: (): Promise<string | null> => ipcRenderer.invoke("pickOutput"),
  extract: (payload: { archivePath: string; outputPath: string; password?: string }) => ipcRenderer.invoke("extract", payload)
});
