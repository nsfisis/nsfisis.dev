module Nuldoc
  module Components
    class TableOfContents
      extend DOM::HTML

      def self.render(toc:)
        nav(class: 'toc') do
          h2 { text '目次' }
          ul { toc.items.each { |entry| toc_entry_component(entry) } }
        end
      end

      def self.toc_entry_component(entry)
        li do
          a(href: "##{entry.id}") { text entry.text }
          ul { entry.children.each { |c| toc_entry_component(c) } } if entry.children.length.positive?
        end
      end

      private_class_method :toc_entry_component
    end
  end
end
