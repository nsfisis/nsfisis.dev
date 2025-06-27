export class NuldocError extends Error {
  static {
    this.prototype.name = "NuldocError";
  }
}

export class SlideError extends Error {
  static {
    this.prototype.name = "SlideError";
  }
}

export class XmlParseError extends Error {
  static {
    this.prototype.name = "XmlParseError";
  }
}
