import { describe, expect, it } from "vitest";
import {
    classifySeverity,
    fingerprintError,
    isKnownNoise,
    normalizeMessage,
    shouldNotify,
} from "./lib/errorAlertPolicy";

describe("isKnownNoise", () => {
    it.each([
        "ResizeObserver loop completed with undelivered notifications.",
        "Script error.",
        "Non-Error promise rejection captured with value: undefined",
        "Failed to fetch dynamically imported module: https://example.com/a.js",
        "Load failed",
        "The operation was aborted.",
        "signal is aborted without reason",
    ])("把已知第三方雜訊擋下來：%s", (message) => {
        expect(isKnownNoise({ message })).toBe(true);
    });

    it("瀏覽器擴充套件的堆疊視為雜訊", () => {
        expect(isKnownNoise({
            message: "Cannot read properties of null",
            stack: "TypeError\n  at chrome-extension://abcdef/content.js:12:3",
        })).toBe(true);
    });

    it("站方自己的錯誤不是雜訊", () => {
        expect(isKnownNoise({
            message: "Cannot read properties of undefined (reading 'id')",
            stack: "TypeError\n  at https://cagoooo.github.io/Akai/assets/index-a1b2c3d4.js:5:10",
        })).toBe(false);
    });

    it("name 為 AbortError 時，不論 message 措辭是什麼都視為雜訊", () => {
        expect(isKnownNoise({
            message: "這是瀏覽器明天才會換上的全新措辭，regex 清單還沒收錄",
            name: "AbortError",
        })).toBe(true);
    });
});

describe("classifySeverity", () => {
    it("有 React componentStack ＝ 白畫面 ＝ critical", () => {
        expect(classifySeverity({ level: "error", componentStack: "  at ToolCard" })).toBe("critical");
    });

    it("未處理的 promise rejection ＝ warn", () => {
        expect(classifySeverity({ level: "unhandledrejection", message: "boom" })).toBe("warn");
    });

    it("沒有 componentStack 的一般 error ＝ warn", () => {
        expect(classifySeverity({ level: "error", message: "boom" })).toBe("warn");
    });

    it.each(["info", "warn"])("明確標為 %s 的只留存不推播", (level) => {
        expect(classifySeverity({ level })).toBe("info");
    });
});

describe("normalizeMessage", () => {
    it("把每次都不同的數字、網址、UUID 換掉", () => {
        const a = normalizeMessage("Failed to load tool 122 from https://a.example/x?v=9");
        const b = normalizeMessage("Failed to load tool 87 from https://b.example/y?v=3");
        expect(a).toBe(b);
    });
});

describe("fingerprintError", () => {
    const base = {
        message: "Cannot read properties of undefined (reading 'audienceFit')",
        stack: [
            "TypeError: Cannot read properties of undefined",
            "  at recommendTools (https://cagoooo.github.io/Akai/assets/index-a1b2c3d4.js:10:5)",
            "  at renderResults (https://cagoooo.github.io/Akai/assets/index-a1b2c3d4.js:22:9)",
            "  at commitRoot (https://cagoooo.github.io/Akai/assets/vendor-99887766.js:44:1)",
        ].join("\n"),
    };

    it("同一個 bug 的不同實例得到同一個指紋", () => {
        const other = {
            ...base,
            // 換一位訪客、換一次部署（build hash 與行號都變了）
            stack: base.stack
                .replace(/index-a1b2c3d4/g, "index-zz99yy88")
                .replace(/vendor-99887766/g, "vendor-11223344")
                .replace(/:10:5/, ":11:7"),
        };
        expect(fingerprintError(other)).toBe(fingerprintError(base));
    });

    it("不同的 bug 得到不同的指紋", () => {
        expect(fingerprintError({ ...base, message: "Something else entirely" }))
            .not.toBe(fingerprintError(base));
    });

    it("沒有堆疊也算得出指紋", () => {
        expect(fingerprintError({ message: "boom" })).toEqual(expect.any(String));
    });
});

describe("shouldNotify", () => {
    const now = 1_800_000_000_000;

    it("第一次出現一定推播", () => {
        expect(shouldNotify({ severity: "critical", now })).toBe(true);
        expect(shouldNotify({ severity: "warn", now })).toBe(true);
    });

    it("info 一律不推播（只累積次數）", () => {
        expect(shouldNotify({ severity: "info", now })).toBe(false);
    });

    it("critical 在 15 分鐘內不重複推播", () => {
        expect(shouldNotify({ severity: "critical", lastNotifiedAt: now - 14 * 60 * 1000, now })).toBe(false);
        expect(shouldNotify({ severity: "critical", lastNotifiedAt: now - 16 * 60 * 1000, now })).toBe(true);
    });

    it("warn 在 60 分鐘內不重複推播", () => {
        expect(shouldNotify({ severity: "warn", lastNotifiedAt: now - 59 * 60 * 1000, now })).toBe(false);
        expect(shouldNotify({ severity: "warn", lastNotifiedAt: now - 61 * 60 * 1000, now })).toBe(true);
    });
});
