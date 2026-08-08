module Nuldoc
  module Pages
    class SlidePage
      def initialize(slide:, config:)
        @slide = slide
        @config = config
      end

      def render
        slide = @slide
        config = @config
        Components::PageLayout.new(
          meta_copyright_year: GeneratorUtils.published_date(slide).year,
          meta_description: "「#{slide.title}」(#{slide.event} で登壇)",
          meta_keywords: slide.tags.map { |slug| config.tag_label(slug) },
          meta_title: "#{slide.title} (#{slide.event})｜#{config.sites.slides.site_name}",
          site: 'slides',
          config: config,
          children: DOM::HTMLBuilder.new.build do
            body class: 'single' do
              render Components::StaticStylesheet, site: 'slides', file_name: '/slides.css', config: config
              render Components::SlidesGlobalHeader, config: config
              main class: 'main' do
                article class: 'post-single' do
                  header class: 'post-header' do
                    h1(class: 'post-title') { text slide.title }
                    if slide.tags.length.positive?
                      ul class: 'post-tags' do
                        slide.tags.each do |slug|
                          li class: 'tag' do
                            a(class: 'tag-inner', href: "/tags/#{slug}/") { text config.tag_label(slug) }
                          end
                        end
                      end
                    end
                  end
                  div class: 'post-content' do
                    section id: 'changelog' do
                      h2 { a(href: '#changelog') { text '更新履歴' } }
                      ol do
                        slide.revisions.each do |rev|
                          ds = Revision.date_to_string(rev.date)
                          li class: 'revision' do
                            time(datetime: ds) { text ds }
                            text ": #{rev.remark}"
                          end
                        end
                      end
                    end
                    div class: 'slide-container', id: 'slide-container',
                        'data-slide-link': slide.slide_link do
                      div class: 'slide-stage', id: 'slide-stage' do
                        canvas id: 'slide'
                        div class: 'textLayer', id: 'text-layer'
                        div class: 'annotationLayer', id: 'annotation-layer'
                      end
                      div class: 'slide-status', id: 'slide-status',
                          role: 'status', 'aria-live': 'polite', hidden: 'hidden'
                    end
                    noscript do
                      style { raw '.slide-container,.controllers-buttons{display:none}' }
                      p class: 'slide-noscript' do
                        a(href: slide.slide_link) { text 'PDF をダウンロード' }
                      end
                    end
                    div class: 'controllers' do
                      div class: 'controllers-buttons' do
                        button id: 'prev', type: 'button',
                               'aria-label': '前のページ (←/h)', title: '前のページ (←/h)' do
                          elem 'svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
                                      stroke: 'currentColor', 'stroke-width': '2' do
                            elem 'path', d: 'M15 18l-6-6 6-6'
                          end
                        end
                        div class: 'page-indicator' do
                          input id: 'page-input', class: 'page-input', type: 'number',
                                min: '1', step: '1', value: '1', inputmode: 'numeric',
                                'aria-label': 'ページ番号'
                          span(class: 'page-separator') { text '/' }
                          span(class: 'page-count', id: 'page-count') { text '–' }
                        end
                        button id: 'next', type: 'button',
                               'aria-label': '次のページ (→/l)', title: '次のページ (→/l)' do
                          elem 'svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
                                      stroke: 'currentColor', 'stroke-width': '2' do
                            elem 'path', d: 'M9 18l6-6-6-6'
                          end
                        end
                      end
                      a(class: 'slide-download', href: slide.slide_link, download: '') do
                        text 'PDF をダウンロード'
                      end
                    end
                    render Components::StaticScript,
                           site: 'slides',
                           file_name: '/slide.js',
                           type: 'module',
                           config: config
                  end
                end
              end
              render Components::GlobalFooter, config: config
            end
          end
        ).build
      end
    end
  end
end
