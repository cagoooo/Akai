import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';

/**
 * 公佈欄頁尾：顯示版本、致意文字
 */
export function BulletinFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        padding: '40px 60px 60px',
        textAlign: 'center',
        fontFamily: tokens.font.tc,
      }}
      className="bulletin-footer"
    >
      <div style={{ marginBottom: 16 }}>
        <Tape color={tokens.note.yellow} angle={-1.5} width={220}>
          <span style={{ fontSize: 12 }}>🙌 Made with love · 教學現場</span>
        </Tape>
      </div>
      <p
        style={{
          fontSize: 12,
          color: tokens.muted,
          margin: 0,
          fontFamily: tokens.font.en,
          letterSpacing: '0.05em',
        }}
      >
        © {year} 阿凱老師 · 石門國小教育科技專區
      </p>
    </footer>
  );
}
