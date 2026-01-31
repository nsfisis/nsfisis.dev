module Nuldoc
  module Components
    class DefaultGlobalHeader
      extend Dom

      def self.render(config:)
        header({ 'class' => 'header' },
               div({ 'class' => 'site-logo' },
                   a({ 'href' => "https://#{config.sites.default.fqdn}/" }, 'nsfisis.dev')))
      end
    end

    class AboutGlobalHeader
      extend Dom

      def self.render(config:)
        header({ 'class' => 'header' },
               div({ 'class' => 'site-logo' },
                   a({ 'href' => "https://#{config.sites.default.fqdn}/" }, 'nsfisis.dev')))
      end
    end

    class BlogGlobalHeader
      extend Dom

      def self.render(config:)
        header({ 'class' => 'header' },
               div({ 'class' => 'site-logo' },
                   a({ 'href' => "https://#{config.sites.default.fqdn}/" }, 'nsfisis.dev')),
               div({ 'class' => 'site-name' }, config.sites.blog.site_name),
               nav({ 'class' => 'nav' },
                   ul({},
                      li({}, a({ 'href' => "https://#{config.sites.about.fqdn}/" }, 'About')),
                      li({}, a({ 'href' => '/posts/' }, 'Posts')),
                      li({}, a({ 'href' => '/tags/' }, 'Tags')))))
      end
    end

    class SlidesGlobalHeader
      extend Dom

      def self.render(config:)
        header({ 'class' => 'header' },
               div({ 'class' => 'site-logo' },
                   a({ 'href' => "https://#{config.sites.default.fqdn}/" }, 'nsfisis.dev')),
               nav({ 'class' => 'nav' },
                   ul({},
                      li({}, a({ 'href' => "https://#{config.sites.about.fqdn}/" }, 'About')),
                      li({}, a({ 'href' => '/slides/' }, 'Slides')),
                      li({}, a({ 'href' => '/tags/' }, 'Tags')))))
      end
    end
  end
end
