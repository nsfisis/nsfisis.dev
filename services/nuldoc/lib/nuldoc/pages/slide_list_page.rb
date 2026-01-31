module Nuldoc
  module Pages
    class SlideListPage
      extend Dom

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
          children: elem('body', { 'class' => 'list' },
                         Components::SlidesGlobalHeader.render(config: config),
                         elem('main', { 'class' => 'main' },
                              header({ 'class' => 'page-header' }, h1({}, page_title)),
                              *sorted.map do |slide|
                                Components::SlidePageEntry.render(slide: slide, config: config)
                              end),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
