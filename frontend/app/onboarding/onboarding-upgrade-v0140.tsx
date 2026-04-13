// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { getApi } from "@/app/store/global";
import { t } from "@/util/i18n";

const UpgradeOnboardingModal_v0_14_0_Content = () => {
    return (
        <div className="flex flex-col items-start w-full mb-2 unselectable">
            <div className="text-secondary leading-relaxed mb-4">
                <p className="mb-0">
                    {t("onboarding.upgrade.v0140.lead")}
                </p>
            </div>

            <div className="flex w-full items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-sky-500 fa-sharp fa-solid fa-shield"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0140.durable.title")}{" "}
                        <button
                            onClick={() => getApi().openExternal("https://docs.waveterm.dev/durable-sessions")}
                            className="text-accent text-sm font-normal cursor-pointer hover:underline"
                        >
                            [{t("onboarding.upgrade.v0140.durable.docs")}]
                        </button>
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.durable.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.durable.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.durable.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.durable.item2Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.durable.item3Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.durable.item3Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-network-wired"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0140.connection.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.connection.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.connection.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.connection.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.connection.item2Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-sparkles"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0140.ai.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.ai.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.ai.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.ai.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.ai.item2Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.ai.item3Title")}</strong>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-terminal"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0140.terminal.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.terminal.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.terminal.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0140.terminal.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0140.terminal.item2Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

UpgradeOnboardingModal_v0_14_0_Content.displayName = "UpgradeOnboardingModal_v0_14_0_Content";

export { UpgradeOnboardingModal_v0_14_0_Content };
