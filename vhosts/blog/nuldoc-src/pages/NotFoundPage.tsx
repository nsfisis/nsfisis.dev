import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config } from "../config.ts";

export default function NotFoundPage(
  config: Config,
) {
  return (
    <PageLayout
      metaCopyrightYear={config.blog.siteCopyrightYear}
      metaDescription="リクエストされたページが見つかりません"
      metaTitle={`Page Not Found｜${config.blog.siteName}`}
      config={config}
    >
      <body className="single">
        <GlobalHeader config={config} />
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
