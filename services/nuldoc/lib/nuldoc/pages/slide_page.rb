module Nuldoc
  module Pages
    class SlidePage
      extend Dom

      def self.render(slide:, config:)
        Components::PageLayout.render(
          meta_copyright_year: GeneratorUtils.published_date(slide).year,
          meta_description: "「#{slide.title}」(#{slide.event} で登壇)",
          meta_keywords: slide.tags.map { |slug| config.tag_label(slug) },
          meta_title: "#{slide.title} (#{slide.event})｜#{config.sites.slides.site_name}",
          site: 'slides',
          config: config,
          children: elem('body', { 'class' => 'single' },
                         Components::StaticStylesheet.render(site: 'slides', file_name: '/slides.css',
                                                             config: config),
                         Components::SlidesGlobalHeader.render(config: config),
                         elem('main', { 'class' => 'main' },
                              article({ 'class' => 'post-single' },
                                      header({ 'class' => 'post-header' },
                                             h1({ 'class' => 'post-title' }, slide.title),
                                             slide.tags.length.positive? ? ul({ 'class' => 'post-tags' },
                                                                              *slide.tags.map do |slug|
                                                                                li({ 'class' => 'tag' },
                                                                                   a({ 'class' => 'tag-inner',
                                                                                       'href' => "/tags/#{slug}/" },
                                                                                     config.tag_label(slug)))
                                                                              end) : nil),
                                      div({ 'class' => 'post-content' },
                                          section({ 'id' => 'changelog' },
                                                  h2({}, a({ 'href' => '#changelog' }, '更新履歴')),
                                                  ol({},
                                                     *slide.revisions.map do |rev|
                                                       ds = Revision.date_to_string(rev.date)
                                                       li({ 'class' => 'revision' },
                                                          elem('time', { 'datetime' => ds }, ds),
                                                          ": #{rev.remark}")
                                                     end)),
                                          elem('canvas',
                                               { 'id' => 'slide', 'data-slide-link' => slide.slide_link }),
                                          div({ 'class' => 'controllers' },
                                              div({ 'class' => 'controllers-buttons' },
                                                  button({ 'id' => 'prev', 'type' => 'button' },
                                                         elem('svg', { 'width' => '20', 'height' => '20',
                                                                       'viewBox' => '0 0 24 24', 'fill' => 'none',
                                                                       'stroke' => 'currentColor',
                                                                       'stroke-width' => '2' },
                                                              elem('path', { 'd' => 'M15 18l-6-6 6-6' }))),
                                                  button({ 'id' => 'next', 'type' => 'button' },
                                                         elem('svg', { 'width' => '20', 'height' => '20',
                                                                       'viewBox' => '0 0 24 24', 'fill' => 'none',
                                                                       'stroke' => 'currentColor',
                                                                       'stroke-width' => '2' },
                                                              elem('path', { 'd' => 'M9 18l6-6-6-6' }))))),
                                          Components::StaticScript.render(
                                            site: 'slides',
                                            file_name: '/slide.js',
                                            type: 'module',
                                            config: config
                                          )))),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
