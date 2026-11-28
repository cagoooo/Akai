// 使用 Vite 的 import.meta.env.BASE_URL 獲取正確的資源路徑
const getAssetPath = (path: string) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
};

export function Footer() {
  return (
    <footer className="w-full py-4 px-6 mt-auto border-t border-border bg-background">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
        <a
          href="https://www.smes.tyc.edu.tw/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-110"
        >
          <img
            src={getAssetPath('assets/圈圈.webp')}
            alt="Shi Men Elementary School Logo"
            className="h-6 w-6 sm:h-8 sm:w-8 object-contain transition-all duration-300 hover:rotate-[5deg] dark:invert mb-2 sm:mb-0"
            loading="lazy"
          />
        </a>
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://www.smes.tyc.edu.tw/modules/school/index.php?department_id=2&zone_id=0&page_id=2&content_id=11&type=news&from_op=all_news#a5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary hover:underline transition-colors duration-300"
          >
            教育科技創新專區
          </a>
          . All rights reserved.
        </p>
        <p className="text-center flex items-center gap-3">
          <a
            href="https://www.facebook.com/tycsmes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="石門國小 Facebook 粉絲專頁（另開新視窗）"
            className="text-muted-foreground hover:text-primary hover:underline transition-colors duration-300"
          >
            📘 FB 粉專
          </a>
          <a
            href="https://www.youtube.com/@tycsmes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="石門國小 YouTube 官方頻道（另開新視窗）"
            className="text-muted-foreground hover:text-primary hover:underline transition-colors duration-300"
          >
            ▶️ YouTube
          </a>
          <a
            href="https://github.com/cagoooo/Akai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="教育科技創新專區 GitHub 原始碼（另開新視窗）"
            className="text-muted-foreground hover:text-primary hover:underline transition-colors duration-300"
          >
            💻 GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
