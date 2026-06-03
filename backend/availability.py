from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Availability

bp = Blueprint('availability', __name__, url_prefix='/api/availability')


@bp.route('/', methods=['GET'])
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


@bp.route('/me', methods=['GET'])
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


@bp.route('/me', methods=['POST'])
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