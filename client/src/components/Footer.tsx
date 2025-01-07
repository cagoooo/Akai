import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full py-4 px-6 mt-auto border-t border-border bg-background">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} 教育科技創新專區.{" "}
          <a 
            href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            All rights reserved.
          </a>
        </p>
      </div>
    </footer>
  );
}
