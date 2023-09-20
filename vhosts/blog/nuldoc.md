# Posts

## Meta Information

```
struct Revision {
  date: string
  remark: string
}

struct PostMeta {
  title: string
  description: string
  tags: string[]
  revisions: Revision[]
}
```

## Elements

table
tbody
td
tfoot
th
thead
tr
col
colgroup
caption

blockquote
cite
q

figure
img

section
h
p

ul
ol
li

a
email

time
kbd

sub
sup

dl
dt
dd

summary
details

del
ins

br
hr

ruby
rt

note

mark
s
strong

code
filename
codeblock

footnote
footnoteref


# Slides

## Meta Information

```
struct Revision {
  date: string
  remark: string
}

struct Slide {
  title: string
  event: string
  talkType: string
  link: string
  tags: string[]
  revisions: Revision[]
}
```
