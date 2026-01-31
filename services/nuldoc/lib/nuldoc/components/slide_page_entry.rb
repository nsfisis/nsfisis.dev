module Nuldoc
  module Components
    class SlidePageEntry
      extend Dom

      def self.render(slide:, config:)
        published = Revision.date_to_string(GeneratorUtils.published_date(slide))
        updated = Revision.date_to_string(GeneratorUtils.updated_date(slide))
        has_updates = GeneratorUtils.any_updates?(slide)

        article({ 'class' => 'post-entry' },
                a({ 'href' => slide.href },
                  header({ 'class' => 'entry-header' }, h2({}, slide.title)),
                  section({ 'class' => 'entry-content' }, p({}, slide.description)),
                  footer({ 'class' => 'entry-footer' },
                         elem('time', { 'datetime' => published }, published),
                         ' 登壇',
                         has_updates ? '、' : nil,
                         has_updates ? elem('time', { 'datetime' => updated }, updated) : nil,
                         has_updates ? ' 更新' : nil,
                         slide.tags.length.positive? ? TagList.render(tags: slide.tags, config: config) : nil)))
      end
    end
  end
end
