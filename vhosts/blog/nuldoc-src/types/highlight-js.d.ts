declare module "highlight.js" {
  function registerAliases(
    aliases: string | string[],
    language: { languageName: string },
  ): void;

  function getLanguage(
    name: string,
  ): string | undefined;

  function highlight(
    code: string,
    options: { language: string },
  ): { value: string };
}
