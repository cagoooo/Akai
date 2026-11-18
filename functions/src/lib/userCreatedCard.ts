import { escapeChatCardText } from "./googleChatCardSafety";

/**
 * 「新使用者註冊」Google Chat 卡片。
 * 同一個 Chat 空間會收到很多系統（剛好學、班級小管家、PIRLS…）的通知，
 * 卡片要一眼看出「是哪個平台、用什麼方式登入、是學校帳號還是個人帳號」（2026-11-18 使用者要求）。
 */
export const PLATFORM = {
    name: "阿凱老師教育工具集",
    shortName: "Akai",
    siteUrl: "https://cagoooo.github.io/Akai/",
    firebaseProject: "akai-e693f",
} as const;

export interface CreatedUserInfo {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    creationTime?: string | null;
    providerIds?: string[];
}

const PROVIDER_LABEL: Record<string, string> = {
    "google.com": "Google 帳號",
    "password": "電子郵件＋密碼",
    "apple.com": "Apple 帳號",
    "github.com": "GitHub 帳號",
    "microsoft.com": "Microsoft 帳號",
    "facebook.com": "Facebook 帳號",
    "phone": "手機號碼",
};

/** 登入方式：多個就用「、」串起來；不認得的照原樣顯示 */
export function describeProviders(providerIds: string[] = []): string {
    const labels = [...new Set(providerIds.filter(Boolean))].map((id) => PROVIDER_LABEL[id] ?? id);
    return labels.length ? labels.join("、") : "未知";
}

/** 帳號類型：看 email 網域分辨學校帳號、個人 Gmail 或其他 */
export function describeAccountType(email?: string | null): string {
    const domain = String(email ?? "").split("@")[1]?.toLowerCase() ?? "";
    if (!domain) return "沒有電子郵件";
    if (domain === "mail2.smes.tyc.edu.tw" || domain === "smes.tyc.edu.tw") return "石門國小學校帳號";
    if (domain.endsWith(".edu.tw")) return `學校／教育帳號（${domain}）`;
    if (domain === "gmail.com" || domain === "googlemail.com") return "個人 Gmail";
    return `其他（${domain}）`;
}

function formatTaipeiTime(creationTime?: string | null, now: Date = new Date()): string {
    const time = creationTime ? new Date(creationTime) : now;
    const valid = Number.isNaN(time.getTime()) ? now : time;
    return valid.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

export function buildUserCreatedNotification(user: CreatedUserInfo, now: Date = new Date()) {
    const email = user.email || "（無電子郵件）";
    const displayName = user.displayName || "未設定名稱";
    const provider = describeProviders(user.providerIds);
    const accountType = describeAccountType(user.email);

    const summaryText = `👤 【${PLATFORM.name}】新使用者註冊：${email}（${provider}）`;

    const card = {
        cardId: `register-${user.uid}`,
        card: {
            header: {
                title: `👤 新使用者註冊｜${PLATFORM.name}`,
                subtitle: escapeChatCardText(`${displayName}・${email}`),
                imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/person/default/48px.svg",
                imageType: "CIRCLE",
            },
            sections: [
                {
                    collapsible: false,
                    widgets: [
                        {
                            decoratedText: {
                                topLabel: "註冊平台",
                                text: `<b>${escapeChatCardText(PLATFORM.name)}</b>（${escapeChatCardText(PLATFORM.shortName)}）`,
                                bottomLabel: escapeChatCardText(`${PLATFORM.siteUrl.replace(/^https:\/\//, "")}・Firebase 專案 ${PLATFORM.firebaseProject}`),
                            },
                        },
                        {
                            decoratedText: {
                                topLabel: "登入方式",
                                text: escapeChatCardText(provider),
                                bottomLabel: escapeChatCardText(`帳號類型：${accountType}`),
                            },
                        },
                        {
                            decoratedText: {
                                topLabel: "顯示名稱",
                                text: escapeChatCardText(displayName),
                            },
                        },
                        {
                            decoratedText: {
                                topLabel: "電子郵件",
                                text: escapeChatCardText(email),
                            },
                        },
                        {
                            decoratedText: {
                                topLabel: "註冊時間（台北）",
                                text: escapeChatCardText(formatTaipeiTime(user.creationTime, now)),
                            },
                        },
                    ],
                },
                {
                    header: "技術資訊",
                    collapsible: true,
                    uncollapsibleWidgetsCount: 0,
                    widgets: [
                        {
                            decoratedText: {
                                topLabel: "使用者帳號 UID",
                                text: escapeChatCardText(user.uid),
                            },
                        },
                    ],
                },
                {
                    widgets: [
                        {
                            buttonList: {
                                buttons: [
                                    {
                                        text: "開啟平台網站",
                                        onClick: { openLink: { url: PLATFORM.siteUrl } },
                                    },
                                    {
                                        text: "Firebase 使用者清單",
                                        onClick: {
                                            openLink: {
                                                url: `https://console.firebase.google.com/project/${PLATFORM.firebaseProject}/authentication/users`,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    };

    return { summaryText, card };
}
