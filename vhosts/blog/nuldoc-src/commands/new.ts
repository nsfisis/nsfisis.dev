import { dirname, join } from "std/path/mod.ts";
import { ensureDir } from "std/fs/mod.ts";
import { parse } from "std/flags/mod.ts";
import { Config } from "../config.ts";

export async function runNewCommand(config: Config) {
  const parsedArgs = parse(Deno.args, {
    string: ["date"],
  });

  const type = parsedArgs._[1];
  if (type !== "post" && type !== "slide") {
    console.log(`Usage: nuldoc new <type>

<type> must be either "post" or "slide".

OPTIONS:
  --date <DATE>
`);
    Deno.exit(1);
  }

  const ymd = (() => {
    if (parsedArgs.date) {
      return parsedArgs.date;
    }

    const now = new Date();
    const y = now.getFullYear();
    const d = (now.getMonth() + 1).toString().padStart(2, "0");
    const m = now.getDate().toString().padStart(2, "0");
    return `${y}-${d}-${m}`;
  })();

  const destFilePath = join(
    Deno.cwd(),
    config.locations.contentDir,
    getDirPath(type),
    ymd,
    getFilename(type),
  );

  await ensureDir(dirname(destFilePath));
  await Deno.writeTextFile(destFilePath, getTemplate(type, ymd));
  console.log(
    `New file ${
      destFilePath.replace(Deno.cwd(), "")
    } was successfully created.`,
  );
}

function getFilename(type: "post" | "slide"): string {
  return type === "post" ? "TODO.ndoc" : "TODO.toml";
}

function getDirPath(type: "post" | "slide"): string {
  return type === "post" ? "posts" : "slides";
}

function getTemplate(type: "post" | "slide", date: string): string {
  if (type === "post") {
    return `---
[article]
title = "TODO"
description = "TODO"
tags = [
  "TODO",
]

[[article.revisions]]
date = "${date}"
remark = "公開"
---
<article>
  <section id="TODO">
    <h>TODO</h>
    <p>
      TODO
    </p>
  </section>
</article>
`;
  } else {
    return `[slide]
title = "TODO"
event = "TODO"
talkType = "TODO"
link = "TODO"
tags = [
  "TODO",
]

[[slide.revisions]]
date = "${date}"
remark = "登壇"
`;
  }
}
