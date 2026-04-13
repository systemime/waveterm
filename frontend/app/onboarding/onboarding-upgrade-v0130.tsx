// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { t } from "@/util/i18n";

const UpgradeOnboardingModal_v0_13_0_Content = () => {
    return (
        <div className="flex flex-col items-start gap-6 w-full mb-4 unselectable">
            <div className="text-secondary leading-relaxed">
                <p className="mb-0">
                    {t("onboarding.upgrade.v0130.lead")}
                </p>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-sparkles"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0130.ai.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.ai.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.ai.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.ai.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.ai.item2Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.ai.item3Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.ai.item3Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.ai.item4Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.ai.item4Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-sliders"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0130.config.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.config.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.config.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.config.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.config.item2Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.config.item3Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.config.item3Body")}
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
                        {t("onboarding.upgrade.v0130.terminal.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.terminal.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.terminal.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.terminal.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.terminal.item2Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0130.terminal.item3Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0130.terminal.item3Body")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

UpgradeOnboardingModal_v0_13_0_Content.displayName = "UpgradeOnboardingModal_v0_13_0_Content";

export { UpgradeOnboardingModal_v0_13_0_Content };
