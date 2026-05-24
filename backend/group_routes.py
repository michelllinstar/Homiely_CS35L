from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from helpers import generate_join_code, get_user_group, group_to_json, user_to_json
from models import RoommateGroup, RoommateGroupMember, User

groups_bp = Blueprint("groups", __name__)


@groups_bp.route("/api/groups/create", methods=["POST"])
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


@groups_bp.route("/api/groups/join", methods=["POST"])
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


@groups_bp.route("/api/groups/me", methods=["GET"])
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


@groups_bp.route("/api/groups/<int:group_id>/members", methods=["GET"])
@jwt_required()
def get_group_members(group_id):
    members = RoommateGroupMember.query.filter_by(group_id=group_id).all()
    return jsonify([
        {
            "id": member.user.id,
            "name": member.user.name,
            "email": member.user.email,
            "group_id": member.group_id
        }
        for member in members
    ])
