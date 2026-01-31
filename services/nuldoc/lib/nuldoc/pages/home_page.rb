module Nuldoc
  module Pages
    class HomePage
      extend Dom

      def self.render(config:)
        Components::PageLayout.render(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'nsfisis のサイト',
          meta_title: config.sites.default.site_name,
          meta_atom_feed_href: "https://#{config.sites.default.fqdn}/atom.xml",
          site: 'default',
          config: config,
          children: elem('body', { 'class' => 'single' },
                         Components::DefaultGlobalHeader.render(config: config),
                         elem('main', { 'class' => 'main' },
                              article({ 'class' => 'post-single' },
                                      article({ 'class' => 'post-entry' },
                                              a({ 'href' => "https://#{config.sites.about.fqdn}/" },
                                                header({ 'class' => 'entry-header' }, h2({}, 'About')))),
                                      article({ 'class' => 'post-entry' },
                                              a({ 'href' => "https://#{config.sites.blog.fqdn}/posts/" },
                                                header({ 'class' => 'entry-header' }, h2({}, 'Blog')))),
                                      article({ 'class' => 'post-entry' },
                                              a({ 'href' => "https://#{config.sites.slides.fqdn}/slides/" },
                                                header({ 'class' => 'entry-header' }, h2({}, 'Slides')))),
                                      article({ 'class' => 'post-entry' },
                                              a({ 'href' => "https://repos.#{config.sites.default.fqdn}/" },
                                                header({ 'class' => 'entry-header' },
                                                       h2({}, 'Repositories')))))),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
