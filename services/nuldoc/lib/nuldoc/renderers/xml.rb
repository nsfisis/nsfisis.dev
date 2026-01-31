module Nuldoc
  class XMLRenderer
    BLOCK_ELEMENTS = %w[feed entry author].freeze

    def render(root)
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n#{node_to_xml(root, indent_level: 0)}"
    end

    private

    def inline_node?(node)
      return true if %i[text raw].include?(node.kind)

      !BLOCK_ELEMENTS.include?(node.name)
    end

    def block_node?(node)
      !inline_node?(node)
    end

    def node_to_xml(node, indent_level:)
      case node.kind
      when :text
        text_node_to_xml(node)
      when :raw
        node.html
      when :element
        element_node_to_xml(node, indent_level: indent_level)
      end
    end

    def text_node_to_xml(node)
      encode_special_characters(node.content).gsub(/\n */, ' ')
    end

    def encode_special_characters(s)
      s.gsub(/&(?!(?:\w+|#\d+|#x[\da-fA-F]+);)/, '&amp;')
       .gsub('<', '&lt;')
       .gsub('>', '&gt;')
       .gsub("'", '&apos;')
       .gsub('"', '&quot;')
    end

    def element_node_to_xml(element, indent_level:)
      s = +''

      s << indent(indent_level)
      s << "<#{element.name}"

      attributes = get_element_attributes(element)
      unless attributes.empty?
        s << ' '
        attributes.each_with_index do |(name, value), i|
          s << "#{name}=\"#{encode_special_characters(value)}\""
          s << ' ' if i != attributes.length - 1
        end
      end
      s << '>'
      s << "\n" if block_node?(element)

      child_indent = indent_level + 1
      element.children.each do |child|
        s << node_to_xml(child, indent_level: child_indent)
      end

      s << indent(indent_level) if block_node?(element)
      s << "</#{element.name}>"
      s << "\n"

      s
    end

    def indent(level)
      '  ' * level
    end

    def get_element_attributes(element)
      element.attributes
             .reject { |k, _| k.start_with?('__') }
             .sort { |a, b| compare_attributes(element.name, a, b) }
    end

    def compare_attributes(element_name, a, b)
      ak, = a
      bk, = b

      if element_name == 'link'
        return 1 if ak == 'href' && bk == 'rel'
        return -1 if ak == 'rel' && bk == 'href'
        return 1 if ak == 'href' && bk == 'type'
        return -1 if ak == 'type' && bk == 'href'
      end

      ak <=> bk
    end
  end
end
