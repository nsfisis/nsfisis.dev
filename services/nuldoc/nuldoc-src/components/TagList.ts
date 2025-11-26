import { Config, getTagLabel } from "../config.ts";
import { elem, Element, text } from "../dom.ts";

type Props = {
  tags: string[];
  config: Config;
};

export default function TagList({ tags, config }: Props): Element {
  return elem(
    "ul",
    { class: "entry-tags" },
    ...tags.map((slug) =>
      elem("li", { class: "tag" }, text(getTagLabel(config, slug)))
    ),
  );
}
