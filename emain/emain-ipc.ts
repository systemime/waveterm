// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import * as electron from "electron";
import { FastAverageColor } from "fast-average-color";
import fs from "fs";
import * as child_process from "node:child_process";
import * as path from "path";
import { PNG } from "pngjs";
import { Readable } from "stream";
import { RpcApi } from "../frontend/app/store/wshclientapi";
import { getWebServerEndpoint } from "../frontend/util/endpoints";
import * as keyutil from "../frontend/util/keyutil";
import { fireAndForget, isBlank, parseDataUrl } from "../frontend/util/util";
import {
    incrementTermCommandsDurable,
    incrementTermCommandsRemote,
    incrementTermCommandsRun,
    incrementTermCommandsWsl,
} from "./emain-activity";
import { createBuilderWindow, getAllBuilderWindows, getBuilderWindowByWebContentsId } from "./emain-builder";
import { callWithOriginalXdgCurrentDesktopAsync, unamePlatform } from "./emain-platform";
import { getWaveTabViewByWebContentsId } from "./emain-tabview";
import { handleCtrlShiftState } from "./emain-util";
import { getWaveVersion } from "./emain-wavesrv";
import { createNewWaveWindow, focusedWaveWindow, getWaveWindowByWebContentsId } from "./emain-window";
import { ElectronWshClient } from "./emain-wsh";

const electronApp = electron.app;

let webviewFocusId: number = null;
let webviewKeys: string[] = [];

export function openBuilderWindow(appId?: string) {
    const normalizedAppId = appId || "";
    const existingBuilderWindows = getAllBuilderWindows();
    const existingWindow = existingBuilderWindows.find((win) => win.builderAppId === normalizedAppId);
    if (existingWindow) {
        existingWindow.focus();
        return;
    }
    fireAndForget(() => createBuilderWindow(normalizedAppId));
}

type UrlInSessionResult = {
    stream: Readable;
    mimeType: string;
    fileName: string;
};

type DownloadTaskInternal = {
    id: string;
    scopeId: string;
    kind: DownloadTaskKind;
    displayName: string;
    status: DownloadTaskStatus;
    progress: number;
    receivedBytes: number;
    totalBytes: number;
    completedFiles: number;
    totalFiles: number;
    savePath?: string;
    error?: string;
};

function getSingleHeaderVal(headers: Record<string, string | string[]>, key: string): string {
    const val = headers[key];
    if (val == null) {
        return null;
    }
    if (Array.isArray(val)) {
        return val[0];
    }
    return val;
}

function cleanMimeType(mimeType: string): string {
    if (mimeType == null) {
        return null;
    }
    const parts = mimeType.split(";");
    return parts[0].trim();
}

function getFileNameFromUrl(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
        return filename;
    } catch (e) {
        return null;
    }
}

function buildStreamingUrl(sourcePath: string, downloadName: string): string {
    const baseName = encodeURIComponent(downloadName || path.basename(sourcePath));
    return getWebServerEndpoint() + "/wave/stream-file/" + baseName + "?path=" + encodeURIComponent(sourcePath);
}

function emitDownloadTaskUpdate(sender: Electron.WebContents, update: DownloadTaskInternal) {
    if (sender == null || sender.isDestroyed()) {
        return;
    }
    sender.send("download-task-update", update);
}

function normalizeRelativePath(relPath: string): string {
    return relPath
        .split(/[\\/]+/)
        .filter((part) => part != null && part !== "" && part !== "." && part !== "..")
        .join(path.sep);
}

function computeTaskProgress(
    receivedBytes: number,
    totalBytes: number,
    completedFiles: number,
    totalFiles: number
): number {
    if (totalBytes > 0) {
        return Math.max(0, Math.min(100, Math.round((receivedBytes / totalBytes) * 100)));
    }
    if (totalFiles > 0) {
        return Math.max(0, Math.min(100, Math.round((completedFiles / totalFiles) * 100)));
    }
    return 100;
}

