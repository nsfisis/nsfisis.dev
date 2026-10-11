module Nuldoc
  module Components
    class GlobalHeader < DOM::HTMLBuilder
      def initialize(site:, config:)
        super()
        @site = site
        @config = config
      end

      def build
        header class: 'header' do
          div class: 'site-logo' do
            a(href: "https://#{@config.sites.default.fqdn}/") { text 'nsfisis.dev' }
          end
          global_nav
        end
      end

      private

      def global_nav
        sites = @config.sites
        items = [
          ['about', 'About', "https://#{sites.about.fqdn}/"],
          ['blog', 'Blog', "https://#{sites.blog.fqdn}/posts/"],
          ['slides', 'Slides', "https://#{sites.slides.fqdn}/slides/"],
          ['repos', 'Repos', "https://repos.#{sites.default.fqdn}/"]
        ]

        nav class: 'nav' do
          ul do
            items.each do |site, label, href|
              li do
                if site == @site
                  a(href: href, 'aria-current': 'true') { text label }
                else
                  a(href: href) { text label }
                end
              end
            end
          end
        end
      end
    end
  end
end
