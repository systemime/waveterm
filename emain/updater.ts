// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { isDev } from "../frontend/util/isdev";
import { fireAndForget } from "../frontend/util/util";
import { ipcMain } from "electron";

export let updater: Updater;

export class Updater {
    private _status: UpdaterStatus;

    constructor(_settings?: SettingsType) {
        this._status = "up-to-date";
    }

    /**
     * The status of the Updater.
     */
    get status(): UpdaterStatus {
        return this._status;
    }

    private set status(value: UpdaterStatus) {
        this._status = value;
    }

    /**
     * Check for updates and start the background update check, if configured.
     */
    async start() {
        this.status = "up-to-date";
    }

    /**
     * Stop the background update check, if configured.
     */
    stop() {
        this.status = "up-to-date";
    }

    /**
     * Checks if the configured interval time has passed since the last update check, and if so, checks for updates using the `autoUpdater` object
     * @param userInput Whether the user is requesting this. If so, an alert will report the result of the check.
     */
    async checkForUpdates(userInput: boolean) {
        void userInput;
        this.status = "up-to-date";
    }

    /**
     * Prompts the user to install the downloaded application update and restarts the application
     */
    async promptToInstallUpdate() {
        this.status = "up-to-date";
    }

    /**
     * Restarts the app and installs an update if it is available.
     */
    async installUpdate() {
        this.status = "up-to-date";
    }
}

export function getResolvedUpdateChannel(): string {
    return isDev() ? "dev" : "disabled";
}

ipcMain.on("install-app-update", () => fireAndForget(updater?.promptToInstallUpdate.bind(updater)));
ipcMain.on("get-app-update-status", (event) => {
    event.returnValue = "up-to-date";
});
ipcMain.on("get-updater-channel", (event) => {
    event.returnValue = getResolvedUpdateChannel();
});

/**
 * Configures the auto-updater based on the user's preference
 */
export async function configureAutoUpdater() {
    updater = new Updater();
    await updater.start();
}
