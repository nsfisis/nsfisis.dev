module Nuldoc
  module DOM
    class AtomXMLBuilder < Builder
      def author(**attrs, &) = elem('author', **attrs, &)
      def entry(**attrs, &) = elem('entry', **attrs, &)
      def feed(**attrs, &) = elem('feed', **attrs, &)
      def id(**attrs, &) = elem('id', **attrs, &)
      def link(**attrs) = elem('link', **attrs)
      def name(**attrs, &) = elem('name', **attrs, &)
      def published(**attrs, &) = elem('published', **attrs, &)
      def summary(**attrs, &) = elem('summary', **attrs, &)
      def title(**attrs, &) = elem('title', **attrs, &)
      def updated(**attrs, &) = elem('updated', **attrs, &)
    end
  end
end
