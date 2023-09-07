import { assertEquals } from "std/testing/asserts.ts";
import { parseXmlString } from "./xml.ts";

Deno.test("Parse XML", () => {
  assertEquals(
    "__root__",
    parseXmlString(
      `<?xml version="1.0" encoding="UTF-8"?>
<hoge>
  <piyo>
    <!-- comment -->
  </piyo>
</hoge>
`,
    ).name,
  );
});
