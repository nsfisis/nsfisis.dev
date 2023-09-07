export class DocBookError extends Error {
  static {
    this.prototype.name = "DocBookError";
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
