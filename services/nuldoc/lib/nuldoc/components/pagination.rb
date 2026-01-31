module Nuldoc
  module Components
    class Pagination
      extend Dom

      def self.render(current_page:, total_pages:, base_path:)
        return div({}) if total_pages <= 1

        pages = generate_page_numbers(current_page, total_pages)

        nav({ 'class' => 'pagination' },
            div({ 'class' => 'pagination-prev' },
                current_page > 1 ? a({ 'href' => page_url_at(base_path, current_page - 1) }, '前へ') : nil),
            *pages.map do |page|
              if page == '...'
                div({ 'class' => 'pagination-elipsis' }, "\u2026")
              elsif page == current_page
                div({ 'class' => 'pagination-page pagination-page-current' },
                    span({}, page.to_s))
              else
                div({ 'class' => 'pagination-page' },
                    a({ 'href' => page_url_at(base_path, page) }, page.to_s))
              end
            end,
            div({ 'class' => 'pagination-next' },
                current_page < total_pages ? a({ 'href' => page_url_at(base_path, current_page + 1) }, '次へ') : nil))
      end

      def self.generate_page_numbers(current_page, total_pages)
        pages = Set.new
        pages.add(1)
        pages.add([1, current_page - 1].max)
        pages.add(current_page)
        pages.add([total_pages, current_page + 1].min)
        pages.add(total_pages)

        sorted = pages.sort

        result = []
        sorted.each_with_index do |page, i|
          if i.positive?
            gap = page - sorted[i - 1]
            if gap == 2
              result.push(sorted[i - 1] + 1)
            elsif gap > 2
              result.push('...')
            end
          end
          result.push(page)
        end

        result
      end

      def self.page_url_at(base_path, page)
        page == 1 ? base_path : "#{base_path}#{page}/"
      end

      private_class_method :generate_page_numbers, :page_url_at
    end
  end
end
