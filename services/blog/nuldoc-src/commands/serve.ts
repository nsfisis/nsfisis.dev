import { parseArgs } from "@std/cli";
import { serveDir, STATUS_CODE, STATUS_TEXT } from "@std/http";
import { join } from "@std/path";
import { Config } from "../config.ts";
import { runBuildCommand } from "./build.ts";

function isResourcePath(pathname: string): boolean {
  const EXTENSIONS = [
    ".css",
    ".gif",
    ".ico",
    ".jpeg",
    ".jpg",
    ".js",
    ".mjs",
    ".png",
    ".svg",
  ];
  return EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

export function runServeCommand(config: Config) {
  const parsedArgs = parseArgs(Deno.args, {
    boolean: ["no-rebuild"],
  });

  const doRebuild = !parsedArgs["no-rebuild"];
  const rootDir = join(Deno.cwd(), config.locations.destDir);
  Deno.serve({ hostname: "127.0.0.1" }, async (req) => {
    const pathname = new URL(req.url).pathname;
    if (!isResourcePath(pathname) && doRebuild) {
      await runBuildCommand(config);
      console.log("rebuild");
    }
    const res = await serveDir(req, {
      fsRoot: rootDir,
      showIndex: true,
    });
    if (res.status !== STATUS_CODE.NotFound) {
      return res;
    }

    const notFoundHtml = await Deno.readTextFile(join(rootDir, "404.html"));
    return new Response(notFoundHtml, {
      status: STATUS_CODE.NotFound,
      statusText: STATUS_TEXT[STATUS_CODE.NotFound],
      headers: {
        "content-type": "text/html",
      },
    });
  });
}
