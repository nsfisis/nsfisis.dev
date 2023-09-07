import { serveDir } from "std/http/file_server.ts";
import { Status, STATUS_TEXT } from "std/http/http_status.ts";
import { serve } from "std/http/server.ts";
import { join } from "std/path/mod.ts";
import { Config } from "../config.ts";

export function runServeCommand(config: Config) {
  const rootDir = join(Deno.cwd(), config.locations.destDir);
  serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    if (!pathname.endsWith("css") && !pathname.endsWith("svg")) {
      const command = new Deno.Command(
        join(Deno.cwd(), "nuldoc"),
        {
          args: ["build"],
        },
      );
      await command.output();
      console.log("rebuild");
    }
    const res = await serveDir(req, {
      fsRoot: rootDir,
      showIndex: true,
    });
    if (res.status !== Status.NotFound) {
      return res;
    }

    const notFoundHtml = await Deno.readTextFile(join(rootDir, "404.html"));
    return new Response(notFoundHtml, {
      status: Status.NotFound,
      statusText: STATUS_TEXT[Status.NotFound],
      headers: {
        "content-type": "text/html",
      },
    });
  });
}
