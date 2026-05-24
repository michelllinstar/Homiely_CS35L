import secrets

from models import RoommateGroupMember


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
