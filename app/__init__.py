from flask import Flask
from config import config


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    from controllers.main import main as main_blueprint
    from controllers.dropbox_photos import dropbox_photos as dropbox_photos_blueprint

    app.register_blueprint(main_blueprint)
    app.register_blueprint(dropbox_photos_blueprint,  url_prefix='/dropbox_photos')

    return app
