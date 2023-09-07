import { dirname, join } from "std/path/mod.ts";
import { ensureDir } from "std/fs/mod.ts";
import { Config } from "../config.ts";

export async function runNewCommand(config: Config) {
  const type = Deno.args[1];
  if (type !== "post" && type !== "slide") {
    console.log(`Usage: nuldoc new <type>

<type> must be either post or slide.`);
    Deno.exit(1);
  }

  const now = new Date();
  const ymd = `${now.getFullYear()}-${
    (now.getMonth() + 1).toString().padStart(2, "0")
  }-${now.getDate().toString().padStart(2, "0")}`;

  const destFilePath = join(
    Deno.cwd(),
    config.locations.contentDir,
    getDirPath(type),
    ymd,
    "TODO.xml",
  );

  await ensureDir(dirname(destFilePath));
  await Deno.writeTextFile(destFilePath, getTemplate(type, ymd));
  console.log(
    `New file ${
      destFilePath.replace(Deno.cwd(), "")
    } was successfully created.`,
  );
}

function getDirPath(type: "post" | "slide"): string {
  return type === "post" ? "posts" : "slides";
}

function getTemplate(type: "post" | "slide", date: string): string {
  if (type === "post") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<article xmlns="http://docbook.org/ns/docbook" xmlns:xl="http://www.w3.org/1999/xlink" version="5.0">
  <info>
    <title>TODO</title>
    <abstract>
      TODO
    </abstract>
    <keywordset>
      <keyword>TODO</keyword>
    </keywordset>
    <revhistory>
      <revision>
        <date>${date}</date>
        <revremark>公開</revremark>
      </revision>
    </revhistory>
  </info>
  <section xml:id="TODO">
    <title>TODO</title>
    <para>
      TODO
    </para>
  </section>
</article>
`;
  } else {
    return `<?xml version="1.0" encoding="UTF-8"?>
<slide>
  <info>
    <title>TODO</title>
    <event>
      TODO
    </event>
    <talktype>
      TODO
    </talktype>
    <link>TODO</link>
    <keywordset>
      <keyword>TODO</keyword>
    </keywordset>
    <revhistory>
      <revision>
        <date>${date}</date>
        <revremark>登壇</revremark>
      </revision>
    </revhistory>
  </info>
</slide>
`;
  }
}
