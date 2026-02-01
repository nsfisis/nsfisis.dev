module Nuldoc
  module Pages
    class HomePage
      def initialize(config:)
        @config = config
      end

      def render
        config = @config
        Components::PageLayout.new(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'nsfisis のサイト',
          meta_title: config.sites.default.site_name,
          meta_atom_feed_href: "https://#{config.sites.default.fqdn}/atom.xml",
          site: 'default',
          config: config,
          children: DOM::HTMLBuilder.new.build do
            body class: 'single' do
              render(Components::DefaultGlobalHeader, config: config)
              main class: 'main' do
                article class: 'post-single' do
                  article class: 'post-entry' do
                    a href: "https://#{config.sites.about.fqdn}/" do
                      header(class: 'entry-header') { h2 { text 'About' } }
                    end
                  end
                  article class: 'post-entry' do
                    a href: "https://#{config.sites.blog.fqdn}/posts/" do
                      header(class: 'entry-header') { h2 { text 'Blog' } }
                    end
                  end
                  article class: 'post-entry' do
                    a href: "https://#{config.sites.slides.fqdn}/slides/" do
                      header(class: 'entry-header') { h2 { text 'Slides' } }
                    end
                  end
                  article class: 'post-entry' do
                    a href: "https://repos.#{config.sites.default.fqdn}/" do
                      header(class: 'entry-header') { h2 { text 'Repositories' } }
                    end
                  end
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
