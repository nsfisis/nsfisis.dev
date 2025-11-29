import { Config, getTagLabel } from "../config.ts";
import { Element, li, span, text, ul } from "../dom.ts";

type Props = {
  tags: string[];
  config: Config;
};

export default function TagList({ tags, config }: Props): Element {
  return ul(
    { class: "entry-tags" },
    ...tags.map((slug) =>
      li(
        { class: "tag" },
        span({ class: "tag-inner" }, text(getTagLabel(config, slug))),
      )
    ),
  );
}
