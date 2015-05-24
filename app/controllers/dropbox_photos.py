import json
import os
import os.path
import urlparse

import io

from dropbox.client import DropboxClient, DropboxOAuth2Flow

from flask import abort, Flask, redirect, render_template, request, session, url_for, jsonify, send_file, Blueprint, current_app

dropbox_photos = Blueprint('dropbox_photos', __name__)


def get_url(route):
    '''Generate a proper URL, forcing HTTPS if not running locally'''
    host = urlparse.urlparse(request.url).hostname
    url = url_for(
        route,
        _external=True,
        _scheme='http' if host in ('127.0.0.1', 'localhost') else 'https'
    )

    return url


def get_flow():
    APP_KEY = current_app.config['DROPBOX_APP_KEY']
    APP_SECRET = current_app.config['DROPBOX_APP_SECRET']
    return DropboxOAuth2Flow(
        APP_KEY,
        APP_SECRET,
        get_url('.oauth_callback'),
        session,
        'dropbox-csrf-token')


@dropbox_photos.route('/oauth_callback')
def oauth_callback():
    '''Callback function for when the user returns from OAuth.'''

    access_token, uid, extras = get_flow().finish(request.args)
    session['uid'] = uid
    session['access_token'] = access_token
    return redirect(url_for('main.index'))


@dropbox_photos.route('/get_thumbnail')
def thumbnail():
    filename = request.args.get('filename')
    client = DropboxClient(session.get('access_token'))
    thumbnail = client.thumbnail(filename, size='m', format='PNG')
    return send_file(io.BytesIO(thumbnail.read()),
                     attachment_filename='thumbnail.png',
                     mimetype='image/png')


@dropbox_photos.route('/get_photos')
def get_photos():
    dirname = request.args.get('dir') or '/'
    client = DropboxClient(session.get('access_token'))
    file_list = client.metadata(dirname, include_media_info=True)
    photos = [f for f in file_list['contents'] if f.get('photo_info')]
    return jsonify(dict(contents=photos))


@dropbox_photos.route('/listdir')
def listdir():
    dirname = request.args.get('dir') or '/'
    client = DropboxClient(session.get('access_token'))
    file_list = client.metadata(dirname)
    dirs = [f for f in file_list['contents'] if f['is_dir']]
    return jsonify(dict(contents=dirs))


@dropbox_photos.route('/picture_a_day')
def pictureaday():
    return render_template('pictureaday.html')


@dropbox_photos.route('/login')
def login():
    return redirect(get_flow().start())
