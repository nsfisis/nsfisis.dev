module Nuldoc
  module Components
    class SlidePageEntry
      extend DOM::HTML

      def self.render(slide:, config:)
        published = Revision.date_to_string(GeneratorUtils.published_date(slide))
        updated = Revision.date_to_string(GeneratorUtils.updated_date(slide))
        has_updates = GeneratorUtils.any_updates?(slide)

        article(class: 'post-entry') do
          a(href: slide.href) do
            header(class: 'entry-header') { h2 { text slide.title } }
            section(class: 'entry-content') { p { text slide.description } }
            footer(class: 'entry-footer') do
              time(datetime: published) { text published }
              text ' 登壇'
              if has_updates
                text '、'
                time(datetime: updated) { text updated }
                text ' 更新'
              end
              TagList.render(tags: slide.tags, config: config) if slide.tags.length.positive?
            end
          end
        end
      end
    end
  end
end
