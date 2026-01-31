module Nuldoc
  Revision = Data.define(:number, :date, :remark, :is_internal) do
    def self.string_to_date(s)
      match = s.match(/\A(\d{4})-(\d{2})-(\d{2})\z/)
      raise "Invalid date string: #{s}" if match.nil?

      Date.new(match[1].to_i, match[2].to_i, match[3].to_i)
    end

    def self.date_to_string(date)
      format('%<year>04d-%<month>02d-%<day>02d', year: date.year, month: date.month, day: date.day)
    end

    def self.date_to_rfc3339_string(date)
      format('%<year>04d-%<month>02d-%<day>02dT00:00:00+09:00', year: date.year, month: date.month, day: date.day)
    end
  end
end
