module Nuldoc
  module Parser
    class LineScanner
      attr_reader :lines, :pos

      def initialize(text)
        @lines = text.lines(chomp: true)
        @pos = 0
      end

      def eof?
        @pos >= @lines.length
      end

      def peek
        return nil if eof?

        @lines[@pos]
      end

      def advance
        line = peek
        @pos += 1
        line
      end

      def match(pattern)
        return false if eof?

        peek.match(pattern)
      end

      def skip_blank_lines
        advance while !eof? && peek.strip.empty?
      end
    end
  end
end
