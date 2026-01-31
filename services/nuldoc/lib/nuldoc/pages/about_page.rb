module Nuldoc
  module Pages
    class AboutPage
      extend Dom

      def self.render(slides:, config:)
        sorted_slides = slides.sort_by { |s| GeneratorUtils.published_date(s) }.reverse

        Components::PageLayout.render(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'このサイトの著者について',
          meta_title: "About｜#{config.sites.about.site_name}",
          site: 'about',
          config: config,
          children: elem('body', { 'class' => 'single' },
                         Components::AboutGlobalHeader.render(config: config),
                         elem('main', { 'class' => 'main' },
                              article({ 'class' => 'post-single' },
                                      header({ 'class' => 'post-header' },
                                             h1({ 'class' => 'post-title' }, 'nsfisis'),
                                             div({ 'class' => 'my-icon' },
                                                 div({ 'id' => 'myIcon' },
                                                     img({ 'src' => '/favicon.svg' })),
                                                 Components::StaticScript.render(
                                                   site: 'about',
                                                   file_name: '/my-icon.js',
                                                   defer: 'true',
                                                   config: config
                                                 ))),
                                      div({ 'class' => 'post-content' },
                                          section({},
                                                  h2({}, '読み方'),
                                                  p({}, '読み方は決めていません。音にする必要があるときは本名である「いまむら」をお使いください。')),
                                          section({},
                                                  h2({}, 'アカウント'),
                                                  ul({},
                                                     li({}, a({ 'href' => 'https://twitter.com/nsfisis',
                                                                'target' => '_blank',
                                                                'rel' => 'noreferrer' },
                                                              'Twitter (現 𝕏): @nsfisis')),
                                                     li({}, a({ 'href' => 'https://github.com/nsfisis',
                                                                'target' => '_blank',
                                                                'rel' => 'noreferrer' },
                                                              'GitHub: @nsfisis')))),
                                          section({},
                                                  h2({}, '仕事'),
                                                  ul({},
                                                     li({}, '2021-01～現在: ',
                                                        a({ 'href' => 'https://www.dgcircus.com/',
                                                            'target' => '_blank',
                                                            'rel' => 'noreferrer' },
                                                          'デジタルサーカス株式会社')))),
                                          section({},
                                                  h2({}, '登壇'),
                                                  ul({},
                                                     *sorted_slides.map do |slide|
                                                       slide_url = "https://#{config.sites.slides.fqdn}#{slide.href}"
                                                       slide_date = Revision.date_to_string(
                                                         GeneratorUtils.published_date(slide)
                                                       )
                                                       li({},
                                                          a({ 'href' => slide_url },
                                                            "#{slide_date}: #{slide.event} (#{slide.talk_type})"))
                                                     end))))),
                         Components::GlobalFooter.render(config: config))
        )
      end
    end
  end
end
