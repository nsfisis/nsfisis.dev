import { serveDir } from "std/http/file_server.ts";
import { STATUS_CODE, STATUS_TEXT } from "std/http/mod.ts";
import { join } from "std/path/mod.ts";
import { Config } from "../config.ts";

export function runServeCommand(config: Config) {
  const rootDir = join(Deno.cwd(), config.locations.destDir);
  Deno.serve(async (req) => {
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