function downloadUrlToFile(
    session: Electron.Session,
    url: string,
    destPath: string,
    onProgress: (_receivedBytes: number, _totalBytes: number) => void
): Promise<{ receivedBytes: number; totalBytes: number }> {
    return new Promise((resolve, reject) => {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        const request = electron.net.request({
            url,
            method: "GET",
            session,
        });

        let writeStream: fs.WriteStream | null = null;
        let totalBytes = 0;
        let receivedBytes = 0;
        let settled = false;

        const fail = (err: Error) => {
            if (settled) {
                return;
            }
            settled = true;
            try {
                writeStream?.destroy();
            } catch {}
            try {
                fs.rmSync(destPath, { force: true });
            } catch {}
            reject(err);
        };

        request.on("response", (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                fail(
                    new Error(`HTTP request failed with status ${response.statusCode}: ${response.statusMessage || ""}`)
                );
                return;
            }

            const contentLength = parseInt(getSingleHeaderVal(response.headers, "content-length") ?? "0", 10);
            if (Number.isFinite(contentLength) && contentLength > 0) {
                totalBytes = contentLength;
            }

            writeStream = fs.createWriteStream(destPath);
            writeStream.on("error", fail);
            writeStream.on("finish", () => {
                if (settled) {
                    return;
                }
                settled = true;
                resolve({
                    receivedBytes,
                    totalBytes: totalBytes > 0 ? totalBytes : receivedBytes,
                });
            });

            response.on("data", (chunk) => {
                receivedBytes += chunk.length;
                onProgress(receivedBytes, totalBytes > 0 ? totalBytes : receivedBytes);
                writeStream?.write(chunk);
            });
            response.on("end", () => writeStream?.end());
            response.on("error", fail);
        });

        request.on("error", fail);
        request.end();
    });
}

async function runFileDownloadTask(
    sender: Electron.WebContents,
    session: Electron.Session,
    task: DownloadTaskInternal,
    item: DownloadTaskItem,
    destPath: string
) {
    task.status = "downloading";
    task.savePath = destPath;
    emitDownloadTaskUpdate(sender, { ...task });

    const result = await downloadUrlToFile(
        session,
        buildStreamingUrl(item.sourcePath, item.downloadName ?? task.displayName),
        destPath,
        (receivedBytes, totalBytes) => {
            task.receivedBytes = receivedBytes;
            task.totalBytes = totalBytes;
            task.progress = computeTaskProgress(receivedBytes, totalBytes, 0, 1);
            emitDownloadTaskUpdate(sender, { ...task });
        }
    );

    task.receivedBytes = result.receivedBytes;
    task.totalBytes = result.totalBytes;
    task.completedFiles = 1;
    task.progress = 100;
    task.status = "completed";
    emitDownloadTaskUpdate(sender, { ...task });
}

async function runFolderDownloadTask(
    sender: Electron.WebContents,
    session: Electron.Session,
    task: DownloadTaskInternal,
    items: DownloadTaskItem[],
    rootPath: string
) {
    task.status = "downloading";
    task.savePath = rootPath;
    task.totalFiles = items.length;
    task.totalBytes = items.reduce((sum, item) => sum + (item.size ?? 0), 0);
    emitDownloadTaskUpdate(sender, { ...task });

    if (items.length === 0) {
        fs.mkdirSync(rootPath, { recursive: true });
        task.progress = 100;
        task.status = "completed";
        emitDownloadTaskUpdate(sender, { ...task });
        return;
    }

    let aggregateReceived = 0;
    let completedFiles = 0;

    for (const item of items) {
        const relativePath = normalizeRelativePath(
            item.relativePath ?? item.downloadName ?? path.basename(item.sourcePath)
        );
        const destPath = path.join(rootPath, relativePath);
        let lastReceived = 0;

        const result = await downloadUrlToFile(
            session,
            buildStreamingUrl(item.sourcePath, item.downloadName ?? path.basename(relativePath)),
            destPath,
            (receivedBytes) => {
                lastReceived = receivedBytes;
                task.receivedBytes = aggregateReceived + receivedBytes;
                task.progress = computeTaskProgress(task.receivedBytes, task.totalBytes, completedFiles, items.length);
                emitDownloadTaskUpdate(sender, { ...task });
            }
        );

        aggregateReceived += result.receivedBytes;
        completedFiles += 1;
        task.receivedBytes = aggregateReceived;
        task.completedFiles = completedFiles;
        task.progress = computeTaskProgress(task.receivedBytes, task.totalBytes, completedFiles, items.length);
        emitDownloadTaskUpdate(sender, { ...task });
    }

    task.progress = 100;
    task.status = "completed";
    emitDownloadTaskUpdate(sender, { ...task });
}

