// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { t } from "@/util/i18n";

const UpgradeOnboardingModal_v0_12_1_Content = () => {
    return (
        <div className="flex flex-col items-start gap-6 w-full mb-4 unselectable">
            <div className="text-secondary leading-relaxed">
                <p className="mb-0">
                    {t("onboarding.upgrade.v0121.lead")}
                </p>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-terminal"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0121.shell.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>
                                <strong>{t("onboarding.upgrade.v0121.shell.item1Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0121.shell.item1Body")}
                            </li>
                            <li>
                                <strong>{t("onboarding.upgrade.v0121.shell.item2Title")}</strong> -{" "}
                                {t("onboarding.upgrade.v0121.shell.item2Body")}
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
                        {t("onboarding.upgrade.v0121.ai.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>{t("onboarding.upgrade.v0121.ai.item1")}</li>
                            <li>
                                {t("onboarding.upgrade.v0121.ai.item2")}
                            </li>
                            <li>{t("onboarding.upgrade.v0121.ai.item3")}</li>
                            <li>{t("onboarding.upgrade.v0121.ai.item4")}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                    <i className="text-[24px] text-accent fa-solid fa-wrench"></i>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="text-foreground text-base font-semibold leading-[18px]">
                        {t("onboarding.upgrade.v0121.other.title")}
                    </div>
                    <div className="text-secondary leading-5">
                        <ul className="list-disc list-outside space-y-1 pl-5">
                            <li>{t("onboarding.upgrade.v0121.other.item1")}</li>
                            <li>{t("onboarding.upgrade.v0121.other.item2")}</li>
                            <li>{t("onboarding.upgrade.v0121.other.item3")}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

UpgradeOnboardingModal_v0_12_1_Content.displayName = "UpgradeOnboardingModal_v0_12_1_Content";

export { UpgradeOnboardingModal_v0_12_1_Content };
