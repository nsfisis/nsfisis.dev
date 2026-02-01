module Nuldoc
  module Components
    class Pagination < DOM::HTMLBuilder
      def initialize(current_page:, total_pages:, base_path:)
        super()
        @current_page = current_page
        @total_pages = total_pages
        @base_path = base_path
      end

      def build
        if @total_pages <= 1
          div
        else
          pages = generate_page_numbers(@current_page, @total_pages)

          nav(class: 'pagination') do
            div(class: 'pagination-prev') do
              a(href: page_url_at(@base_path, @current_page - 1)) { text '前へ' } if @current_page > 1
            end
            pages.each do |page|
              if page == '...'
                div(class: 'pagination-elipsis') { text "\u2026" }
              elsif page == @current_page
                div(class: 'pagination-page pagination-page-current') do
                  span { text page.to_s }
                end
              else
                div(class: 'pagination-page') do
                  a(href: page_url_at(@base_path, page)) { text page.to_s }
                end
              end
            end
            div(class: 'pagination-next') do
              a(href: page_url_at(@base_path, @current_page + 1)) { text '次へ' } if @current_page < @total_pages
            end
          end
        end
      end

      private

      def generate_page_numbers(current_page, total_pages)
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

      def page_url_at(base_path, page)
        page == 1 ? base_path : "#{base_path}#{page}/"
      end
    end
  end
end
