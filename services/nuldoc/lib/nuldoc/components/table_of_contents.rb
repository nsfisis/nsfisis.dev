module Nuldoc
  module Components
    class TableOfContents < DOM::HTMLBuilder
      def initialize(toc:)
        super()
        @toc = toc
      end

      def build
        nav(class: 'toc') do
          h2 { text '目次' }
          ul { @toc.items.each { |entry| toc_entry_component(entry) } }
        end
      end

      private

      def toc_entry_component(entry)
        li do
          a(href: "##{entry.id}") { text entry.text }
          ul { entry.children.each { |c| toc_entry_component(c) } } if entry.children.length.positive?
        end
      end
    end
  end
end
