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

# This function creates a demo roommate group. The group join code is "DEMO123".
# It includes 5 demo users: Emma, Jerry, Thomas, Michelle, and Kelvin. 
# The test user is not included in this group, so you can use the test user to create your own group and test the app's features without affecting the demo group. 
# The demo group is meant for testing and demonstration purposes, so feel free to join it with the provided join code and explore its features!
def seed_demo_group():
    demo_users = [
        ("emma@example.com", "Emma Cao"),
        ("jerry@example.com", "Jerry Huang"),
        ("thomas@example.com", "Thomas Le"),
        ("michelle@example.com", "Michelle Lin"),
        ("kelvin@example.com", "Kelvin Xu"),
    ]

    users = []

    for email, name in demo_users:
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                email=email,
                password_hash=generate_password_hash("password123"),
                name=name
            )
            db.session.add(user)
            db.session.flush()

        users.append(user)

    group = RoommateGroup.query.filter_by(join_code="DEMO123").first()

    if not group:
        group = RoommateGroup(
            name="Sproutwood Hall · 412B",
            join_code="DEMO123"
        )
        db.session.add(group)
        db.session.flush()

    for user in users:
        membership = RoommateGroupMember.query.filter_by(
            group_id=group.id,
            user_id=user.id
        ).first()

        if not membership:
            db.session.add(RoommateGroupMember(
                group_id=group.id,
                user_id=user.id
            ))

    db.session.commit()
    print("[SEED] Demo roommate group ready. Join code: DEMO123")
