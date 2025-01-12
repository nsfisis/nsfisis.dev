import GlobalFooter from "../components/GlobalFooter.tsx";
import { renderToDOM } from "../jsx/render.ts";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config } from "../config.ts";
import { Page } from "../page.ts";

export type NotFoundPage = Page;

export async function generateNotFoundPage(
  config: Config,
): Promise<NotFoundPage> {
  const html = await renderToDOM(
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
    </PageLayout>,
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/404.html",
    href: "/404.html",
  };
}
