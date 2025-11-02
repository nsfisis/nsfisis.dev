import { Config } from "../config.ts";

export default function GlobalHeader({ config }: { config: Config }) {
  return (
    <header className="header">
      <div className="site-logo">
        <a href={`https://${config.sites.default.fqdn}/`}>
          {config.blog.siteName}
        </a>
      </div>
    </header>
  );
}
