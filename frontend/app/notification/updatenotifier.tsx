// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { atoms, isDev, pushNotification } from "@/store/global";
import { t } from "@/util/i18n";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export const useUpdateNotifier = () => {
    const appUpdateStatus = useAtomValue(atoms.updaterStatusAtom);

    useEffect(() => {
        let notification: NotificationType | null = null;

        switch (appUpdateStatus) {
            case "ready":
                notification = {
                    id: "update-notification",
                    icon: "arrows-rotate",
                    title: t("updateNotification.availableTitle", undefined, "Update Available"),
                    message: t(
                        "updateNotification.availableBody",
                        undefined,
                        "A new update is available and ready to be installed."
                    ),
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: t("updateNotification.installNow", undefined, "Install Now"),
                            actionKey: "installUpdate",
                            color: "green",
                            disabled: false,
                        },
                    ],
                };
                break;

            case "downloading":
                notification = {
                    id: "update-notification",
                    icon: "arrows-rotate",
                    title: t("updateNotification.downloadingTitle", undefined, "Downloading Update"),
                    message: t(
                        "updateNotification.downloadingBody",
                        undefined,
                        "The update is currently being downloaded."
                    ),
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: t("updateNotification.downloadingAction", undefined, "Downloading..."),
                            actionKey: "",
                            color: "green",
                            disabled: true,
                        },
                    ],
                };
                break;

            case "installing":
                notification = {
                    id: "update-notification",
                    icon: "arrows-rotate",
                    title: t("updateNotification.installingTitle", undefined, "Installing Update"),
                    message: t(
                        "updateNotification.installingBody",
                        undefined,
                        "The update is currently being installed."
                    ),
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: t("updateNotification.installingAction", undefined, "Installing..."),
                            actionKey: "",
                            color: "green",
                            disabled: true,
                        },
                    ],
                };
                break;

            case "error":
                notification = {
                    id: "update-notification",
                    icon: "circle-exclamation",
                    title: t("updateNotification.errorTitle", undefined, "Update Error"),
                    message: t(
                        "updateNotification.errorBody",
                        undefined,
                        "An error occurred during the update process."
                    ),
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: t("updateNotification.retry", undefined, "Retry Update"),
                            actionKey: "retryUpdate",
                            color: "green",
                            disabled: false,
                        },
                    ],
                };
                break;
        }

        if (!isDev()) return;

        if (notification) {
            pushNotification(notification);
        }
    }, [appUpdateStatus]);
};
