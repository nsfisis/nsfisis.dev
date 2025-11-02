import { Config } from "../config.ts";

export default function GlobalHeader({ config }: { config: Config }) {
  return (
    <header className="header">
      <div className="site-logo">
        <a href={`https://${config.sites.default.fqdn}/`}>
          nsfisis.dev
        </a>
      </div>
      <div className="site-name">
        {config.sites.blog.siteName}
      </div>
      <nav className="nav">
        <ul>
          <li>
            <a href={`https://${config.sites.about.fqdn}/`}>About</a>
          </li>
          <li>
            <a href="/posts/">Posts</a>
          </li>
          <li>
            <a href="/tags/">Tags</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
