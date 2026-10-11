#!/usr/bin/env python3
"""Build the Euclid Engine free sample PDF: base worksheet + accommodated version + keys."""
from fpdf import FPDF

FONT_DIR = "/home/hatch/workspace/euclid-worksheet/public/fonts"
OUT = "/home/hatch/workspace/euclid-worksheet/samples/euclid-engine-free-sample.pdf"

class Sample(FPDF):
    def __init__(self):
        super().__init__(format="Letter")
        self.add_font("DVS", "", FONT_DIR + "/DejaVuSerif.ttf")
        self.add_font("DVS", "B", FONT_DIR + "/DejaVuSerif-Bold.ttf")
        self.set_auto_page_break(True, margin=20)

    def header_rule(self):
        self.set_draw_color(0)
        self.set_line_width(0.4)
        self.line(19, 14, 197, 14)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font("DVS", "", 8)
        self.set_text_color(110, 110, 110)
        self.cell(0, 8, "Free sample  \u00b7  Euclid Engine  \u00b7  euclidengine.tech", align="C")

    def title_block(self, title, subtitle):
        self.set_font("DVS", "B", 20)
        self.set_text_color(0)
        self.cell(0, 12, title, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("DVS", "", 11)
        self.set_text_color(80, 80, 80)
        self.cell(0, 8, subtitle, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_draw_color(0)
        self.set_line_width(0.6)
        self.line(19, self.get_y(), 197, self.get_y())
        self.ln(6)

    def id_line(self):
        self.set_font("DVS", "", 11)
        self.set_text_color(0)
        y = self.get_y()
        self.text(20, y + 5, "Name:")
        self.line(38, y + 5, 105, y + 5)
        self.text(112, y + 5, "Date:")
        self.line(128, y + 5, 155, y + 5)
        self.text(160, y + 5, "Period:")
        self.line(180, y + 5, 196, y + 5)
        self.ln(12)

    def section_head(self, text):
        self.set_font("DVS", "B", 13)
        self.set_text_color(0)
        self.cell(0, 9, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text, size=11):
        self.set_font("DVS", "", size)
        self.set_text_color(0)
        self.multi_cell(0, 6.2, text)
        self.ln(1)

    def directions(self, text, size=11):
        self.set_font("DVS", "", size)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 6.2, text)
        self.ln(3)

    def problem(self, num, prompt, workspace_lines=3, size=11.5):
        self.set_font("DVS", "", size)
        self.set_text_color(0)
        x0 = self.get_x()
        self.cell(10, 7, f"{num}.")
        self.multi_cell(0, 7, prompt)
        self.ln(1)
        self.set_draw_color(170, 170, 170)
        self.set_line_width(0.2)
        y = self.get_y()
        for i in range(workspace_lines):
            self.line(30, y + 8 + i * 9, 196, y + 8 + i * 9)
        self.set_y(y + 8 + workspace_lines * 9 + 4)

    def key_entry(self, num, prompt, answer, size=10.5):
        self.set_font("DVS", "B", size)
        self.set_text_color(0)
        self.cell(10, 6.5, f"{num}.")
        self.set_font("DVS", "", size)
        self.multi_cell(0, 6.5, prompt)
        self.set_x(30)
        self.set_font("DVS", "B", size)
        self.set_text_color(30, 90, 30)
        self.multi_cell(0, 6.5, "Answer: " + answer)
        self.set_text_color(0)
        self.ln(3)


pdf = Sample()

# ---------------- COVER ----------------
pdf.add_page()
pdf.ln(18)
pdf.set_font("DVS", "B", 28)
pdf.cell(0, 14, "Euclid Engine", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("DVS", "", 13)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 9, "Free Sample Worksheet", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(4)
pdf.set_draw_color(0); pdf.set_line_width(0.6)
pdf.line(60, pdf.get_y(), 156, pdf.get_y())
pdf.ln(10)
pdf.set_text_color(0)
pdf.body("Topic: Attributes & Transformations of Quadratic Functions  (Algebra II, Lesson 5.1)")
pdf.body("This sample contains two versions of the same worksheet:")
pdf.set_font("DVS", "B", 11)
pdf.cell(0, 7, "Version A \u2014 Standard", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("DVS", "", 11)
pdf.body("The worksheet every student receives: 10 problems, standard print.")
pdf.set_font("DVS", "B", 11)
pdf.cell(0, 7, "Version B \u2014 Accommodated", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("DVS", "", 11)
pdf.body("The same assignment, regenerated for an accommodation group: fewer problems, larger print, simplified directions, and a word bank. Same math, same standards \u2014 different access.")
pdf.ln(2)
pdf.body("Euclid Engine generates both versions from one click: the teacher picks the topic, and every accommodation group gets its own version with a matching answer key. Answer keys for both versions are included at the end of this packet.")
pdf.ln(4)
pdf.set_font("DVS", "B", 11)
pdf.cell(0, 8, "euclidengine.tech", align="C", new_x="LMARGIN", new_y="NEXT")

# ---------------- VERSION A ----------------
pdf.add_page()
pdf.title_block("Transformations of Quadratic Functions", "Algebra II \u00b7 Lesson 5.1 \u00b7 Version A \u2014 Standard")
pdf.id_line()
pdf.directions("Directions: For each function, state the vertex, state the axis of symmetry, and describe the transformations compared to the parent function y = x\u00b2. For the last two problems, write the equation in vertex form.")
problems_a = [
    "f(x) = (x \u2212 2)\u00b2 + 5",
    "f(x) = \u2212(x + 1)\u00b2 \u2212 3",
    "f(x) = 3(x \u2212 4)\u00b2 + 2",
    "f(x) = \u2212\u00bd(x + 5)\u00b2 + 1",
    "f(x) = (x + 3)\u00b2 \u2212 7",
    "f(x) = \u22124(x \u2212 1)\u00b2 + 9",
    "f(x) = \u00bc(x \u2212 6)\u00b2 \u2212 2",
    "f(x) = \u2212(x \u2212 8)\u00b2",
    "Write the equation: vertex (\u22122, 5), opens downward, vertically stretched by a factor of 3.",
    "Write the equation: vertex (4, \u22121), opens upward, vertically compressed by a factor of \u00bd.",
]
for i, p in enumerate(problems_a, 1):
    if i == 9:
        pdf.add_page()
        pdf.set_font("DVS", "B", 13)
        pdf.cell(0, 9, "Part II \u2014 Write the equation", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)
    pdf.problem(i, p, workspace_lines=3)

# ---------------- VERSION B ----------------
pdf.add_page()
pdf.title_block("Transformations of Quadratic Functions", "Algebra II \u00b7 Lesson 5.1 \u00b7 Version B \u2014 Accommodated")
pdf.set_font("DVS", "", 10)
pdf.set_text_color(90, 90, 90)
pdf.multi_cell(0, 6, "Accommodations applied: reduced problem count \u00b7 larger print \u00b7 simplified directions \u00b7 word bank \u00b7 extra workspace")
pdf.ln(2)
pdf.id_line()
pdf.section_head("Word Bank")
pdf.set_font("DVS", "", 12)
pdf.set_text_color(0)
pdf.multi_cell(0, 8, "vertex  \u00b7  axis of symmetry  \u00b7  shift left  \u00b7  shift right  \u00b7  shift up  \u00b7  shift down  \u00b7  stretch (narrower)  \u00b7  compression (wider)  \u00b7  reflection (opens downward)")
pdf.ln(4)
pdf.set_font("DVS", "B", 12)
pdf.cell(0, 8, "Directions (simplified):", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("DVS", "", 12)
pdf.multi_cell(0, 8, "1.  Write the vertex.\n2.  Write the axis of symmetry.\n3.  Circle each transformation in the word bank.")
pdf.ln(4)
problems_b = [
    "f(x) = (x \u2212 2)\u00b2 + 5",
    "f(x) = \u2212(x + 1)\u00b2 \u2212 3",
    "f(x) = 3(x \u2212 4)\u00b2 + 2",
    "f(x) = (x + 3)\u00b2 \u2212 7",
    "f(x) = \u2212\u00bd(x + 5)\u00b2 + 1",
    "Write the equation: vertex (4, \u22121), opens upward, compressed by \u00bd.",
]
for i, p in enumerate(problems_b, 1):
    pdf.problem(i, p, workspace_lines=4, size=13)

# ---------------- ANSWER KEY A ----------------
pdf.add_page()
pdf.title_block("Answer Key \u2014 Version A (Standard)", "For teacher use")
key_a = [
    ("f(x) = (x \u2212 2)\u00b2 + 5",
     "Vertex (2, 5); axis x = 2; shift right 2, shift up 5."),
    ("f(x) = \u2212(x + 1)\u00b2 \u2212 3",
     "Vertex (\u22121, \u22123); axis x = \u22121; reflected over the x-axis (opens downward), shift left 1, shift down 3."),
    ("f(x) = 3(x \u2212 4)\u00b2 + 2",
     "Vertex (4, 2); axis x = 4; vertical stretch by 3 (narrower), shift right 4, shift up 2."),
    ("f(x) = \u2212\u00bd(x + 5)\u00b2 + 1",
     "Vertex (\u22125, 1); axis x = \u22125; reflected over the x-axis, vertical compression by \u00bd (wider), shift left 5, shift up 1."),
    ("f(x) = (x + 3)\u00b2 \u2212 7",
     "Vertex (\u22123, \u22127); axis x = \u22123; shift left 3, shift down 7."),
    ("f(x) = \u22124(x \u2212 1)\u00b2 + 9",
     "Vertex (1, 9); axis x = 1; reflected over the x-axis, vertical stretch by 4 (narrower), shift right 1, shift up 9."),
    ("f(x) = \u00bc(x \u2212 6)\u00b2 \u2212 2",
     "Vertex (6, \u22122); axis x = 6; vertical compression by \u00bc (wider), shift right 6, shift down 2."),
    ("f(x) = \u2212(x \u2212 8)\u00b2",
     "Vertex (8, 0); axis x = 8; reflected over the x-axis (opens downward), shift right 8."),
    ("Vertex (\u22122, 5), opens downward, stretched by 3:",
     "f(x) = \u22123(x + 2)\u00b2 + 5"),
    ("Vertex (4, \u22121), opens upward, compressed by \u00bd:",
     "f(x) = \u00bd(x \u2212 4)\u00b2 \u2212 1"),
]
for i, (p, a) in enumerate(key_a, 1):
    pdf.key_entry(i, p, a)

# ---------------- ANSWER KEY B ----------------
pdf.add_page()
pdf.title_block("Answer Key \u2014 Version B (Accommodated)", "For teacher use \u00b7 numbering matches Version B")
key_b = [
    ("f(x) = (x \u2212 2)\u00b2 + 5",
     "Vertex (2, 5); axis x = 2; shift right, shift up."),
    ("f(x) = \u2212(x + 1)\u00b2 \u2212 3",
     "Vertex (\u22121, \u22123); axis x = \u22121; reflection, shift left, shift down."),
    ("f(x) = 3(x \u2212 4)\u00b2 + 2",
     "Vertex (4, 2); axis x = 4; stretch, shift right, shift up."),
    ("f(x) = (x + 3)\u00b2 \u2212 7",
     "Vertex (\u22123, \u22127); axis x = \u22123; shift left, shift down."),
    ("f(x) = \u2212\u00bd(x + 5)\u00b2 + 1",
     "Vertex (\u22125, 1); axis x = \u22125; reflection, compression, shift left, shift up."),
    ("Vertex (4, \u22121), opens upward, compressed by \u00bd:",
     "f(x) = \u00bd(x \u2212 4)\u00b2 \u2212 1"),
]
for i, (p, a) in enumerate(key_b, 1):
    pdf.key_entry(i, p, a)

pdf.output(OUT)
print("wrote", OUT)
