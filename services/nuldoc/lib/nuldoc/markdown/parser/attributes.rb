module Nuldoc
  module Parser
    class Attributes
      def self.parse_trailing_attributes(text)
        match = text.match(/\s*\{([^}]+)\}\s*$/)
        return [text, nil, {}] unless match

        attr_string = match[1]
        text_before = text[0...match.begin(0)]

        id = nil
        attributes = {}

        id_match = attr_string.match(/#([\w-]+)/)
        id = id_match[1] if id_match

        attr_string.scan(/([\w-]+)="([^"]*)"/) do |key, value|
          attributes[key] = value
        end

        [text_before, id, attributes]
      end
    end
  end
end
