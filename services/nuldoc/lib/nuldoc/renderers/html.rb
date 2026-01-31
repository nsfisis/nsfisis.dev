module Nuldoc
  class HtmlRenderer
    DTD = {
      'a' => { type: :inline },
      'article' => { type: :block },
      'blockquote' => { type: :block },
      'body' => { type: :block },
      'br' => { type: :block, self_closing: true },
      'button' => { type: :block },
      'canvas' => { type: :block },
      'caption' => { type: :block },
      'code' => { type: :inline },
      'del' => { type: :block },
      'div' => { type: :block },
      'em' => { type: :inline },
      'footer' => { type: :block },
      'h1' => { type: :inline },
      'h2' => { type: :inline },
      'h3' => { type: :inline },
      'h4' => { type: :inline },
      'h5' => { type: :inline },
      'h6' => { type: :inline },
      'head' => { type: :block },
      'header' => { type: :block },
      'hr' => { type: :block, self_closing: true },
      'html' => { type: :block },
      'i' => { type: :inline },
      'li' => { type: :block },
      'link' => { type: :block, self_closing: true },
      'img' => { type: :inline, self_closing: true },
      'ins' => { type: :inline },
      'main' => { type: :block },
      'mark' => { type: :inline },
      'meta' => { type: :block, self_closing: true },
      'nav' => { type: :block },
      'noscript' => { type: :block },
      'ol' => { type: :block },
      'p' => { type: :block },
      'pre' => { type: :block },
      'script' => { type: :block },
      'section' => { type: :block },
      'span' => { type: :inline },
      'strong' => { type: :inline },
      'sub' => { type: :inline },
      'sup' => { type: :inline },
      'table' => { type: :block },
      'tbody' => { type: :block },
      'td' => { type: :block },
      'tfoot' => { type: :block },
      'th' => { type: :block },
      'thead' => { type: :block },
      'time' => { type: :inline },
      'title' => { type: :inline },
      'tr' => { type: :block },
      'ul' => { type: :block },
      'svg' => { type: :block },
      'path' => { type: :block }
    }.freeze

    def render(root)
      "<!DOCTYPE html>\n#{node_to_html(root, indent_level: 0, is_in_pre: false)}"
    end

    private

    def get_dtd(name)
      dtd = DTD[name]
      raise "[html.write] Unknown element name: #{name}" if dtd.nil?

      dtd
    end

    def inline_node?(node)
      return true if %i[text raw].include?(node.kind)

      return get_dtd(node.name)[:type] == :inline if node.name != 'a'

      node.children.all? { |c| inline_node?(c) }
    end

    def block_node?(node)
      !inline_node?(node)
    end

    def node_to_html(node, indent_level:, is_in_pre:)
      case node.kind
      when :text
        text_node_to_html(node, _indent_level: indent_level, is_in_pre: is_in_pre)
      when :raw
        node.html
      when :element
        element_node_to_html(node, indent_level: indent_level, is_in_pre: is_in_pre)
      end
    end

    def text_node_to_html(node, _indent_level:, is_in_pre:)
      s = encode_special_characters(node.content)
      return s if is_in_pre

      s.gsub(/\n */) do |_match|
        offset = $LAST_MATCH_INFO.begin(0)
        last_char = offset.positive? ? s[offset - 1] : nil
        if ['。', '、'].include?(last_char)
          ''
        else
          ' '
        end
      end
    end

    def encode_special_characters(s)
      s.gsub(/&(?!(?:\w+|#\d+|#x[\da-fA-F]+);)/, '&amp;')
       .gsub('<', '&lt;')
       .gsub('>', '&gt;')
       .gsub("'", '&apos;')
       .gsub('"', '&quot;')
    end

    def element_node_to_html(element, indent_level:, is_in_pre:)
      dtd = get_dtd(element.name)
      s = +''

      s << indent(indent_level) if block_node?(element)
      s << "<#{element.name}"

      attributes = get_element_attributes(element)
      unless attributes.empty?
        s << ' '
        attributes.each_with_index do |(name, value), i|
          if name == 'defer' && value == 'true'
            s << 'defer'
          else
            attr_name = name == 'className' ? 'class' : name
            s << "#{attr_name}=\"#{encode_special_characters(value)}\""
          end
          s << ' ' if i != attributes.length - 1
        end
      end
      s << '>'
      s << "\n" if block_node?(element) && element.name != 'pre'

      child_indent = indent_level + 1
      prev_child = nil
      child_is_in_pre = is_in_pre || element.name == 'pre'

      element.children.each do |child|
        if block_node?(element) && !child_is_in_pre
          if inline_node?(child)
            s << indent(child_indent) if needs_indent?(prev_child)
          elsif needs_line_break?(prev_child)
            s << "\n"
          end
        end
        s << node_to_html(child, indent_level: child_indent, is_in_pre: child_is_in_pre)
        prev_child = child
      end

      unless dtd[:self_closing]
        if (element.name != 'pre') && block_node?(element)
          s << "\n" if needs_line_break?(prev_child)
          s << indent(indent_level)
        end
        s << "</#{element.name}>"
        s << "\n" if block_node?(element)
      end

      s
    end

    def indent(level)
      '  ' * level
    end

    def get_element_attributes(element)
      element.attributes
             .reject { |k, _| k.start_with?('__') }
             .compact
             .sort { |a, b| compare_attributes(element.name, a, b) }
    end

    def compare_attributes(element_name, a, b)
      ak, = a
      bk, = b

      if element_name == 'meta'
        return 1 if ak == 'content' && bk == 'name'
        return -1 if ak == 'name' && bk == 'content'
        return 1 if ak == 'content' && bk == 'property'
        return -1 if ak == 'property' && bk == 'content'
      end

      if element_name == 'link'
        return 1 if ak == 'href' && bk == 'rel'
        return -1 if ak == 'rel' && bk == 'href'
        return 1 if ak == 'href' && bk == 'type'
        return -1 if ak == 'type' && bk == 'href'
      end

      ak <=> bk
    end

    def needs_indent?(prev_child)
      prev_child.nil? || block_node?(prev_child)
    end

    def needs_line_break?(prev_child)
      !needs_indent?(prev_child)
    end
  end
end
