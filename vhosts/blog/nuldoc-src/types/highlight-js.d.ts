declare module "highlight.js" {
  function getLanguage(
    name: string,
  ): string | undefined;

  function highlight(
    code: string,
    options: { language: string },
  ): { value: string };
}
