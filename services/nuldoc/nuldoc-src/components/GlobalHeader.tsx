import { Config } from "../config.ts";

export default function GlobalHeader({ config }: { config: Config }) {
  return (
    <header className="header">
      <div className="site-logo">
        <a href="/">{config.blog.siteName}</a>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <a href="/about/">About</a>
          </li>
          <li>
            <a href="/posts/">Posts</a>
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
