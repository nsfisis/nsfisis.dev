module Nuldoc
  module Components
    class TagList < DOM::HTMLBuilder
      def initialize(tags:, config:)
        super()
        @tags = tags
        @config = config
      end

      def build
        ul(class: 'entry-tags') do
          @tags.each do |slug|
            li(class: 'tag') do
              span(class: 'tag-inner') { text @config.tag_label(slug) }
            end
          end
        end
      end
    end
  end
end
