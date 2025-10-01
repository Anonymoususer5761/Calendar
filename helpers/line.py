with open("helpers/file.txt", "w") as f:
    for i in range(25):
        y_axis = (100 * i) + 200
        f.write(f'<line class="hours" x1="75" y1={y_axis} x2="1475" y2={y_axis}></line>\n')
        f.write(f'<text x="20" y="{i + 2}09" font-size="18" font="sans-serif" fill="black">{i:02}:00</text>\n')