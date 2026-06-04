from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from datetime import datetime

from extensions import db
from models import Chore, RoommateGroupMember

chores_bp = Blueprint("chores", __name__)

def is_group_member(group_id, user_id):
    return RoommateGroupMember.query.filter_by(
        group_id=group_id, user_id=user_id
    ).first() is not None

@chores_bp.route("/groups/<int:group_id>/chores", methods=["GET"])
@jwt_required()
def get_chores(group_id):
    user_id = get_jwt_identity()
    if not is_group_member(group_id, user_id):
        return jsonify({"error": "Not a member of this group"}), 403    # Forbidden; logged in but not allowed to do this action
    
    week_start = request.args.get("week_start")
    search = request.args.get("q", "").strip()

    query = Chore.query.filter_by(group_id=group_id)

    if week_start:
        query = query.filter_by(week_start_date=week_start)
    if search:
        query = query.filter(Chore.description.ilike(f"%{search}%"))

    return jsonify([c.to_dict() for c in query.all()])

@chores_bp.route("/groups/<int:group_id>/chores", methods=["POST"])
@jwt_required()
def create_chore(group_id):
    user_id = get_jwt_identity()
    if not is_group_member(group_id, user_id):
        return jsonify({"error": "Not a member of this group"}), 403    # Forbidden; logged in but not allowed to do this action

    data = request.get_json()
    chore = Chore(
        group_id=group_id,
        assigned_to=data.get("assigned_to"),
        description=data["description"],
        day_of_week=data["day_of_week"],
        time_of_day=data.get("time_of_day", "Due anytime"),
        week_start_date=data["week_start_date"]
    )
    db.session.add(chore)
    db.session.commit()
    return jsonify(chore.to_dict()), 201    # Created; a new resource was made (used after POST)


@chores_bp.route("/chores/<int:chore_id>", methods=["PATCH"])
@jwt_required()
def update_chore(chore_id):
    user_id = get_jwt_identity()
    chore = Chore.query.get_or_404(chore_id)
    if not is_group_member(chore.group_id, user_id):
        return jsonify({"error": "Not a member of this group"}), 403    # Forbidden; logged in but not allowed to do thsi action

    data = request.get_json()

    if "is_completed" in data:
        chore.is_completed = data["is_completed"]
        chore.completed_by = user_id if data["is_completed"] else None
        chore.completed_at = datetime.utcnow() if data["is_completed"] else None
    if "description" in data:
        chore.description = data["description"]
    if "assigned_to" in data:
        chore.assigned_to = data["assigned_to"]
    if "day_of_week" in data:
        chore.day_of_week = data["day_of_week"]
    if "time_of_day" in data:
        chore.time_of_day = data["time_of_day"]

    db.session.commit()
    return jsonify(chore.to_dict())


@chores_bp.route("/chores/<int:chore_id>", methods=["DELETE"])
@jwt_required()
def delete_chore(chore_id):
    user_id = get_jwt_identity()
    chore = Chore.query.get_or_404(chore_id)
    if not is_group_member(chore.group_id, user_id):
        return jsonify({"error": "Not a member of this group"}), 403    # Forbidden; logeged in but not allowed to do this action

    db.session.delete(chore)
    db.session.commit()
    return jsonify({"message": "Chore deleted"})


@chores_bp.route("/groups/<int:group_id>/stats", methods=["GET"])
@jwt_required()
def get_group_stats(group_id):
    user_id = get_jwt_identity()
    if not is_group_member(group_id, user_id):
        return jsonify({"error": "Not a member of this group"}), 403    # Forbidden; logged in but not allowed to do this action

    members = RoommateGroupMember.query.filter_by(group_id=group_id).all()
    stats = []
    for member in members:
        completed = Chore.query.filter_by(
            group_id=group_id,
            completed_by=member.user_id,
            is_completed=True
        ).count()
        assigned = Chore.query.filter_by(
            group_id=group_id,
            assigned_to=member.user_id
        ).count()
        stats.append({
            "user_id": member.user_id,
            "name": member.user.name,
            "completed": completed,
            "assigned": assigned
        })
    return jsonify(stats)