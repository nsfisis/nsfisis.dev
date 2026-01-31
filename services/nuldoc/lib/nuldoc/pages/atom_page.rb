module Nuldoc
  module Pages
    class AtomPage
      extend DOM::AtomXML

      def self.render(feed:)
        feed(xmlns: 'http://www.w3.org/2005/Atom') do
          id { text feed.id }
          title { text feed.title }
          link(rel: 'alternate', href: feed.link_to_alternate)
          link(rel: 'self', href: feed.link_to_self)
          author { name { text feed.author } }
          updated { text feed.updated }
          feed.entries.each do |entry|
            entry do
              id { text entry.id }
              link(rel: 'alternate', href: entry.link_to_alternate)
              title { text entry.title }
              summary { text entry.summary }
              published { text entry.published }
              updated { text entry.updated }
            end
          end
        end
      end
    end
  end
end
