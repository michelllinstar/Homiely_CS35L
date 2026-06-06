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

@chores_bp.route("/api/groups/<int:group_id>/chores", methods=["GET"])
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

@chores_bp.route("/api/groups/<int:group_id>/chores", methods=["POST"])
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


@chores_bp.route("/api/chores/<int:chore_id>", methods=["PATCH"])
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


@chores_bp.route("/api/chores/<int:chore_id>", methods=["DELETE"])
@jwt_required()
def delete_chore(chore_id):
    user_id = get_jwt_identity()
    chore = Chore.query.get_or_404(chore_id)
    if not is_group_member(chore.group_id, user_id):
        return jsonify({"error": "Not a member of this group"}), 403    # Forbidden; logeged in but not allowed to do this action

    db.session.delete(chore)
    db.session.commit()
    return jsonify({"message": "Chore deleted"})


@chores_bp.route("/api/groups/<int:group_id>/stats", methods=["GET"])
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



# [GenAI Use] Prompt: give me some suggestions on how to implement the chores endpoints GET /api/groups/<int:group_id>/chores POST /api/groups/<int:group_id>/chores
# [GenAI Use] LLM Response Start
# 11:54 PM
# Here are some design decisions and suggestions for each endpoint:

# GET /api/groups/<int:group_id>/chores

# The main question is what data the frontend needs. A minimal response might just be:

# json
# [
#   {
#     "id": 1,
#     "name": "Vacuum living room",
#     "assigned_to": 2,
#     "assigned_to_name": "Bob",
#     "due_date": "2026-05-28",
#     "is_complete": false
#   }
# ]
# Some design decisions to think through:

# Do you want to return all chores for the group, or filter by status (incomplete only, or this week's chores)?
# Should you include the assigned user's name in the response, or just their id and let the frontend look it up from the members list it already has?
# Do chores recur (every Monday, Bob vacuums) or are they one-off tasks? Recurring chores significantly complicate the data model.
# Do you want categories (cleaning, groceries, trash) or just free-text names?
# POST /api/groups/<int:group_id>/chores

# The request body would look something like:

# json
# {
#   "name": "Vacuum living room",
#   "assigned_to": 2,
#   "due_date": "2026-05-28"
# }
# Some design decisions:

# Should any group member be able to create a chore and assign it to anyone, or only assign to themselves?
# Is due_date required or optional?
# When a chore is created, does it auto-rotate assignment between roommates, or does the creator manually pick who does it?
# Additional endpoints worth considering alongside these two:

# PATCH /api/groups/<int:group_id>/chores/<int:chore_id>   — mark complete, reassign, change due date
# DELETE /api/groups/<int:group_id>/chores/<int:chore_id>  — delete a chore
# The PATCH is probably the most important one — without it your frontend has no way to mark a chore as done.

# Suggested data model:

# python
# class Chore(db.Model):
#     id          = db.Column(db.Integer, primary_key=True)
#     group_id    = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False)
#     name        = db.Column(db.String(100), nullable=False)
#     assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
#     due_date    = db.Column(db.Date, nullable=True)
#     is_complete = db.Column(db.Boolean, default=False)
#     created_by  = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     created_at  = db.Column(db.DateTime, default=db.func.now())
# The most important question to answer before building is whether chores recur or not — if they do, you'll want a recurrence field (e.g. "weekly", "monthly") and logic to auto-generate the next chore when one is completed. If they're one-off tasks, the model above is sufficient and straightforward to implement.


# [GenAI Use] LLM Response End
# [GenAI Use] Reflection: Although it's easy to use LLMs for all code, we found it helpful to prompt it to give design advice, since it allowed us to reflect on our design decisions. We also appreciated that it pointed out some important questions to answer before building, such as whether chores recur or not, since that has a big impact on the data model and implementation complexity. 