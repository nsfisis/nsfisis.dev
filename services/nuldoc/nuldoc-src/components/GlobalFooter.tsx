import { Config } from "../config.ts";

export default function GlobalFooter({ config }: { config: Config }) {
  return (
    <footer className="footer">
      {`&copy; ${config.site.copyrightYear} ${config.blog.author}`}
    </footer>
  );
}
