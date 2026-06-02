module Nuldoc
  module Pages
    class AboutPage
      def initialize(slides:, staff_records:, config:)
        @slides = slides
        @staff_records = staff_records
        @config = config
      end

      def render
        config = @config
        sorted_slides = @slides.sort_by { |s| GeneratorUtils.published_date(s) }.reverse
        sorted_staff = @staff_records.sort_by(&:sort_date).reverse

        Components::PageLayout.new(
          meta_copyright_year: config.site.copyright_year,
          meta_description: 'このサイトの著者について',
          meta_title: "About｜#{config.sites.about.site_name}",
          site: 'about',
          config: config,
          children: DOM::HTMLBuilder.new.build do
            body class: 'single' do
              render Components::AboutGlobalHeader, config: config
              main class: 'main' do
                article class: 'post-single' do
                  header class: 'post-header' do
                    h1(class: 'post-title') { text 'nsfisis' }
                    div class: 'my-icon' do
                      div(id: 'myIcon') { img src: '/favicon.svg' }
                      render Components::StaticScript,
                             site: 'about',
                             file_name: '/my-icon.js',
                             defer: 'true',
                             config: config
                    end
                  end
                  div class: 'post-content' do
                    section do
                      h2 { text '読み方' }
                      p { text '読み方は決めていません。音にする必要があるときは本名である「いまむら」をお使いください。' }
                    end
                    section do
                      h2 { text 'アカウント' }
                      ul do
                        li do
                          a href: 'https://twitter.com/nsfisis', target: '_blank', rel: 'noreferrer' do
                            text 'Twitter (現 𝕏): @nsfisis'
                          end
                        end
                        li do
                          a href: 'https://github.com/nsfisis', target: '_blank', rel: 'noreferrer' do
                            text 'GitHub: @nsfisis'
                          end
                        end
                      end
                    end
                    section do
                      h2 { text '仕事' }
                      ul do
                        li do
                          text '2021-01～現在: '
                          a href: 'https://www.dgcircus.com/', target: '_blank', rel: 'noreferrer' do
                            text 'デジタルサーカス株式会社'
                          end
                        end
                      end
                    end
                    section do
                      h2 { text '登壇' }
                      ul do
                        sorted_slides.each do |slide|
                          slide_url = "https://#{config.sites.slides.fqdn}#{slide.href}"
                          slide_date = Revision.date_to_string(GeneratorUtils.published_date(slide))
                          li do
                            a href: slide_url do
                              text "#{slide_date}: #{slide.event} (#{slide.talk_type})"
                            end
                          end
                        end
                      end
                    end
                    section do
                      h2 { text 'カンファレンススタッフ' }
                      ul do
                        sorted_staff.each do |record|
                          if record.date.is_a?(Range)
                            from_str = Revision.date_to_string(record.date.begin)
                            to_str = Revision.date_to_string(record.date.end)
                            label = "#{from_str}〜#{to_str}: #{record.event} (#{record.role})"
                          else
                            date_str = Revision.date_to_string(record.date)
                            label = "#{date_str}: #{record.event} (#{record.role})"
                          end
                          li do
                            if record.linkable?
                              a href: record.url, target: '_blank', rel: 'noreferrer' do
                                text label
                              end
                            else
                              text label
                            end
                          end
                        end
                      end
                    end
                  end
                end
              end
              render Components::GlobalFooter, config: config
            end
          end
        ).build
      end
    end
  end
end
