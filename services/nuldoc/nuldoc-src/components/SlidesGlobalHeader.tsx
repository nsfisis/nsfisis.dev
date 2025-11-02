import { Config } from "../config.ts";

export default function GlobalHeader({ config }: { config: Config }) {
  return (
    <header className="header">
      <div className="site-logo">
        <a href={`https://${config.sites.default.fqdn}/`}>
          nsfisis.dev
        </a>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <a href={`https://${config.sites.about.fqdn}/`}>About</a>
          </li>
          <li>
            <a href="/slides/">Slides</a>
          </li>
          <li>
            <a href="/tags/">Tags</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
