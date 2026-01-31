module Nuldoc
  module Components
    class TableOfContents
      extend Dom

      def self.render(toc:)
        nav({ 'class' => 'toc' },
            h2({}, '目次'),
            ul({}, *toc.items.map { |entry| toc_entry_component(entry) }))
      end

      def self.toc_entry_component(entry)
        li({},
           a({ 'href' => "##{entry.id}" }, entry.text),
           entry.children.length.positive? ? ul({}, *entry.children.map { |child| toc_entry_component(child) }) : nil)
      end

      private_class_method :toc_entry_component
    end
  end
end
