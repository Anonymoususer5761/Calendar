with open("helpers/file.txt", "w") as f:
    for i in range(25):
        x_axis = (100 * i) + 100
        f.write(f'<line class="hours" x1="{x_axis}" y1="20" x2="{x_axis}" y2="510"/>\n')