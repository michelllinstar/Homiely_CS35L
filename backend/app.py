from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import timedelta
import secrets
import random, string

from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:password@db/homiely"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "super_secret_ultra_key"
app.config["JWT_SECRET_KEY"] = "super_secret_ultra_key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

jwt = JWTManager(app)
db = SQLAlchemy(app)
blocklist = set()


# -------------------------
# Models
# -------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    paid_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    splits = db.relationship('ExpenseSplit', backref='expense', lazy=True)

class ExpenseSplit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
    owed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    is_paid = db.Column(db.Boolean, default=False)

# ── Auth routes ──────────────────────────────────────

class RoommateGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    join_code = db.Column(db.String(20), unique=True, nullable=False)


class RoommateGroupMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    group_id = db.Column(
        db.Integer,
        db.ForeignKey("roommate_group.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    group = db.relationship("RoommateGroup", backref="members")
    user = db.relationship("User", backref="group_memberships")


# -------------------------
# Helpers
# -------------------------

def generate_join_code():
    return secrets.token_hex(3).upper()


def get_user_group(user_id):
    return RoommateGroupMember.query.filter_by(user_id=user_id).first()


def user_to_json(user):
    membership = get_user_group(user.id)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "has_roommate_group": membership is not None,
        "roommate_group_id": membership.group_id if membership else None,
    }


def group_to_json(group):
    return {
        "id": group.id,
        "name": group.name,
        "join_code": group.join_code,
        "members": [
            {
                "id": member.user.id,
                "name": member.user.name,
                "email": member.user.email,
            }
            for member in group.members
        ],
    }


# -------------------------
# Auth Routes
# -------------------------

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "credentials incorrect. try again."}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_to_json(user)
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
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user_to_json(user))


# -------------------------
# Roommate Group Routes
# -------------------------

@app.route("/api/groups/create", methods=["POST"])
@jwt_required()
def create_group():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    existing_membership = get_user_group(user.id)

    if existing_membership:
        return jsonify({"message": "User already has a roommate group"}), 400

    data = request.get_json()
    group_name = data.get("name", "My Roommate Group").strip()

    join_code = generate_join_code()

    while RoommateGroup.query.filter_by(join_code=join_code).first():
        join_code = generate_join_code()

    group = RoommateGroup(
        name=group_name,
        join_code=join_code
    )

    db.session.add(group)
    db.session.flush()

    membership = RoommateGroupMember(
        group_id=group.id,
        user_id=user.id
    )

    db.session.add(membership)
    db.session.commit()

    return jsonify({
        "message": "Group created",
        "group": group_to_json(group),
        "user": user_to_json(user)
    })


@app.route("/api/groups/join", methods=["POST"])
@jwt_required()
def join_group():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    existing_membership = get_user_group(user.id)

    if existing_membership:
        return jsonify({"message": "User already has a roommate group"}), 400

    data = request.get_json()
    join_code = data.get("join_code", "").upper().strip()

    group = RoommateGroup.query.filter_by(join_code=join_code).first()

    if not group:
        return jsonify({"message": "Invalid join code"}), 404

    membership = RoommateGroupMember(
        group_id=group.id,
        user_id=user.id
    )

    db.session.add(membership)
    db.session.commit()

    return jsonify({
        "message": "Joined group",
        "group": group_to_json(group),
        "user": user_to_json(user)
    })


@app.route("/api/groups/me", methods=["GET"])
@jwt_required()
def my_group():
    user_id = int(get_jwt_identity())
    membership = get_user_group(user_id)

    if not membership:
        return jsonify({
            "has_roommate_group": False,
            "group": None
        })

    return jsonify({
        "has_roommate_group": True,
        "group": group_to_json(membership.group)
    })


# -------------------------
# Test Routes
# -------------------------

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from the backend!"})


@app.route("/api/users")
def get_users():
    users = User.query.all()
    return jsonify([user_to_json(user) for user in users])

# ── Group routes ─────────────────────────────────────

# -------------------------
# Seed Data
# -------------------------

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
def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@app.route('/api/groups/create', methods=['POST'])
@jwt_required()
def create_group():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    group = Group(name=data.get("name"), invite_code=generate_invite_code())
    db.session.add(group)
    db.session.flush()

    user.group_id = group.id
    db.session.commit()

    return jsonify({"group_id": group.id, "name": group.name, "invite_code": group.invite_code})

