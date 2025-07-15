with open("helpers/file.txt", "w") as f:
    for i in range(25):
        y_axis = (200 * i) + 100
        f.write(f'<line class="hours" x1="50" y1={y_axis} x2="1475" y2={y_axis}></line>\n')