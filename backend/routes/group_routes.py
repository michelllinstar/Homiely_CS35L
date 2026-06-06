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


@groups_bp.route("/api/groups/me", methods=["DELETE"])
@jwt_required()
def leave_my_group():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    membership = get_user_group(user_id)

    if not membership:
        return jsonify({"message": "User is not in a roommate group"}), 400

    db.session.delete(membership)
    db.session.commit()

    return jsonify({
        "message": "Left roommate group",
        "user": user_to_json(user)
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

#  [GenAI Prompt]: "Can you help me brainstorm some ways I could implement some Flask endpoints for our project's group management features? Currently, we're thinking about POST /api/groups/create and POST /api/groups/join, POST /api/groups/me and DELETE /api/groups/me."
# [GenAI Use] LLM Response Start
# 11:25 PM
# Sure! Here's a pseudocode outline for each:

# POST /api/groups/create

# require valid JWT

# get current user from token
# get group name from request body

# if user already has a group_id:
#     return 400 "user is already in a group"

# generate random 8-character invite code
# make sure invite code is unique (regenerate if collision)

# create new Group(name, invite_code)
# set current user's group_id to new group's id

# save to database
# return { group_id, name, invite_code }
# POST /api/groups/join

# require valid JWT

# get current user from token
# get invite_code from request body

# if user already has a group_id:
#     return 400 "user is already in a group"

# look up group by invite_code
# if group not found:
#     return 404 "invalid invite code"

# if group is full (optional max size check):
#     return 400 "group is full"

# set current user's group_id to found group's id

# save to database
# return { group_id, name, invite_code }
# GET /api/groups/me

# require valid JWT

# get current user from token

# if user has no group_id:
#     return 404 "user is not in a group"

# look up group by user's group_id
# get all members of that group

# return {
#     group_id,
#     name,
#     invite_code,
#     members: [{ id, name, email }, ...]
# }
# DELETE /api/groups/me

# require valid JWT

# get current user from token

# if user has no group_id:
#     return 400 "user is not in a group"

# look up group by user's group_id
# get all members of that group

# if user is the only member:
#     delete all expenses and splits for this group
#     delete the group itself
# else:
#     just set current user's group_id to null
#     (group persists for remaining members)

# save to database
# return { message: "left group successfully" }
# A few design decisions worth thinking through:

# The trickiest one is DELETE — you have two different behaviors depending on whether the user is the last member or not. You might also want to think about whether the concept of a "group owner" matters to you. For example, if the owner leaves, do you want to transfer ownership to another member, or does any member leaving just silently remove them?

# Also worth noting that GET /api/groups/me overlaps with your existing GET /api/groups/<group_id>/members endpoint — you could either consolidate them into one or keep them separate depending on what the frontend needs

# [GenAI Use] LLM Response End
# [GenAI Use] Reflection: Again, because we had created the signup and login routes prior to this, we had a good idea of how to implement these endpoints. However, the LLM's response was still very helpful in confirming our assumptions and giving us a clear outline of what we needed to do. We also appreciated the design decisions it pointed out, as those were things we hadn't fully thought through yet. 