function getUrlInSession(session: Electron.Session, url: string): Promise<UrlInSessionResult> {
    return new Promise((resolve, reject) => {
        if (url.startsWith("data:")) {
            try {
                const parsed = parseDataUrl(url);
                const buffer = Buffer.from(parsed.buffer);
                const readable = Readable.from(buffer);
                resolve({ stream: readable, mimeType: parsed.mimeType, fileName: "image" });
            } catch (err) {
                return reject(err);
            }
            return;
        }
        const request = electron.net.request({
            url,
            method: "GET",
            session,
        });
        const readable = new Readable({
            read() {},
        });
        request.on("response", (response) => {
            const statusCode = response.statusCode;
            if (statusCode < 200 || statusCode >= 300) {
                readable.destroy();
                request.abort();
                reject(new Error(`HTTP request failed with status ${statusCode}: ${response.statusMessage || ""}`));
                return;
            }

            const mimeType = cleanMimeType(getSingleHeaderVal(response.headers, "content-type"));
            const fileName = getFileNameFromUrl(url) || "image";
            response.on("data", (chunk) => {
                readable.push(chunk);
            });
            response.on("end", () => {
                readable.push(null);
                resolve({ stream: readable, mimeType, fileName });
            });
            response.on("error", (err) => {
                readable.destroy(err);
                reject(err);
            });
        });
        request.on("error", (err) => {
            readable.destroy(err);
            reject(err);
        });
        request.end();
    });
}

function saveImageFileWithNativeDialog(defaultFileName: string, mimeType: string, readStream: Readable) {
    if (defaultFileName == null || defaultFileName == "") {
        defaultFileName = "image";
    }
    const ww = focusedWaveWindow;
    if (ww == null) {
        return;
    }
    const mimeToExtension: { [key: string]: string } = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp",
        "image/tiff": "tiff",
        "image/heic": "heic",
        "image/svg+xml": "svg",
    };
    function addExtensionIfNeeded(fileName: string, mimeType: string): string {
        const extension = mimeToExtension[mimeType];
        if (!path.extname(fileName) && extension) {
            return `${fileName}.${extension}`;
        }
        return fileName;
    }
    defaultFileName = addExtensionIfNeeded(defaultFileName, mimeType);
    electron.dialog
        .showSaveDialog(ww, {
            title: "Save Image",
            defaultPath: defaultFileName,
            filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff", "heic"] }],
        })
        .then((file) => {
            if (file.canceled) {
                return;
            }
            const writeStream = fs.createWriteStream(file.filePath);
            readStream.pipe(writeStream);
            writeStream.on("finish", () => {
                console.log("saved file", file.filePath);
            });
            writeStream.on("error", (err) => {
                console.log("error saving file (writeStream)", err);
                readStream.destroy();
            });
            readStream.on("error", (err) => {
                console.error("error saving file (readStream)", err);
                writeStream.destroy();
            });
        })
        .catch((err) => {
            console.log("error trying to save file", err);
        });
}

