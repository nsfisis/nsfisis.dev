import { Config, getTagLabel } from "../config.ts";

type Props = {
  tags: string[];
  config: Config;
};

export default function TagList({ tags, config }: Props) {
  return (
    <ul className="entry-tags">
      {tags.map((slug) => (
        <li className="tag" key={slug}>
          {getTagLabel(config, slug)}
        </li>
      ))}
    </ul>
  );
}
