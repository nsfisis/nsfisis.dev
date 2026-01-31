module Nuldoc
  module Parser
    class InlineParser
      extend Dom

      class << self
        INLINE_HTML_TAGS = %w[del mark sub sup ins br].freeze
        SELF_CLOSING_TAGS = %w[br].freeze

        def parse(text)
          parse_inline(text, 0, text.length)
        end

        private

        def parse_inline(text, start, stop)
          nodes = []
          pos = start

          while pos < stop
            # Try each inline pattern
            matched = try_escape(text, pos, stop, nodes) ||
                      try_code_span(text, pos, stop, nodes) ||
                      try_autolink(text, pos, stop, nodes) ||
                      try_inline_html(text, pos, stop, nodes) ||
                      try_image(text, pos, stop, nodes) ||
                      try_link(text, pos, stop, nodes) ||
                      try_footnote_ref(text, pos, stop, nodes) ||
                      try_bold(text, pos, stop, nodes) ||
                      try_italic(text, pos, stop, nodes) ||
                      try_strikethrough(text, pos, stop, nodes) ||
                      try_typographic(text, pos, stop, nodes)

            if matched
              pos = matched
            else
              # Plain character
              char_end = pos + 1
              # Collect consecutive plain characters
              while char_end < stop
                break if special_char?(text[char_end])

                char_end += 1
              end
              nodes << text(text[pos...char_end])
              pos = char_end
            end
          end

          merge_text_nodes(nodes)
        end

        def special_char?(ch)
          case ch
          when '\\', '`', '<', '!', '[', '*', '~', '.', '-', "'", '"'
            true
          else
            false
          end
        end

        def try_escape(text, pos, _stop, nodes)
          return nil unless text[pos] == '\\'
          return nil if pos + 1 >= text.length

          next_char = text[pos + 1]
          return unless '\\`*_{}[]()#+-.!~|>:'.include?(next_char)

          nodes << text(next_char)
          pos + 2
        end

        def try_autolink(text, pos, stop, nodes)
          return nil unless text[pos] == '<'

          # Match <URL> where URL starts with http:// or https://
          close = text.index('>', pos + 1)
          return nil unless close && close < stop

          url = text[(pos + 1)...close]
          return nil unless url.match?(%r{^https?://\S+$})

          nodes << a({ 'href' => url, 'class' => 'url' }, text(url))
          close + 1
        end

        def try_code_span(text, pos, stop, nodes)
          return nil unless text[pos] == '`'

          # Count opening backticks
          tick_count = 0
          i = pos
          while i < stop && text[i] == '`'
            tick_count += 1
            i += 1
          end

          # Find matching closing backticks
          close_pos = text.index('`' * tick_count, i)
          return nil unless close_pos && close_pos < stop

          content = text[i...close_pos]
          # Strip one leading and one trailing space if both present
          content = content[1...-1] if content.length >= 2 && content[0] == ' ' && content[-1] == ' '

          nodes << elem('code', {}, text(content))
          close_pos + tick_count
        end

        def try_inline_html(text, pos, stop, nodes)
          return nil unless text[pos] == '<'

          # Self-closing tags
          SELF_CLOSING_TAGS.each do |tag|
            pattern = "<#{tag}>"
            len = pattern.length
            if pos + len <= stop && text[pos, len].downcase == pattern
              nodes << elem(tag)
              return pos + len
            end
            pattern_sc = "<#{tag} />"
            len_sc = pattern_sc.length
            if pos + len_sc <= stop && text[pos, len_sc].downcase == pattern_sc
              nodes << elem(tag)
              return pos + len_sc
            end
            pattern_sc2 = "<#{tag}/>"
            len_sc2 = pattern_sc2.length
            if pos + len_sc2 <= stop && text[pos, len_sc2].downcase == pattern_sc2
              nodes << elem(tag)
              return pos + len_sc2
            end
          end

          # Opening tags with content
          (INLINE_HTML_TAGS - SELF_CLOSING_TAGS).each do |tag|
            open_tag = "<#{tag}>"
            close_tag = "</#{tag}>"
            next unless pos + open_tag.length <= stop && text[pos, open_tag.length].downcase == open_tag

            close_pos = text.index(close_tag, pos + open_tag.length)
            next unless close_pos && close_pos + close_tag.length <= stop

            inner = text[(pos + open_tag.length)...close_pos]
            children = parse_inline(inner, 0, inner.length)
            nodes << elem(tag, {}, *children)
            return close_pos + close_tag.length
          end

          nil
        end

        def try_image(text, pos, stop, nodes)
          return nil unless text[pos] == '!' && pos + 1 < stop && text[pos + 1] == '['

          # Find ]
          bracket_close = find_matching_bracket(text, pos + 1, stop)
          return nil unless bracket_close

          alt = text[(pos + 2)...bracket_close]

          # Expect (
          return nil unless bracket_close + 1 < stop && text[bracket_close + 1] == '('

          paren_close = find_matching_paren(text, bracket_close + 1, stop)
          return nil unless paren_close

          inner = text[(bracket_close + 2)...paren_close].strip
          url, title = parse_url_title(inner)

          attributes = {}
          attributes['src'] = url if url
          attributes['alt'] = alt unless alt.empty?
          attributes['title'] = title if title

          nodes << img(attributes)
          paren_close + 1
        end

        def try_link(text, pos, stop, nodes)
          return nil unless text[pos] == '['

          bracket_close = find_matching_bracket(text, pos, stop)
          return nil unless bracket_close

          link_text = text[(pos + 1)...bracket_close]

          # Expect (
          return nil unless bracket_close + 1 < stop && text[bracket_close + 1] == '('

          paren_close = find_matching_paren(text, bracket_close + 1, stop)
          return nil unless paren_close

          inner = text[(bracket_close + 2)...paren_close].strip
          url, title = parse_url_title(inner)

          attributes = {}
          attributes['href'] = url if url
          attributes['title'] = title if title

          children = parse_inline(link_text, 0, link_text.length)

          # Check if autolink
          is_autolink = children.length == 1 &&
                        children[0].kind == :text &&
                        children[0].content == url
          attributes['class'] = 'url' if is_autolink

          nodes << a(attributes, *children)
          paren_close + 1
        end

        def try_footnote_ref(text, pos, stop, nodes)
          return nil unless text[pos] == '[' && pos + 1 < stop && text[pos + 1] == '^'

          close = text.index(']', pos + 2)
          return nil unless close && close < stop

          # Make sure there's no nested [ or ( between
          inner = text[(pos + 2)...close]
          return nil if inner.include?('[') || inner.include?(']')
          return nil if inner.empty?

          nodes << elem('footnoteref', { 'reference' => inner })
          close + 1
        end

        def try_bold(text, pos, stop, nodes)
          return nil unless text[pos] == '*' && pos + 1 < stop && text[pos + 1] == '*'

          close = text.index('**', pos + 2)
          return nil unless close && close + 2 <= stop

          inner = text[(pos + 2)...close]
          children = parse_inline(inner, 0, inner.length)
          nodes << elem('strong', {}, *children)
          close + 2
        end

        def try_italic(text, pos, stop, nodes)
          return nil unless text[pos] == '*'
          return nil if pos + 1 < stop && text[pos + 1] == '*'

          # Find closing * that is not **
          i = pos + 1
          while i < stop
            if text[i] == '*'
              # Make sure it's not **
              if i + 1 < stop && text[i + 1] == '*'
                i += 2
              else
                inner = text[(pos + 1)...i]
                return nil if inner.empty?

                children = parse_inline(inner, 0, inner.length)
                nodes << elem('em', {}, *children)
                return i + 1
              end
            else
              i += 1
            end
          end
          nil
        end

        def try_strikethrough(text, pos, stop, nodes)
          return nil unless text[pos] == '~' && pos + 1 < stop && text[pos + 1] == '~'

          close = text.index('~~', pos + 2)
          return nil unless close && close + 2 <= stop

          inner = text[(pos + 2)...close]
          children = parse_inline(inner, 0, inner.length)
          nodes << elem('del', {}, *children)
          close + 2
        end

        def try_typographic(text, pos, stop, nodes)
          # Ellipsis
          if text[pos] == '.' && pos + 2 < stop && text[pos + 1] == '.' && text[pos + 2] == '.'
            nodes << text("\u2026")
            return pos + 3
          end

          # Em dash (must check before en dash)
          if text[pos] == '-' && pos + 2 < stop && text[pos + 1] == '-' && text[pos + 2] == '-'
            nodes << text("\u2014")
            return pos + 3
          end

          # En dash
          # Make sure it's not ---
          if text[pos] == '-' && pos + 1 < stop && text[pos + 1] == '-' && (pos + 2 >= stop || text[pos + 2] != '-')
            nodes << text("\u2013")
            return pos + 2
          end

          # Smart quotes
          try_smart_quotes(text, pos, stop, nodes)
        end

        def try_smart_quotes(text, pos, _stop, nodes)
          ch = text[pos]
          return nil unless ["'", '"'].include?(ch)

          prev_char = pos.positive? ? text[pos - 1] : nil
          is_opening = prev_char.nil? || prev_char == ' ' || prev_char == "\n" || prev_char == '(' || prev_char == '['

          nodes << if ch == "'"
                     text(is_opening ? "\u2018" : "\u2019")
                   else
                     text(is_opening ? "\u201C" : "\u201D")
                   end
          pos + 1
        end

        def find_matching_bracket(text, pos, stop)
          return nil unless text[pos] == '['

          depth = 0
          i = pos
          while i < stop
            case text[i]
            when '\\'
              i += 2
              next
            when '['
              depth += 1
            when ']'
              depth -= 1
              return i if depth.zero?
            end
            i += 1
          end
          nil
        end

        def find_matching_paren(text, pos, stop)
          return nil unless text[pos] == '('

          depth = 0
          i = pos
          while i < stop
            case text[i]
            when '\\'
              i += 2
              next
            when '('
              depth += 1
            when ')'
              depth -= 1
              return i if depth.zero?
            end
            i += 1
          end
          nil
        end

        def parse_url_title(inner)
          # URL might be followed by "title"
          match = inner.match(/^(\S+)\s+"([^"]*)"$/)
          if match
            [match[1], match[2]]
          else
            [inner, nil]
          end
        end

        def merge_text_nodes(nodes)
          result = []
          nodes.each do |node|
            if node.kind == :text && !result.empty? && result.last.kind == :text
              result[-1] = text(result.last.content + node.content)
            else
              result << node
            end
          end
          result
        end
      end
    end
  end
end
