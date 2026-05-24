from flask import Blueprint, jsonify

from helpers import user_to_json
from models import User

test_bp = Blueprint("test", __name__)


@test_bp.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from the backend!"})


@test_bp.route("/api/users")
def get_users():
    users = User.query.all()
    return jsonify([user_to_json(user) for user in users])
