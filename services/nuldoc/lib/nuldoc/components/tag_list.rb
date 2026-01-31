module Nuldoc
  module Components
    class TagList
      extend Dom

      def self.render(tags:, config:)
        ul({ 'class' => 'entry-tags' },
           *tags.map do |slug|
             li({ 'class' => 'tag' },
                span({ 'class' => 'tag-inner' }, text(config.tag_label(slug))))
           end)
      end
    end
  end
end
