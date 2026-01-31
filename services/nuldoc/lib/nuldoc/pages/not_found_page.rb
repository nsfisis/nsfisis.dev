module Nuldoc
  module Pages
    class NotFoundPage
      extend Dom

      def self.render(site:, config:)
        global_header = case site
                        when 'about' then Components::AboutGlobalHeader
                        when 'blog' then Components::BlogGlobalHeader
                        when 'slides' then Components::SlidesGlobalHeader
                        else Components::DefaultGlobalHeader
                        end

        site_entry = config.site_entry(site)

        Components::PageLayout.render(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'リクエストされたページが見つかりません',
          meta_title: "Page Not Found｜#{site_entry.site_name}",
          site: site,
          config: config,
          children: elem('body', { 'class' => 'single' },
                         global_header.render(config: config),
                         elem('main', { 'class' => 'main' },
                              article({}, div({ 'class' => 'not-found' }, '404'))),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
