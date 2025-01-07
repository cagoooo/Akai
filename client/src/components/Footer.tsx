export function Footer() {
  return (
    <footer className="w-full py-4 px-6 mt-auto border-t border-border bg-background">
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <img 
          src="/assets/圈圈.png" 
          alt="Shin Men Elementary School Logo" 
          className="h-8 w-8 object-contain"
        />
        <p>
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