export type Feed = {
  author: string;
  icon: string;
  id: string;
  linkToSelf: string;
  linkToAlternate: string;
  title: string;
  updated: string;
  entries: Entry[];
};

export type Entry = {
  id: string;
  linkToAlternate: string;
  published: string;
  summary: string;
  title: string;
  updated: string;
};
