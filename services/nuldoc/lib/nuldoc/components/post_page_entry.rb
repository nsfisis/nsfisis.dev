module Nuldoc
  module Components
    class PostPageEntry
      extend DOM::HTML

      def self.render(post:, config:)
        published = Revision.date_to_string(GeneratorUtils.published_date(post))
        updated = Revision.date_to_string(GeneratorUtils.updated_date(post))
        has_updates = GeneratorUtils.any_updates?(post)

        article(class: 'post-entry') do
          a(href: post.href) do
            header(class: 'entry-header') { h2 { text post.title } }
            section(class: 'entry-content') { p { text post.description } }
            footer(class: 'entry-footer') do
              time(datetime: published) { text published }
              text ' 投稿'
              if has_updates
                text '、'
                time(datetime: updated) { text updated }
                text ' 更新'
              end
              TagList.render(tags: post.tags, config: config) if post.tags.length.positive?
            end
          end
        end
      end
    end
  end
end
