color_choices = (("#ff0000", "Red"), ("#0000ff", "Blue"), ("#00ff00", "Green"), ("#ffff00", "Yellow"), ("#808080", "Grey"))

def pad_digit(digit: int | str, pad_length: int) -> str:
    digit = str(digit)
    padded_digit = f"{"0" * (pad_length - len(digit))}{digit}"
    return padded_digit


def update_dictionary(dictionary: dict, **kwargs) -> dict:
    dictionary.update(kwargs)
    return dictionary