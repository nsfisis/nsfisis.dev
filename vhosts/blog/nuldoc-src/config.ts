export const config = {
  locations: {
    contentDir: "/content",
    destDir: "/public",
    staticDir: "/static",
  },
  rendering: {
    html: {
      indentWidth: 2,
    },
  },
  blog: {
    author: "nsfisis",
    siteName: "REPL: Rest-Eat-Program Loop",
    siteCopyrightYear: 2021,
    tagLabels: {
      "conference": "カンファレンス",
      "cpp": "C++",
      "cpp17": "C++ 17",
      "note-to-self": "備忘録",
      "php": "PHP",
      "phpconfuk": "PHP カンファレンス福岡",
      "phpconokinawa": "PHP カンファレンス沖縄",
      "phperkaigi": "PHPerKaigi",
      "phpstudy-tokyo": "PHP 勉強会@東京",
      "python": "Python",
      "python3": "Python 3",
      "ruby": "Ruby",
      "ruby3": "Ruby 3",
      "rust": "Rust",
      "vim": "Vim",
      "wasm": "WebAssembly",
    },
  },
};

export type Config = typeof config;

export function getTagLabel(c: Config, slug: string): string {
  if (!(slug in c.blog.tagLabels)) {
    throw new Error(`Unknown tag: ${slug}`);
  }
  return (c.blog.tagLabels as { [slug: string]: string })[slug];
}
