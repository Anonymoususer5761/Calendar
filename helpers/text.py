for i in range(1, 25):
    with open("helpers/text.txt", "a") as txt_file:
        txt_file.write(f'<text x="0" y="{i}09" font-size="18" font="sans-serif" fill="black">{i:02}:00</text>\n')