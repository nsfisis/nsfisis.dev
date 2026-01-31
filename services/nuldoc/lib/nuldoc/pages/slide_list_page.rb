module Nuldoc
  module Pages
    class SlideListPage
      extend DOM::HTML

      def self.render(slides:, config:)
        page_title = 'スライド一覧'
        sorted = slides.sort_by { |s| GeneratorUtils.published_date(s) }.reverse

        Components::PageLayout.render(
          meta_copyright_year: config.site.copyright_year,
          meta_description: '登壇したイベントで使用したスライドの一覧',
          meta_title: "#{page_title}｜#{config.sites.slides.site_name}",
          meta_atom_feed_href: "https://#{config.sites.slides.fqdn}/slides/atom.xml",
          site: 'slides',
          config: config,
          children: body(class: 'list') do
            Components::SlidesGlobalHeader.render(config: config)
            main(class: 'main') do
              header(class: 'page-header') { h1 { text page_title } }
              sorted.each do |slide|
                Components::SlidePageEntry.render(slide: slide, config: config)
              end
            end
            Components::GlobalFooter.render(config: config)
          end
        )
      end
    end
  end
end
