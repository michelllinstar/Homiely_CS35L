from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import timedelta

from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)

from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@db/homiely'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'super_secret_ultra_key'
app.config["JWT_SECRET_KEY"] = 'super_secret_ultra_key'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

jwt = JWTManager(app)
db = SQLAlchemy(app)
blocklist = set()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))  # renamed from password


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()  # fixed from request.jsonify()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'credentials incorrect. try again.'}), 401

    access_token = create_access_token(identity=str(user.id))    # fixed: use dot notation
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {"id": user.id, "name": user.name, "email": email}  # fixed: dot notation
    })


@app.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token})

@app.route("/api/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    blocklist.add(jti)
    return jsonify({"message": "Logged out"})

@app.route("/api/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    return jsonify({"id": user_id})

@app.route('/api/hello')
def hello():
    return jsonify({'message': 'Hello from the backend!'})

@app.route('/api/users')
def get_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'name': u.name, 'email': u.email} for u in users])


def seed_test_user():
    existing = User.query.filter_by(email="test@example.com").first()
    if not existing:
        test_user = User(
            email="test@example.com",
            password_hash=generate_password_hash("password123"),
            name="Test User"
        )
        db.session.add(test_user)
        db.session.commit()
        print("[SEED] Test user created: test@example.com / password123")
    else:
        print("[SEED] Test user already exists, skipping")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()       # ✅ create tables FIRST
        seed_test_user()      # ✅ then seed
    app.run(debug=True, host='0.0.0.0')