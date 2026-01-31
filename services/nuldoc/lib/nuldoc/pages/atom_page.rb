module Nuldoc
  module Pages
    class AtomPage
      extend Dom

      def self.render(feed:)
        elem('feed', { 'xmlns' => 'http://www.w3.org/2005/Atom' },
             elem('id', {}, feed.id),
             elem('title', {}, feed.title),
             link({ 'rel' => 'alternate', 'href' => feed.link_to_alternate }),
             link({ 'rel' => 'self', 'href' => feed.link_to_self }),
             elem('author', {}, elem('name', {}, feed.author)),
             elem('updated', {}, feed.updated),
             *feed.entries.map do |entry|
               elem('entry', {},
                    elem('id', {}, entry.id),
                    link({ 'rel' => 'alternate', 'href' => entry.link_to_alternate }),
                    elem('title', {}, entry.title),
                    elem('summary', {}, entry.summary),
                    elem('published', {}, entry.published),
                    elem('updated', {}, entry.updated))
             end)
      end
    end
  end
end
