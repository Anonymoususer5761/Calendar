from flask import redirect, url_for

def verify_request_source(request_header, redirect_to):
    if request_header != "JS-AJAX":
        return redirect(url_for(redirect_to))