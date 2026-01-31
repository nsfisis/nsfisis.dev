module Nuldoc
  class ComponentUtils
    def self.calculate_file_hash(file_path)
      content = File.binread(file_path)
      Digest::MD5.hexdigest(content)
    end
  end
end
