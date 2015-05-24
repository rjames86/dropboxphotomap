import json
import os
import os.path
import urlparse

import io

from flask import abort, Flask, redirect, render_template, request, session, url_for, jsonify, send_file, Blueprint

main = Blueprint('main', __name__)


@main.route('/')
def index():
    if not session.get('access_token'):
        return redirect(url_for('dropbox_photos.login'))
    # client = DropboxClient(session.get('access_token'))
    # return render_template('index.html', account_info=account_info)
    return render_template('index.html')

@main.route('/test')
def test():
    return 'test'