@app.route('/api/groups/join', methods=['POST'])
@jwt_required()
def join_group():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    group = Group.query.filter_by(invite_code=data.get("invite_code")).first()
    if not group:
        return jsonify({"error": "Invalid invite code"}), 404

    user.group_id = group.id
    db.session.commit()

    return jsonify({"group_id": group.id, "name": group.name, "invite_code": group.invite_code})

@app.route('/api/groups/<int:group_id>/members', methods=['GET'])
@jwt_required()
def get_group_members(group_id):
    members = User.query.filter_by(group_id=group_id).all()
    return jsonify([{"id": u.id, "name": u.name, "email": u.email, "group_id": u.group_id} for u in members])

# ── Expense routes ───────────────────────────────────

@app.route('/api/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    split_between = data.get("split_between", [])
    share = round(data["amount"] / len(split_between), 2)

    expense = Expense(
        description=data["description"],
        amount=data["amount"],
        paid_by=user_id,
        group_id=data["group_id"]
    )
    db.session.add(expense)
    db.session.flush()

    for uid in split_between:
        db.session.add(ExpenseSplit(
            expense_id=expense.id,
            owed_by=uid,
            amount=share
        ))

    db.session.commit()
    return jsonify({"message": "Expense added", "expense_id": expense.id})

@app.route('/api/expenses/<int:group_id>', methods=['GET'])
@jwt_required()
def get_expenses(group_id):
    expenses = Expense.query.filter_by(group_id=group_id).all()
    return jsonify([{
        "id": e.id,
        "description": e.description,
        "amount": e.amount,
        "paid_by": e.paid_by,
        "group_id": e.group_id,
        "split_between": [s.owed_by for s in e.splits],
        "splits": [{"owed_by": s.owed_by, "amount": s.amount, "is_paid": s.is_paid} for s in e.splits]
    } for e in expenses])

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({"error": "Expense not found"}), 404
    ExpenseSplit.query.filter_by(expense_id=expense_id).delete()
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Deleted"})

# ── Seed ─────────────────────────────────────────────

def seed_demo():
    # skip if already seeded
    if User.query.filter_by(email="test@example.com").first():
        print("[SEED] Demo data already exists, skipping")
        return

    # create group
    group = Group(name="UCLA Apartment", invite_code="DEMO1234")
    db.session.add(group)
    db.session.flush()

    # create 3 demo users all in the same group
    users = [
        User(name="Alice", email="alice@example.com",
             password_hash=generate_password_hash("password123"), group_id=group.id),
        User(name="Bob", email="bob@example.com",
             password_hash=generate_password_hash("password123"), group_id=group.id),
        User(name="Test User", email="test@example.com",
             password_hash=generate_password_hash("password123"), group_id=group.id),
    ]
    for u in users:
        db.session.add(u)
    db.session.flush()

    alice, bob, test_user = users

    # create demo expenses
    expenses = [
        {"desc": "Groceries", "amount": 90, "paid_by": alice.id, "split": [alice.id, bob.id, test_user.id]},
        {"desc": "Internet bill", "amount": 60, "paid_by": bob.id, "split": [alice.id, bob.id, test_user.id]},
        {"desc": "Cleaning supplies", "amount": 30, "paid_by": test_user.id, "split": [bob.id, test_user.id]},
    ]

    for e in expenses:
        expense = Expense(
            description=e["desc"],
            amount=e["amount"],
            paid_by=e["paid_by"],
            group_id=group.id
        )
        db.session.add(expense)
        db.session.flush()

        share = round(e["amount"] / len(e["split"]), 2)
        for uid in e["split"]:
            db.session.add(ExpenseSplit(expense_id=expense.id, owed_by=uid, amount=share))

    db.session.commit()
    print("[SEED] Demo group 'UCLA Apartment' created")
    print("[SEED] Users: alice@example.com, bob@example.com, test@example.com (all password: password123)")
    print(f"[SEED] Invite code: DEMO1234")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_test_user()

    app.run(debug=True, host="0.0.0.0")
