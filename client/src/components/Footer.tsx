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
            src={getAssetPath('assets/圈圈.png')}
            alt="Shi Men Elementary School Logo"
            className="h-6 w-6 sm:h-8 sm:w-8 object-contain transition-all duration-300 hover:rotate-[5deg] dark:invert mb-2 sm:mb-0"
            loading="lazy"
          />
        </a>
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary hover:underline transition-colors duration-300"
          >
            教育科技創新專區
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}