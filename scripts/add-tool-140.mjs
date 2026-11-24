// 新增工具 #140：聖誕趴團練歌詞投影（吉他譜＋伴唱同步）公開示範版（2026-11-24）
//   node scripts/add-tool-140.mjs   → 只寫 server/data/tools.json（單一來源），client 由 sync-tools-json 產生
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'server/data/tools.json';
const tools = JSON.parse(readFileSync(p, 'utf-8'));
if (tools.some((t) => t.id === 140)) { console.log('#140 已存在，略過'); process.exit(0); }

const tool = {
  id: 140,
  title: '聖誕趴團練歌詞投影｜吉他譜＋伴唱同步',
  description:
    '石門國小教職員樂團團練歌本的公開示範版：吉他和弦譜可以改演唱調、自動算出變調夾夾第幾格；一鍵切成大螢幕歌詞投影，長句自動分上下排，選一個音檔就能讓歌詞跟著伴唱自動換頁。',
  detailedDescription: `這是阿凱老師為石門國小 2026 聖誕趴教職員樂團做的團練歌本。團練版有 10 首歌和去掉人聲的伴唱音檔，因為大多是有版權的流行歌，只給團員使用；這個公開示範版只放一首石門國小自己改編歌詞的〈十一份路走九遍〉（原曲〈忠孝東路走九遍〉），不附音檔。

## 吉他歌本

- **改調不用自己算**：選「演唱調」和手上要按的「指法」，網頁自動算出變調夾要夾第幾格；也能一鍵切換「夾 Capo（簡單指法）」和「不夾 Capo（原調和弦）」。
- **兩種看譜方式**：「歌詞譜」把和弦標在要換和弦的那個字上面；「小節譜」一格一小節，看段落結構。
- **段落照演出剪接版**：只列出表演時真的會彈的段落，曲式一眼看完。
- **自己貼歌詞**：按「✏️ 歌詞譜」可以貼上歌詞、依拍子自動配上和弦，再點和弦微調位置（改的內容只存在自己的裝置）。

## 大螢幕歌詞投影

- 按「📺 大螢幕歌詞投影」切成全螢幕投影，鍵盤方向鍵或簡報筆換句，手機點畫面左右兩邊換句。
- 長句會自動在空白處分成上下排，挑字最大的排法，台下看得清楚。
- 左上角「🎵 選歌」可以直接跳到某一首，電腦也可以按 J。

## 伴唱同步

- 按「🎵 伴唱同步練習」，歌詞會照事先對好的時間點跟著音樂自動換頁；方向鍵換句時音樂也跟著跳。
- 示範版沒有附音檔，要自己選一個音檔試用。時間點是照團練用的剪接版對的，換成別的音樂可以按 R 一邊播一邊按方向鍵重新錄，也能用 [ ] 整首提早或延後。

## 團練版是怎麼做出來的

伴唱音檔用開源的去人聲工具把主唱拿掉、9 首音量拉齊；歌詞換頁的時間點是用語音辨識逐句對出來的。這些處理都在老師自己的電腦上完成，示範網頁本身不呼叫 AI 模型。

## 資料與隱私

選的音檔只存在這台裝置的瀏覽器裡，下次打開不用再選，不會上傳到網路。網頁放在 Claude 的 Artifact 上，不用登入就能看。`,
  url: 'https://claude.ai/artifact/4tmMZXgcqRa91Phfxqj18S',
  icon: 'Music',
  category: 'utilities',
  previewUrl: '/previews/tool_140.webp',
  ogPreviewUrl: '/previews/og/tool_140.webp',
  tags: [
    '吉他和弦譜',
    '變調夾',
    '歌詞投影',
    '伴唱同步',
    '去人聲伴奏',
    '教職員樂團',
    '聖誕晚會',
    '活動籌辦',
    '大螢幕投影',
    'Claude Artifact',
  ],
  audienceFit: {
    audiences: ['teacher'],
    painPoints: ['event-management', 'media-production', 'content-creation', 'resource-discovery'],
    priority: 50,
    reasons: {
      teacher:
        '要在晚會、畢業典禮或教師社團帶大家唱歌的老師，可以參考這套做法：吉他譜自動算變調夾，同一份歌詞直接切成大螢幕投影，練習時再讓歌詞跟著伴唱自動換頁。',
      homeroom:
        '導師帶全班準備班級表演或歌唱比賽時，可以把歌詞做成大螢幕投影，長句自動分上下排，坐在後排的學生也看得清楚；練習時選一個伴奏音檔，歌詞就會自己換頁。',
      subject:
        '音樂老師和社團老師可以拿它當歌唱課與樂團課的投影工具：改演唱調時網頁會算出變調夾夾第幾格，和弦標在歌詞字上，學生跟著大螢幕唱也不會跟丟。',
      admin:
        '負責籌辦校慶、聖誕晚會、教師節活動的行政老師，可以參考這套團練流程：一份歌本同時給樂手看譜、給台下看投影，練習時歌詞跟著伴唱自動換頁，排練更省事。',
    },
  },
  addedAt: new Date().toISOString(),
};

const i = tools.findIndex((t) => t.id > tool.id);
if (i === -1) tools.push(tool); else tools.splice(i, 0, tool);
writeFileSync(p, `${JSON.stringify(tools, null, 2)}\n`);
console.log(`已新增 #${tool.id}：${tool.title}（共 ${tools.length} 筆）`);
