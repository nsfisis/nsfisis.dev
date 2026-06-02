local buffer = ""

function filter_open()
   buffer = ""
end

function filter_write(s)
   buffer = buffer .. s
end

function filter_close()
   html("<table summary='blob content' class='blob'>\n")
   html("<tr><td class='lines'><pre><code>")
   html_txt(buffer)
   html("</code></pre></td></tr></table>\n")
   return 0
end
