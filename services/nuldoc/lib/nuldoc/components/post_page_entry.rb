module Nuldoc
  module Components
    class PostPageEntry
      extend Dom

      def self.render(post:, config:)
        published = Revision.date_to_string(GeneratorUtils.published_date(post))
        updated = Revision.date_to_string(GeneratorUtils.updated_date(post))
        has_updates = GeneratorUtils.any_updates?(post)

        article({ 'class' => 'post-entry' },
                a({ 'href' => post.href },
                  header({ 'class' => 'entry-header' }, h2({}, post.title)),
                  section({ 'class' => 'entry-content' }, p({}, post.description)),
                  footer({ 'class' => 'entry-footer' },
                         elem('time', { 'datetime' => published }, published),
                         ' 投稿',
                         has_updates ? '、' : nil,
                         has_updates ? elem('time', { 'datetime' => updated }, updated) : nil,
                         has_updates ? ' 更新' : nil,
                         post.tags.length.positive? ? TagList.render(tags: post.tags, config: config) : nil)))
      end
    end
  end
end
