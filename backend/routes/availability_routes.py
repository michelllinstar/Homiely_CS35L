from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Availability

availability_bp = Blueprint('availability', __name__, url_prefix='/api/availability')


@availability_bp.route('/', methods=['GET'])
@jwt_required()
def get_availability():
    """
    GET /api/availability/?date=YYYY-MM-DD
    Returns all users' availability for a given date.
    """
    date_str = request.args.get('date')
    try:
        target_date = date.fromisoformat(date_str)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid or missing date parameter'}), 400

    rows = Availability.query.filter_by(date=target_date).all()
    return jsonify([
        {
            'user_id': r.user_id,
            'name':    r.user.name,
            'hour':    r.hour,
            'status':  r.status,
        }
        for r in rows
    ])


@availability_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_availability():
    """
    GET /api/availability/me?date=YYYY-MM-DD
    Returns the current user's availability for a given date.
    """
    user_id  = get_jwt_identity()
    date_str = request.args.get('date')
    try:
        target_date = date.fromisoformat(date_str)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid or missing date parameter'}), 400

    rows = Availability.query.filter_by(user_id=user_id, date=target_date).all()
    return jsonify([{'hour': r.hour, 'status': r.status} for r in rows])


@availability_bp.route('/me', methods=['POST'])
@jwt_required()
def set_my_availability():
    """
    POST /api/availability/me
    Body: { "date": "YYYY-MM-DD", "hour": 14, "status": "available" }
    Creates or replaces the slot.
    """
    user_id = get_jwt_identity()
    data    = request.get_json()

    try:
        target_date = date.fromisoformat(data['date'])
        hour        = int(data['hour'])
        status      = data['status']
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'Invalid payload'}), 400

    if hour < 0 or hour > 23:
        return jsonify({'error': 'hour must be 0–23'}), 400

    if status not in ('available', 'busy', 'private'):
        return jsonify({'error': 'Invalid status'}), 400

    row = Availability.query.filter_by(
        user_id=user_id, date=target_date, hour=hour
    ).first()

    if row:
        row.status = status
    else:
        row = Availability(user_id=user_id, date=target_date, hour=hour, status=status)
        db.session.add(row)

    db.session.commit()
    return jsonify({'date': str(target_date), 'hour': hour, 'status': status}), 200


#  [GenAI Use] Prompt: "Can you help me brainstorm some ways I could implement some Flask endpoints for our project's availability page? Our current endpoints we're thinking about right now are GET 'api/availability' , GET 'api/availablity/me' and POST 'api/availability/me'."

#  [GenAI Use] LLM Response Start

# Claude responded: Sure!Sure! Let me think through what each endpoint needs and some design decisions for each.
# GET /api/availability — everyone's availability in the group
# The main question here is what format to return. A few options:

# Return a flat list of all availability entries for everyone in the group, and let the frontend compute overlaps
# Return a pre-computed overlap showing which time slots everyone is free simultaneously
# Return a nested structure grouped by user, then by day/time

# The flat list is simplest to implement and gives the frontend flexibility to display it however you want. You'd filter by group_id from the logged-in user's group.
# GET /api/availability/me — current user's own availability
# This is straightforward — just return the logged-in user's saved availability slots. The main decision is the data format for time slots. Some options:

# Store as day + start time + end time (e.g. "Monday", "09:00", "17:00")
# Store as a bitmask (each bit = 30 min slot) — very compact but harder to read
# Store as ISO datetime ranges — most precise but overkill for weekly recurring schedules

# For a roommate app, day + start/end time is probably the most natural fit since availability is likely recurring weekly rather than specific dates.
# POST /api/availability/me — save current user's availability
# The key decision here is whether this replaces or merges availability. Replacing is simpler — just delete all existing slots for the user and insert the new ones. Merging is more complex but lets users add individual slots without overwriting everything.
# Replacing is recommended for a weekly availability UI where users submit their whole schedule at once.
# A few things worth thinking through before building:

# Is availability recurring weekly ("I'm free every Monday 9-5") or specific dates ("I'm free Dec 3rd")? This changes your data model significantly.
# Do you need a DELETE /api/availability/me to clear availability, or does the POST replace handle that?
# Will you need overlap detection on the backend, or is the frontend handling that?
# Should availability be scoped to the group, or is it per-user globally?

# What's the actual use case for the availability page — finding times when all roommates are home, or scheduling something specific?

#  [GenAI Use] LLM Response End
#  [GenAI Use] Reflection: Claude's response helped us shape these endpoints into what we wanted them to be. We wanted to be concise while also covering all of our bases. Because we were all beginners, we didn't want to go overboard with the number of endpoints we were working with. For that reason, we came up with three endpoints and asked the LLM what it thought. This allowed us to formulate what each endpoint would return, and because availablity was implemented after other features, we already had a good idea about how to properly retrive data from the database. Therefore, these prompting questions helped a lot in affirming our assumptions about what we planned to do.