export function initIpcHandlers() {
    electron.ipcMain.on("open-external", (event, url) => {
        if (url && typeof url === "string") {
            fireAndForget(() =>
                callWithOriginalXdgCurrentDesktopAsync(() =>
                    electron.shell.openExternal(url).catch((err) => {
                        console.error(`Failed to open URL ${url}:`, err);
                    })
                )
            );
        } else {
            console.error("Invalid URL received in open-external event:", url);
        }
    });

    electron.ipcMain.on("webview-image-contextmenu", (event: electron.IpcMainEvent, payload: { src: string }) => {
        const menu = new electron.Menu();
        const win = getWaveWindowByWebContentsId(event.sender.hostWebContents.id);
        if (win == null) {
            return;
        }
        menu.append(
            new electron.MenuItem({
                label: "Save Image",
                click: () => {
                    const resultP = getUrlInSession(event.sender.session, payload.src);
                    resultP
                        .then((result) => {
                            saveImageFileWithNativeDialog(result.fileName, result.mimeType, result.stream);
                        })
                        .catch((e) => {
                            console.log("error getting image", e);
                        });
                },
            })
        );
        menu.popup();
    });

    electron.ipcMain.on("download", (event, payload) => {
        const baseName = encodeURIComponent(path.basename(payload.filePath));
        const streamingUrl =
            getWebServerEndpoint() + "/wave/stream-file/" + baseName + "?path=" + encodeURIComponent(payload.filePath);
        event.sender.downloadURL(streamingUrl);
    });

    electron.ipcMain.handle("start-download-task", async (event, request: DownloadTaskRequest) => {
        if (request == null || request.items == null || request.items.length === 0) {
            return null;
        }

        const browserWindow = electron.BrowserWindow.fromWebContents(event.sender) ?? focusedWaveWindow;
        const task: DownloadTaskInternal = {
            id: crypto.randomUUID(),
            scopeId: request.scopeId,
            kind: request.kind,
            displayName: request.displayName,
            status: "queued",
            progress: 0,
            receivedBytes: 0,
            totalBytes: request.items.reduce((sum, item) => sum + (item.size ?? 0), 0),
            completedFiles: 0,
            totalFiles: request.kind === "folder" ? request.items.length : 1,
        };

        if (request.kind === "file") {
            const item = request.items[0];
            const saveResult = await electron.dialog.showSaveDialog(browserWindow, {
                title: "Save File",
                defaultPath: item.downloadName ?? request.displayName,
            });
            if (saveResult.canceled || isBlank(saveResult.filePath)) {
                return null;
            }
            task.savePath = saveResult.filePath;
            emitDownloadTaskUpdate(event.sender, { ...task });
            fireAndForget(async () => {
                try {
                    await runFileDownloadTask(event.sender, event.sender.session, task, item, saveResult.filePath);
                } catch (e) {
                    task.status = "failed";
                    task.error = `${e}`;
                    emitDownloadTaskUpdate(event.sender, { ...task });
                }
            });
            return task.id;
        }

        const dirResult = await electron.dialog.showOpenDialog(browserWindow, {
            title: "Select Download Folder",
            properties: ["openDirectory", "createDirectory"],
        });
        if (dirResult.canceled || dirResult.filePaths.length === 0) {
            return null;
        }
        const rootPath = path.join(dirResult.filePaths[0], request.displayName);
        task.savePath = rootPath;
        emitDownloadTaskUpdate(event.sender, { ...task });
        fireAndForget(async () => {
            try {
                await runFolderDownloadTask(event.sender, event.sender.session, task, request.items, rootPath);
            } catch (e) {
                task.status = "failed";
                task.error = `${e}`;
                emitDownloadTaskUpdate(event.sender, { ...task });
            }
        });
        return task.id;
    });

    electron.ipcMain.on("get-cursor-point", (event) => {
        const tabView = getWaveTabViewByWebContentsId(event.sender.id);
        if (tabView == null) {
            event.returnValue = null;
            return;
        }
        const screenPoint = electron.screen.getCursorScreenPoint();
        const windowRect = tabView.getBounds();
        const retVal: Electron.Point = {
            x: screenPoint.x - windowRect.x,
            y: screenPoint.y - windowRect.y,
        };
        event.returnValue = retVal;
    });

    electron.ipcMain.handle("capture-screenshot", async (event, rect) => {
        const tabView = getWaveTabViewByWebContentsId(event.sender.id);
        if (!tabView) {
            throw new Error("No tab view found for the given webContents id");
        }
        const image = await tabView.webContents.capturePage(rect);
        const base64String = image.toPNG().toString("base64");
        return `data:image/png;base64,${base64String}`;
    });

    electron.ipcMain.on("get-env", (event, varName) => {
        event.returnValue = process.env[varName] ?? null;
    });

    electron.ipcMain.on("get-about-modal-details", (event) => {
        event.returnValue = getWaveVersion() as AboutModalDetails;
    });

    electron.ipcMain.on("get-zoom-factor", (event) => {
        event.returnValue = event.sender.getZoomFactor();
    });

    const hasBeforeInputRegisteredMap = new Map<number, boolean>();

    electron.ipcMain.on("webview-focus", (event: Electron.IpcMainEvent, focusedId: number) => {
        webviewFocusId = focusedId;
        console.log("webview-focus", focusedId);
        if (focusedId == null) {
            return;
        }
        const parentWc = event.sender;
        const webviewWc = electron.webContents.fromId(focusedId);
        if (webviewWc == null) {
            webviewFocusId = null;
            return;
        }
        if (!hasBeforeInputRegisteredMap.get(focusedId)) {
            hasBeforeInputRegisteredMap.set(focusedId, true);
            webviewWc.on("before-input-event", (e, input) => {
                let waveEvent = keyutil.adaptFromElectronKeyEvent(input);
                handleCtrlShiftState(parentWc, waveEvent);
                if (webviewFocusId != focusedId) {
                    return;
                }
                if (input.type != "keyDown") {
                    return;
                }
                for (let keyDesc of webviewKeys) {
                    if (keyutil.checkKeyPressed(waveEvent, keyDesc)) {
                        e.preventDefault();
                        parentWc.send("reinject-key", waveEvent);
                        console.log("webview reinject-key", keyDesc);
                        return;
                    }
                }
            });
            webviewWc.on("destroyed", () => {
                hasBeforeInputRegisteredMap.delete(focusedId);
            });
        }
    });

    electron.ipcMain.on("register-global-webview-keys", (event, keys: string[]) => {
        webviewKeys = keys ?? [];
    });

    electron.ipcMain.on("set-keyboard-chord-mode", (event) => {
        event.returnValue = null;
        const tabView = getWaveTabViewByWebContentsId(event.sender.id);
        tabView?.setKeyboardChordMode(true);
    });

    const fac = new FastAverageColor();
    electron.ipcMain.on("update-window-controls-overlay", async (event, rect: Dimensions) => {
        if (unamePlatform === "darwin") return;
        try {
            const fullConfig = await RpcApi.GetFullConfigCommand(ElectronWshClient);
            if (fullConfig?.settings?.["window:nativetitlebar"] && unamePlatform !== "win32") return;

            const zoomFactor = event.sender.getZoomFactor();
            const electronRect: Electron.Rectangle = {
                x: rect.left * zoomFactor,
                y: rect.top * zoomFactor,
                height: rect.height * zoomFactor,
                width: rect.width * zoomFactor,
            };
            const overlay = await event.sender.capturePage(electronRect);
            const overlayBuffer = overlay.toPNG();
            const png = PNG.sync.read(overlayBuffer);
            const color = fac.prepareResult(fac.getColorFromArray4(png.data));
            const ww = getWaveWindowByWebContentsId(event.sender.id);
            ww.setTitleBarOverlay({
                color: unamePlatform === "linux" ? color.rgba : "#00000000",
                symbolColor: color.isDark ? "white" : "black",
            });
        } catch (e) {
            console.error("Error updating window controls overlay:", e);
        }
    });

    electron.ipcMain.on("quicklook", (event, filePath: string) => {
        if (unamePlatform !== "darwin") return;
        child_process.execFile("/usr/bin/qlmanage", ["-p", filePath], (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening Quick Look: ${error}`);
            }
        });
    });

    electron.ipcMain.handle("clear-webview-storage", async (event, webContentsId: number) => {
        try {
            const wc = electron.webContents.fromId(webContentsId);
            if (wc && wc.session) {
                await wc.session.clearStorageData();
                console.log("Cleared cookies and storage for webContentsId:", webContentsId);
            }
        } catch (e) {
            console.error("Failed to clear cookies and storage:", e);
            throw e;
        }
    });

    electron.ipcMain.on("open-native-path", (event, filePath: string) => {
        console.log("open-native-path", filePath);
        filePath = filePath.replace("~", electronApp.getPath("home"));
        fireAndForget(() =>
            callWithOriginalXdgCurrentDesktopAsync(() =>
                electron.shell.openPath(filePath).then((excuse) => {
                    if (excuse) console.error(`Failed to open ${filePath} in native application: ${excuse}`);
                })
            )
        );
    });

    electron.ipcMain.on("set-window-init-status", (event, status: "ready" | "wave-ready") => {
        const tabView = getWaveTabViewByWebContentsId(event.sender.id);
        if (tabView != null && tabView.initResolve != null) {
            if (status === "ready") {
                tabView.initResolve();
                if (tabView.savedInitOpts) {
                    console.log("savedInitOpts calling wave-init", tabView.waveTabId);
                    tabView.webContents.send("wave-init", tabView.savedInitOpts);
                }
            } else if (status === "wave-ready") {
                tabView.waveReadyResolve();
            }
            return;
        }

        const builderWindow = getBuilderWindowByWebContentsId(event.sender.id);
        if (builderWindow != null) {
            if (status === "ready") {
                if (builderWindow.savedInitOpts) {
                    console.log("savedInitOpts calling builder-init", builderWindow.savedInitOpts.builderId);
                    builderWindow.webContents.send("builder-init", builderWindow.savedInitOpts);
                }
            }
            return;
        }

        console.log("set-window-init-status: no window found for webContentsId", event.sender.id);
    });

    electron.ipcMain.on("fe-log", (event, logStr: string) => {
        console.log("fe-log", logStr);
    });

    electron.ipcMain.on(
        "increment-term-commands",
        (event, opts?: { isRemote?: boolean; isWsl?: boolean; isDurable?: boolean }) => {
            incrementTermCommandsRun();
            if (opts?.isRemote) {
                incrementTermCommandsRemote();
            }
            if (opts?.isWsl) {
                incrementTermCommandsWsl();
            }
            if (opts?.isDurable) {
                incrementTermCommandsDurable();
            }
        }
    );

    electron.ipcMain.on("native-paste", (event) => {
        event.sender.paste();
    });

    electron.ipcMain.on("open-builder", (event, appId?: string) => {
        openBuilderWindow(appId);
    });

    electron.ipcMain.on("set-builder-window-appid", (event, appId: string) => {
        const bw = getBuilderWindowByWebContentsId(event.sender.id);
        if (bw == null) {
            return;
        }
        bw.builderAppId = appId;
        console.log("set-builder-window-appid", bw.builderId, appId);
    });

    electron.ipcMain.on("open-new-window", () => fireAndForget(createNewWaveWindow));

    electron.ipcMain.on("close-builder-window", async (event) => {
        const bw = getBuilderWindowByWebContentsId(event.sender.id);
        if (bw == null) {
            return;
        }
        const builderId = bw.builderId;
        if (builderId) {
            try {
                await RpcApi.SetRTInfoCommand(ElectronWshClient, {
                    oref: `builder:${builderId}`,
                    data: {} as ObjRTInfo,
                    delete: true,
                });
            } catch (e) {
                console.error("Error deleting builder rtinfo:", e);
            }
        }
        bw.destroy();
    });

    electron.ipcMain.on("do-refresh", (event) => {
        event.sender.reloadIgnoringCache();
    });
}
