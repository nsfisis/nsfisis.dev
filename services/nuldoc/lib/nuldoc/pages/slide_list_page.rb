module Nuldoc
  module Pages
    class SlideListPage
      def initialize(slides:, config:)
        @slides = slides
        @config = config
      end

      def render
        config = @config
        page_title = 'スライド一覧'
        sorted = @slides.sort_by { |s| GeneratorUtils.published_date(s) }.reverse

        Components::PageLayout.new(
          meta_copyright_year: config.site.copyright_year,
          meta_description: '登壇したイベントで使用したスライドの一覧',
          meta_title: "#{page_title}｜#{config.sites.slides.site_name}",
          meta_atom_feed_href: "https://#{config.sites.slides.fqdn}/slides/atom.xml",
          site: 'slides',
          config: config,
          children: DOM::HTMLBuilder.new.build do
            body class: 'list' do
              render(Components::SlidesGlobalHeader, config: config)
              main class: 'main' do
                header(class: 'page-header') { h1 { text page_title } }
                sorted.each do |slide|
                  render(Components::SlidePageEntry, slide: slide, config: config)
                end
              end
              render(Components::GlobalFooter, config: config)
            end
          end
        ).build
      end
    end
  end
end
