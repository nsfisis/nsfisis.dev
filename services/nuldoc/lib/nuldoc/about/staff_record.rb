module Nuldoc
  StaffRecord = Data.define(:date, :event, :role) do
    def sort_date
      date.is_a?(Range) ? date.begin : date
    end
  end
end
