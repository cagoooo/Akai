export function Footer() {
  return (
    <footer className="w-full py-6 px-4 sm:px-6 mt-auto border-t border-border bg-background">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
        <div className="flex justify-center w-full sm:w-auto mb-2 sm:mb-0">
          <picture>
            <source 
              srcSet="/assets/圈圈-dark.png" 
              media="(prefers-color-scheme: dark)" 
            />
            <img 
              src="/assets/圈圈.png" 
              alt="Shin Men Elementary School Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain transition-all duration-300 hover:scale-110 hover:rotate-[5deg] dark:invert"
              loading="lazy"
            />
          </picture>
        </div>
        <p className="text-center sm:text-left pb-4 sm:pb-0">
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