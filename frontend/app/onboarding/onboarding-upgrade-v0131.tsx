// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { t } from "@/util/i18n";

const UpgradeOnboardingModal_v0_13_1_Content = () => {
    return (
        <div className="flex flex-col items-start gap-6 w-full mb-4 unselectable">
            <div className="text-secondary leading-relaxed">
                <p className="mb-0">
                    {t("onboarding.upgrade.v0131.lead")}
                </p>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-brands fa-windows"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0131.windows.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.windows.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.windows.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.windows.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.windows.item2Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.windows.item3Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.windows.item3Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.windows.item4Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.windows.item4Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-sparkles"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0131.ai.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.ai.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.ai.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.ai.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.ai.item2Body")}
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
                        {t("onboarding.upgrade.v0131.terminal.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0131.terminal.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0131.terminal.item1Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

UpgradeOnboardingModal_v0_13_1_Content.displayName = "UpgradeOnboardingModal_v0_13_1_Content";

export { UpgradeOnboardingModal_v0_13_1_Content };
