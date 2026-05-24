from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import blocklist, db
from helpers import user_to_json
from models import User

signup_bp = Blueprint("signup", __name__)


@signup_bp.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")
    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()

    name = f"{first_name} {last_name}".strip()

    user = User.query.filter_by(email=email).first()

    if user:
        return jsonify({"message": "User already exists"}), 409

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        name=name
    )

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_to_json(user)
    })

