from werkzeug.security import generate_password_hash

from extensions import db
from models import RoommateGroup, RoommateGroupMember, User


def seed_test_user():
    existing = User.query.filter_by(email="test@example.com").first()

    if existing:
        print("[SEED] Test user already exists, skipping")
        return

    test_user = User(
        email="test@example.com",
        password_hash=generate_password_hash("password123"),
        name="Test User"
    )

    db.session.add(test_user)
    db.session.commit()

    print("[SEED] Test user created: test@example.com / password123")


def seed_demo_group():
    owner = User.query.filter_by(email="demo-owner@example.com").first()

    if not owner:
        owner = User(
            email="demo-owner@example.com",
            password_hash=generate_password_hash("password123"),
            name="Demo Owner"
        )
        db.session.add(owner)
        db.session.flush()

    group = RoommateGroup.query.filter_by(join_code="DEMO123").first()

    if not group:
        group = RoommateGroup(
            name="Demo Apartment",
            join_code="DEMO123"
        )
        db.session.add(group)
        db.session.flush()

    membership = RoommateGroupMember.query.filter_by(
        group_id=group.id,
        user_id=owner.id
    ).first()

    if not membership:
        db.session.add(RoommateGroupMember(
            group_id=group.id,
            user_id=owner.id
        ))

    db.session.commit()
    print("[SEED] Demo roommate group ready. Join code: DEMO123")
