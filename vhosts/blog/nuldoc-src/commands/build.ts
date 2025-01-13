import { dirname, join, joinGlobs } from "std/path/mod.ts";
import { ensureDir } from "std/fs/mod.ts";
import { expandGlob } from "std/fs/expand_glob.ts";
import { generateFeedPageFromEntries } from "../generators/atom.ts";
import { Config, getTagLabel } from "../config.ts";
import { parseNulDocFile } from "../ndoc/parse.ts";
import { Page } from "../page.ts";
import { render } from "../render.ts";
import { dateToString } from "../revision.ts";
import { generateAboutPage } from "../generators/about.ts";
import { generateHomePage } from "../generators/home.ts";
import { generateNotFoundPage } from "../generators/not_found.ts";
import {
  generatePostPage,
  getPostPublishedDate,
  PostPage,
} from "../generators/post.ts";
import { generatePostListPage } from "../generators/post_list.ts";
import { generateSlidePage, SlidePage } from "../generators/slide.ts";
import { generateSlideListPage } from "../generators/slide_list.ts";
import { generateTagPage, TagPage } from "../generators/tag.ts";
import { TaggedPage } from "../generators/tagged_page.ts";
import { generateTagListPage } from "../generators/tag_list.ts";
import { parseSlideFile } from "../slide/parse.ts";

export async function runBuildCommand(config: Config) {
  const posts = await buildPostPages(config);
  await buildPostListPage(posts, config);
  const slides = await buildSlidePages(config);
  await buildSlideListPage(slides, config);
  const tags = await buildTagPages(posts, slides, config);
  await buildTagListPage(tags, config);
  await buildHomePage(config);
  await buildAboutPage(slides, config);
  await buildNotFoundPage(config);
  await buildFeedOfAllContents(posts, slides, config);
  await copyStaticFiles(config);
  await copyAssetFiles(slides, config);
}

async function buildPostPages(config: Config): Promise<PostPage[]> {
  const sourceDir = join(Deno.cwd(), config.locations.contentDir, "posts");
  const postFiles = await collectPostFiles(sourceDir);
  const posts = await parsePosts(postFiles, config);
  for (const post of posts) {
    await writePage(post, config);
  }
  return posts;
}

async function collectPostFiles(sourceDir: string): Promise<string[]> {
  const filePaths = [];
  const globPattern = joinGlobs([sourceDir, "**", "*.ndoc"]);
  for await (const entry of expandGlob(globPattern)) {
    filePaths.push(entry.path);
  }
  return filePaths;
}

async function parsePosts(
  postFiles: string[],
  config: Config,
): Promise<PostPage[]> {
  const posts = [];
  for (const postFile of postFiles) {
    posts.push(
      await generatePostPage(await parseNulDocFile(postFile, config), config),
    );
  }
  return posts;
}

async function buildPostListPage(posts: PostPage[], config: Config) {
  const postListPage = await generatePostListPage(posts, config);
  await writePage(postListPage, config);
  const postFeedPage = await generateFeedPageFromEntries(
    postListPage.href,
    "posts",
    `投稿一覧｜${config.blog.siteName}`,
    posts,
    config,
  );
  await writePage(postFeedPage, config);
}

async function buildSlidePages(config: Config): Promise<SlidePage[]> {
  const sourceDir = join(Deno.cwd(), config.locations.contentDir, "slides");
  const slideFiles = await collectSlideFiles(sourceDir);
  const slides = await parseSlides(slideFiles, config);
  for (const slide of slides) {
    await writePage(slide, config);
  }
  return slides;
}

async function collectSlideFiles(sourceDir: string): Promise<string[]> {
  const filePaths = [];
  const globPattern = joinGlobs([sourceDir, "**", "*.toml"]);
  for await (const entry of expandGlob(globPattern)) {
    filePaths.push(entry.path);
  }
  return filePaths;
}

async function parseSlides(
  slideFiles: string[],
  config: Config,
): Promise<SlidePage[]> {
  const slides = [];
  for (const slideFile of slideFiles) {
    slides.push(
      await generateSlidePage(await parseSlideFile(slideFile), config),
    );
  }
  return slides;
}

