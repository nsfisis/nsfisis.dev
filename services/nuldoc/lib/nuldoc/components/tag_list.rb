module Nuldoc
  module Components
    class TagList
      extend DOM::HTML

      def self.render(tags:, config:)
        ul(class: 'entry-tags') do
          tags.each do |slug|
            li(class: 'tag') do
              span(class: 'tag-inner') { text config.tag_label(slug) }
            end
          end
        end
      end
    end
  end
end
