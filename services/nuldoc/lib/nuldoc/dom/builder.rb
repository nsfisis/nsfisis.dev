module Nuldoc
  module DOM
    class Builder
      def initialize
        @stack = []
      end

      def build(&)
        instance_eval(&)
      end

      def text(content)
        try_append(Text.new(content: content))
      end

      def raw(content)
        try_append(RawNode.new(content: content))
      end

      def render(component, **)
        try_append(component.new(**).build)
      end

      def child(*nodes)
        return if @stack.empty?

        nodes.each do |node|
          case node
          when nil, false
            next
          when String
            try_append(Text.new(content: node))
          when Array
            node.each { |n| child(n) }
          else
            try_append(node)
          end
        end
      end

      def elem(name, **attrs, &)
        try_append(
          Element.new(
            name: name,
            attributes: attrs.transform_keys(&:to_s),
            children: collect_children(&)
          )
        )
      end

      private

      def collect_children
        return [] unless block_given?

        @stack.push([])
        yield
        @stack.pop
      end

      def try_append(node)
        @stack.last.push(node) unless @stack.empty?
        node
      end
    end
  end
end