async function buildSlideListPage(slides: SlidePage[], config: Config) {
  const slideListPage = await generateSlideListPage(slides, config);
  await writePage(slideListPage, config);
  const slideFeedPage = await generateFeedPageFromEntries(
    slideListPage.href,
    "slides",
    `スライド一覧｜${config.blog.siteName}`,
    slides,
    config,
  );
  await writePage(slideFeedPage, config);
}

async function buildHomePage(config: Config) {
  const homePage = await generateHomePage(config);
  await writePage(homePage, config);
}

async function buildAboutPage(slides: SlidePage[], config: Config) {
  const aboutPage = await generateAboutPage(slides, config);
  await writePage(aboutPage, config);
}

async function buildNotFoundPage(config: Config) {
  const notFoundPage = await generateNotFoundPage(config);
  await writePage(notFoundPage, config);
}

async function buildFeedOfAllContents(
  posts: PostPage[],
  slides: SlidePage[],
  config: Config,
) {
  const feed = await generateFeedPageFromEntries(
    "/",
    "all",
    config.blog.siteName,
    [...posts, ...slides],
    config,
  );
  await writePage(feed, config);
}

async function buildTagPages(
  posts: PostPage[],
  slides: SlidePage[],
  config: Config,
): Promise<TagPage[]> {
  const tagsAndPages = collectTags([...posts, ...slides]);
  const tags = [];
  for (const [tag, pages] of tagsAndPages) {
    const tagPage = await generateTagPage(tag, pages, config);
    await writePage(tagPage, config);
    const tagFeedPage = await generateFeedPageFromEntries(
      tagPage.href,
      `tag-${tag}`,
      `タグ「${getTagLabel(config, tag)}」一覧｜${config.blog.siteName}`,
      pages,
      config,
    );
    await writePage(tagFeedPage, config);
    tags.push(tagPage);
  }
  return tags;
}

async function buildTagListPage(tags: TagPage[], config: Config) {
  const tagListPage = await generateTagListPage(tags, config);
  await writePage(tagListPage, config);
}

function collectTags(taggedPages: TaggedPage[]): [string, TaggedPage[]][] {
  const tagsAndPages = new Map();
  for (const page of taggedPages) {
    for (const tag of page.tags) {
      if (!tagsAndPages.has(tag)) {
        tagsAndPages.set(tag, []);
      }
      tagsAndPages.get(tag).push(page);
    }
  }

  const result: [string, TaggedPage[]][] = [];
  for (const tag of Array.from(tagsAndPages.keys()).sort()) {
    result.push([
      tag,
      tagsAndPages.get(tag).sort((a: TaggedPage, b: TaggedPage) => {
        const ta = dateToString(getPostPublishedDate(a));
        const tb = dateToString(getPostPublishedDate(b));
        if (ta > tb) return -1;
        if (ta < tb) return 1;
        return 0;
      }),
    ]);
  }
  return result;
}

async function copyStaticFiles(config: Config) {
  const globPattern = joinGlobs([Deno.cwd(), config.locations.staticDir, "*"]);
  for await (const entry of expandGlob(globPattern)) {
    const src = entry.path;
    const dst = src.replace(
      config.locations.staticDir,
      config.locations.destDir,
    );
    await Deno.copyFile(src, dst);
  }
}

async function copyAssetFiles(slides: SlidePage[], config: Config) {
  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destDir = join(cwd, config.locations.destDir);

  for (const slide of slides) {
    const src = join(contentDir, slide.slideLink);
    const dst = join(destDir, slide.slideLink);
    await ensureDir(dirname(dst));
    await Deno.copyFile(src, dst);
  }
}

async function writePage(page: Page, config: Config) {
  const destFilePath = join(
    Deno.cwd(),
    config.locations.destDir,
    page.destFilePath,
  );
  await ensureDir(dirname(destFilePath));
  await Deno.writeTextFile(destFilePath, render(page.root, page.renderer));
}
