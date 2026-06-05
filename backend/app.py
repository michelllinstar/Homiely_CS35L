from datetime import timedelta
import os

from flask import Flask
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.expense_routes import expenses_bp
from routes.group_routes import groups_bp
from routes.test_routes import test_bp
from routes.signup_routes import signup_bp
from routes.chore_routes import chores_bp
from extensions import db, jwt
from seed import seed_demo_group, seed_test_user
from availability import bp as availability_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "postgresql://user:password@db/homily"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "super_secret_ultra_key"
    app.config["JWT_SECRET_KEY"] = "super_secret_ultra_key"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(groups_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(test_bp)
    app.register_blueprint(signup_bp)
    app.register_blueprint(availability_bp)
    app.register_blueprint(chores_bp)

    return app


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_test_user()
        seed_demo_group()

    app.run(debug=True, host="0.0.0.0")