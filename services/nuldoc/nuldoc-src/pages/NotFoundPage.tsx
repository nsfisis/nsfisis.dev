import GlobalFooter from "../components/GlobalFooter.tsx";
import AboutGlobalHeader from "../components/AboutGlobalHeader.tsx";
import BlogGlobalHeader from "../components/BlogGlobalHeader.tsx";
import SlidesGlobalHeader from "../components/SlidesGlobalHeader.tsx";
import DefaultGlobalHeader from "../components/DefaultGlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config } from "../config.ts";

export default function NotFoundPage(
  site: "default" | "about" | "blog" | "slides",
  config: Config,
) {
  return (
    <PageLayout
      metaCopyrightYear={config.site.copyrightYear}
      metaDescription="リクエストされたページが見つかりません"
      metaTitle={`Page Not Found｜${config.blog.siteName}`}
      config={config}
    >
      <body className="single">
        {site === "about"
          ? <AboutGlobalHeader config={config} />
          : site === "blog"
          ? <BlogGlobalHeader config={config} />
          : site === "slides"
          ? <SlidesGlobalHeader config={config} />
          : <DefaultGlobalHeader config={config} />}
        <main className="main">
          <article>
            <div className="not-found">404</div>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
