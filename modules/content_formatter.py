def format_output(platform, text):
    platform = platform.lower()

    if platform == "email":
        if not text.lower().startswith("subject"):
            text = "Subject: Important Update\n\n" + text

    elif platform == "instagram":
        if "#" not in text:
            text += "\n\n#awareness #trending"

    elif platform == "twitter":
        if len(text) > 280:
            # Cut to 277 chars and find the last space so we don't chop a word in half
            text = text[:277].rsplit(' ', 1)[0] + "..."

    return text