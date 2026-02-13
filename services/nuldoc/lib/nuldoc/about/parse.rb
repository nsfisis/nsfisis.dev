require 'toml-rb'

module Nuldoc
  class StaffParser
    def initialize(file_path)
      @file_path = file_path
    end

    def parse
      data = TomlRB.load_file(@file_path)
      (data['staff'] || []).map do |entry|
        StaffRecord.new(
          date: parse_date(entry['date']),
          event: entry['event'],
          role: entry['role']
        )
      end
    end

    private

    def parse_date(value)
      if value.is_a?(Hash)
        from = Revision.string_to_date(value['from'])
        to = Revision.string_to_date(value['to'])
        from..to
      else
        Revision.string_to_date(value)
      end
    end
  end
end
