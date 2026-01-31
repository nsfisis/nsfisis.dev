module Nuldoc
  module DOM
    module AtomXML
      def self.extended(base)
        base.extend(DOM)
      end

      def self.included(base)
        base.include(DOM)
      end

      module_function

      def author(**attrs, &) = DOM.elem('author', **attrs, &)
      def entry(**attrs, &) = DOM.elem('entry', **attrs, &)
      def feed(**attrs, &) = DOM.elem('feed', **attrs, &)
      def id(**attrs, &) = DOM.elem('id', **attrs, &)
      def link(**attrs) = DOM.elem('link', **attrs)
      def name(**attrs, &) = DOM.elem('name', **attrs, &)
      def published(**attrs, &) = DOM.elem('published', **attrs, &)
      def summary(**attrs, &) = DOM.elem('summary', **attrs, &)
      def title(**attrs, &) = DOM.elem('title', **attrs, &)
      def updated(**attrs, &) = DOM.elem('updated', **attrs, &)
    end
  end
end
