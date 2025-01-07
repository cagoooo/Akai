export function Footer() {
  return (
    <footer className="w-full py-4 px-6 mt-auto border-t border-border bg-background">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()}{" "}
          <a 
            href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline transition-all duration-300"
          >
            教育科技創新專區
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}