module Nuldoc
  StaffRecord = Data.define(:date, :event, :role, :url) do
    def sort_date
      date.is_a?(Range) ? date.begin : date
    end

    def linkable?
      url
    end
  end
end
