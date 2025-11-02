import { join } from "@std/path";
import { parse as parseToml } from "@std/toml";
import { z } from "zod/mod.ts";

const ConfigSchema = z.object({
  locations: z.object({
    contentDir: z.string(),
    destDir: z.string(),
    staticDir: z.string(),
  }),
  rendering: z.object({
    html: z.object({
      indentWidth: z.number(),
    }),
  }),
  site: z.object({
    author: z.string(),
    copyrightYear: z.number(),
  }),
  sites: z.object({
    default: z.object({
      fqdn: z.string(),
      siteName: z.string(),
    }),
    about: z.object({
      fqdn: z.string(),
      siteName: z.string(),
    }),
    blog: z.object({
      fqdn: z.string(),
      siteName: z.string(),
    }),
    slides: z.object({
      fqdn: z.string(),
      siteName: z.string(),
    }),
  }),
  blog: z.object({
    postsPerPage: z.number().default(10),
    tagLabels: z.record(z.string(), z.string()),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function getTagLabel(c: Config, slug: string): string {
  if (!(slug in c.blog.tagLabels)) {
    throw new Error(`Unknown tag: ${slug}`);
  }
  return c.blog.tagLabels[slug];
}

export function getDefaultConfigPath(): string {
  return join(Deno.cwd(), "nuldoc.toml");
}

export async function loadConfig(filePath: string): Promise<Config> {
  return ConfigSchema.parse(parseToml(await Deno.readTextFile(filePath)));
}
