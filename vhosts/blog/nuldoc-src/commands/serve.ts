import { serveDir, STATUS_CODE, STATUS_TEXT } from "@std/http";
import { join } from "@std/path";
import { Config } from "../config.ts";
import { runBuildCommand } from "./build.ts";

export function runServeCommand(config: Config) {
  const rootDir = join(Deno.cwd(), config.locations.destDir);
  Deno.serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    if (!pathname.endsWith("css") && !pathname.endsWith("svg")) {
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
