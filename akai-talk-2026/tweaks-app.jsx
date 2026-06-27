// Tweaks for AIFED simbao
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#1F4C3E", "#F4EFE3", "#B9512B", "#C99744"],
  "titleFont": "serif",
  "bodyScale": 1.0,
  "slideBg": "white",
  "sectionStyle": "navy",
  "showEnglish": true,
  "showChrome": true
}/*EDITMODE-END*/;

const PALETTES = [
  ["#1B1B6B", "#FAF7F0", "#C73E2A", "#E89B3C"], // 學院深藍（預設）
  ["#1F4C3E", "#F4EFE3", "#B9512B", "#C99744"], // 墨綠書院
  ["#5B1A24", "#F4EFE3", "#1B1B6B", "#C99744"], // 酒紅古典
  ["#1A1A1A", "#F4EFE3", "#C73E2A", "#8A8A8A"]  // 純黑極簡
];

const SLIDE_BG = {
  cream:  { bg: "#FAF7F0", warm: "#F4EFE3" },
  paper:  { bg: "#F4EFE3", warm: "#EDE6D4" },
  white:  { bg: "#FFFFFF", warm: "#F4F0E6" }
};

function shade(hex, amount) {
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
  const adj = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amount)));
  const h = (v) => v.toString(16).padStart(2,'0');
  return '#' + h(adj(r)) + h(adj(g)) + h(adj(b));
}
function hexA(hex, a) {
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement;
    const [navy, cream, red, orange] = t.palette;
    r.style.setProperty('--navy', navy);
    r.style.setProperty('--navy-deep', shade(navy, -0.18));
    r.style.setProperty('--navy-soft', shade(navy, 0.22));
    r.style.setProperty('--red', red);
    r.style.setProperty('--orange', orange);
    r.style.setProperty('--rule', hexA(navy, 0.14));
    r.style.setProperty('--rule-strong', hexA(navy, 0.32));

    const bg = SLIDE_BG[t.slideBg] || SLIDE_BG.cream;
    r.style.setProperty('--cream', bg.bg);
    r.style.setProperty('--cream-warm', bg.warm);

    const titleFamily = t.titleFont === 'sans'
      ? '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'
      : '"Noto Serif TC", "Source Han Serif TC", "PingFang TC", serif';
    r.style.setProperty('--serif', titleFamily);

    const s = t.bodyScale;
    r.style.setProperty('--type-title', Math.round(76 * s) + 'px');
    r.style.setProperty('--type-body',  Math.round(30 * s) + 'px');
    r.style.setProperty('--type-small', Math.round(24 * s) + 'px');
    r.style.setProperty('--type-lead',  Math.round(40 * s) + 'px');

    document.body.classList.toggle('hide-en', !t.showEnglish);
    document.body.classList.toggle('hide-chrome', !t.showChrome);

    const sec = document.querySelectorAll('.s-section, .s-title, .s-question, .s-final');
    sec.forEach(el => { el.style.background = t.sectionStyle === 'ink' ? '#0E0E1A' : ''; });
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="色彩" />
      <TweakColor label="配色方案" value={t.palette} options={PALETTES}
                  onChange={(v) => setTweak('palette', v)} />
      <TweakRadio label="章節頁背景" value={t.sectionStyle}
                  options={[{label:'主色',value:'navy'},{label:'墨黑',value:'ink'}]}
                  onChange={(v) => setTweak('sectionStyle', v)} />
      <TweakRadio label="內頁底色" value={t.slideBg}
                  options={[{label:'米白',value:'cream'},{label:'紙色',value:'paper'},{label:'純白',value:'white'}]}
                  onChange={(v) => setTweak('slideBg', v)} />

      <TweakSection label="排版" />
      <TweakRadio label="標題字體" value={t.titleFont}
                  options={[{label:'宋體',value:'serif'},{label:'黑體',value:'sans'}]}
                  onChange={(v) => setTweak('titleFont', v)} />
      <TweakSlider label="字型縮放" value={t.bodyScale}
                   min={0.9} max={1.15} step={0.05} unit="x"
                   onChange={(v) => setTweak('bodyScale', v)} />

      <TweakSection label="內容選項" />
      <TweakToggle label="顯示英文副標" value={t.showEnglish}
                   onChange={(v) => setTweak('showEnglish', v)} />
      <TweakToggle label="顯示頁面頭尾" value={t.showChrome}
                   onChange={(v) => setTweak('showChrome', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);
