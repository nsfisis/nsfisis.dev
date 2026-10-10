module Nuldoc
  module Pages
    class NotFoundPage
      def initialize(site:, config:)
        @site = site
        @config = config
      end

      def render
        site = @site
        config = @config
        site_entry = config.site_entry(site)

        Components::PageLayout.new(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'リクエストされたページが見つかりません',
          meta_title: "Page Not Found｜#{site_entry.site_name}",
          site: site,
          config: config,
          children: DOM::HTMLBuilder.new.build do
            body class: 'single' do
              render Components::GlobalHeader, site: site, config: config
              main class: 'main' do
                article { div(class: 'not-found') { text '404' } }
              end
              render Components::GlobalFooter, config: config
            end
          end
        ).build
      end
    end
  end
end
