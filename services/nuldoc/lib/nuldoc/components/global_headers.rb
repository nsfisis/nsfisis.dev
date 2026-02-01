module Nuldoc
  module Components
    class DefaultGlobalHeader < DOM::HTMLBuilder
      def initialize(config:)
        super()
        @config = config
      end

      def build
        header(class: 'header') do
          div(class: 'site-logo') do
            a(href: "https://#{@config.sites.default.fqdn}/") { text 'nsfisis.dev' }
          end
        end
      end
    end

    class AboutGlobalHeader < DOM::HTMLBuilder
      def initialize(config:)
        super()
        @config = config
      end

      def build
        header(class: 'header') do
          div(class: 'site-logo') do
            a(href: "https://#{@config.sites.default.fqdn}/") { text 'nsfisis.dev' }
          end
        end
      end
    end

    class BlogGlobalHeader < DOM::HTMLBuilder
      def initialize(config:)
        super()
        @config = config
      end

      def build
        header(class: 'header') do
          div(class: 'site-logo') do
            a(href: "https://#{@config.sites.default.fqdn}/") { text 'nsfisis.dev' }
          end
          div(class: 'site-name') { text @config.sites.blog.site_name }
          nav(class: 'nav') do
            ul do
              li { a(href: "https://#{@config.sites.about.fqdn}/") { text 'About' } }
              li { a(href: '/posts/') { text 'Posts' } }
              li { a(href: '/tags/') { text 'Tags' } }
            end
          end
        end
      end
    end

    class SlidesGlobalHeader < DOM::HTMLBuilder
      def initialize(config:)
        super()
        @config = config
      end

      def build
        header(class: 'header') do
          div(class: 'site-logo') do
            a(href: "https://#{@config.sites.default.fqdn}/") { text 'nsfisis.dev' }
          end
          nav(class: 'nav') do
            ul do
              li { a(href: "https://#{@config.sites.about.fqdn}/") { text 'About' } }
              li { a(href: '/slides/') { text 'Slides' } }
              li { a(href: '/tags/') { text 'Tags' } }
            end
          end
        end
      end
    end
  end
end
