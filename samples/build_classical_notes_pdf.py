#!/usr/bin/env python3
"""Generate the 5.1 Classical Notes handout PDF (clean, plain teacher-handout style)."""
from fpdf import FPDF

SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

class Handout(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="Letter")
        self.add_font("serif", "", SERIF)
        self.add_font("serif", "B", SERIF_B)
        self.set_margins(19, 19, 19)
        self.set_auto_page_break(True, margin=19)
        self.add_page()
        self.set_text_color(17, 17, 17)

    def mc(self, text, h=6, align="L"):
        """multi_cell that resets the cursor to the left margin after writing."""
        self.multi_cell(0, h, text, align=align,
                        new_x="LMARGIN", new_y="NEXT")

    def write_line(self, style="dotted", h=7):
        self.ln(1)
        y = self.get_y()
        x = self.l_margin
        w = self.w - self.l_margin - self.r_margin
        if style == "dotted":
            self.set_draw_color(136, 136, 136); self.set_dash_pattern(0.6, 1.4)
        else:
            self.set_draw_color(153, 153, 153); self.set_dash_pattern()
        self.line(x, y, x + w, y)
        self.set_dash_pattern(); self.set_draw_color(0, 0, 0)
        self.set_y(y + h)

    def section(self, title, tag=None):
        self.ln(4)
        y = self.get_y()
        self.set_font("serif", "B", 12)
        self.set_xy(self.l_margin, y)
        self.cell(0, 7, title, new_x="END", new_y="LAST")
        if tag:
            self.set_font("serif", "", 9.5)
            self.set_text_color(85, 85, 85)
            self.cell(0, 7, "  \u2014 " + tag)
            self.set_text_color(17, 17, 17)
        self.set_xy(self.l_margin, y + 7)
        self.set_draw_color(153, 153, 153)
        self.line(self.l_margin, y + 7, self.w - self.r_margin, y + 7)
        self.set_draw_color(0, 0, 0)
        self.set_y(y + 10)

pdf = Handout()

# ---- Header ----
pdf.set_font("serif", "B", 16)
pdf.mc("Attributes & Transformations of Quadratic Functions", h=8, align="C")
pdf.set_font("serif", "", 10)
pdf.set_text_color(68, 68, 68)
pdf.mc("Algebra II  \u00b7  Lesson 5.1  \u00b7  Classical Notes", h=6, align="C")
pdf.set_text_color(17, 17, 17)
pdf.ln(3)

# ---- Name / Date / Period ----
pdf.set_font("serif", "", 10)
line_w = pdf.w - pdf.l_margin - pdf.r_margin
y = pdf.get_y()
pdf.set_xy(pdf.l_margin, y)
pdf.cell(14, 6, "Name: ")
x1 = pdf.get_x(); pdf.line(x1, y + 5.2, x1 + 55, y + 5.2)
pdf.set_x(x1 + 60); pdf.cell(11, 6, "Date: ")
x2 = pdf.get_x(); pdf.line(x2, y + 5.2, x2 + 40, y + 5.2)
pdf.set_x(x2 + 45); pdf.cell(14, 6, "Period: ")
x3 = pdf.get_x(); pdf.line(x3, y + 5.2, pdf.w - pdf.r_margin, y + 5.2)
pdf.set_y(y + 6)
y = pdf.get_y()
pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
pdf.ln(3)

# ---- I. Definitions ----
pdf.section("I. Definitions", "copy each one exactly")
defs = [
    ("Quadratic function",
     "A function that can be written f(x) = ax\u00b2 + bx + c, where a \u2260 0."),
    ("Vertex form",
     "f(x) = a(x \u2212 h)\u00b2 + k. The vertex is visible directly: (h, k)."),
    ("Vertex",
     "The highest or lowest point of the parabola."),
    ("Axis of symmetry",
     "The vertical line x = h, across which the parabola mirrors itself."),
]
for term, definition in defs:
    pdf.set_font("serif", "B", 10.5)
    pdf.mc(term)
    pdf.set_font("serif", "", 10.5)
    pdf.mc(definition)
    pdf.write_line(h=8)

# ---- II. Demonstration ----
pdf.section("II. Demonstration", "supply the reason for each step")
pdf.set_font("serif", "B", 10.5)
pdf.mc("Describe the transformations of g(x) = \u22122(x \u2212 3)\u00b2 + 1 "
       "compared to the parent function y = x\u00b2. "
       "State the vertex and the axis of symmetry.")
pdf.ln(1)
steps = [
    "In vertex form a(x \u2212 h)\u00b2 + k:  a = \u22122,  h = 3,  k = 1.",
    "Vertex: (3, 1).   Axis of symmetry: x = 3.",
    "|\u22122| = 2 > 1, so the parabola is stretched vertically by a factor of 2 \u2014 narrower than the parent.",
    "a = \u22122 < 0, so the parabola is reflected across the x-axis \u2014 it opens downward.",
    "h = 3 shifts the graph right 3 units; k = 1 shifts it up 1 unit.",
]
pdf.set_font("serif", "", 10.5)
for i, step in enumerate(steps, 1):
    pdf.mc(f"{i}.  {step}")
    y = pdf.get_y()
    pdf.set_x(pdf.l_margin + 12)
    pdf.cell(15, 6, "Reason: ", new_x="END", new_y="LAST")
    x = pdf.get_x()
    pdf.line(x, y + 5.2, pdf.w - pdf.r_margin, y + 5.2)
    pdf.set_xy(pdf.l_margin, y + 8)

# ---- III. Questions for Discussion ----
pdf.section("III. Questions for Discussion")
questions = [
    "1. Why does (x \u2212 3) shift the graph right when 3 is being subtracted?",
    "2. How does the single value a control both the width and the direction of the parabola?",
    "3. What would change \u2014 and what would stay the same \u2014 if a were \u2212\u00bd instead of \u22122?",
]
pdf.set_font("serif", "", 10.5)
for q in questions:
    pdf.mc(q)
    pdf.write_line(h=9)

# ---- IV. Narration ----
pdf.section("IV. Narration", "explain it as if teaching a friend")
pdf.set_font("serif", "", 10)
pdf.mc("How do you read the vertex and every transformation directly from vertex form, without graphing?")
for _ in range(4):
    pdf.write_line(style="solid", h=8)

# ---- V. Error Log ----
pdf.section("V. Error Log")
pdf.set_font("serif", "B", 10)
pdf.set_fill_color(238, 238, 238)
col_w = line_w / 2
y = pdf.get_y()
pdf.set_draw_color(17, 17, 17)
pdf.set_xy(pdf.l_margin, y)
pdf.cell(col_w, 8, "  My mistake", border=1, fill=True)
pdf.set_xy(pdf.l_margin + col_w, y)
pdf.cell(col_w, 8, "  The correction", border=1, fill=True)
pdf.set_font("serif", "", 10)
pdf.set_xy(pdf.l_margin, y + 8)
pdf.cell(col_w, 20, "", border=1)
pdf.set_xy(pdf.l_margin + col_w, y + 8)
pdf.cell(col_w, 20, "", border=1)
pdf.set_xy(pdf.l_margin, y + 28)
pdf.ln(4)

# ---- Q.E.D. ----
pdf.set_font("serif", "", 11)
pdf.set_text_color(51, 51, 51)
pdf.set_x(pdf.l_margin)
pdf.cell(line_w, 7, "Q.E.D.", align="R")

out = "/home/hatch/workspace/euclid-worksheet/samples/classical-notes-5-1-print.pdf"
pdf.output(out)
print(f"Wrote {out}")
