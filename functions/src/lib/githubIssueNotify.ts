/**
 * 錯誤告警自動開 GitHub Issue helper（P1-5，2026-09-01）
 *
 * 讓已通過雜訊過濾與節流（見 errorAlertPolicy.ts）的錯誤告警，
 * 除了推播 Google Chat 之外，額外在 repo 開一張標籤 auto-error-alert 的 Issue，
 * 觸發綁定該 repo 的雲端 agent routine（claude.ai/code/routines/trig_01PaRMdM5CQE5JM2vhVDHrks）
 * 自動進 repo 定位根因並回留言診斷（該 routine 只診斷不改程式碼）。
 */

import axios from "axios";

const GITHUB_REPO = "cagoooo/Akai";
const ISSUE_LABEL = "auto-error-alert";

export interface GithubErrorIssueParams {
    message: string;
    severity: string;
    fingerprint: string;
    stack: string;
    url: string;
    userAgent: string;
    appVersion: string;
    firstSeenText: string;
    totalCount: number;
}

export async function createGithubErrorIssue(
    token: string | undefined,
    params: GithubErrorIssueParams,
    contextLabel: string = "ErrorAlert"
): Promise<void> {
    if (!token || token.trim() === "") {
        console.warn(`[${contextLabel}] GITHUB_ISSUE_TOKEN 未配置，略過自動開 Issue（僅推播 Google Chat）。`);
        return;
    }

    const { message, severity, fingerprint, stack, url, userAgent, appVersion, firstSeenText, totalCount } = params;
    const title = `🤖 錯誤告警：${message.slice(0, 80)}`;
    const body = [
        "> 由 Cloud Function `onErrorLogCreated` 自動建立，會觸發雲端 agent 進 repo 診斷根因並在此留言（只診斷、不改程式碼）。",
        "",
        `**嚴重度**：${severity}`,
        `**指紋**：\`${fingerprint}\``,
        `**累計次數**：${totalCount}`,
        `**首次發生**：${firstSeenText}`,
        `**版本**：${appVersion}`,
        `**觸發網址**：${url}`,
        `**瀏覽器**：${userAgent}`,
        "",
        "**Stack Trace**",
        "```",
        stack.slice(0, 3000),
        "```",
    ].join("\n");

    try {
        const response = await axios.post(
            `https://api.github.com/repos/${GITHUB_REPO}/issues`,
            { title, body, labels: [ISSUE_LABEL] },
            {
                headers: {
                    Authorization: `Bearer ${token.trim()}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
                timeout: 10000,
            }
        );
        console.log(`[${contextLabel}] 錯誤告警 Issue 已建立：${response.data?.html_url}`);
    } catch (error: any) {
        console.error(
            `[${contextLabel}] 建立錯誤告警 Issue 失敗:`,
            JSON.stringify(error.response?.data) || error.message
        );
    }
}
