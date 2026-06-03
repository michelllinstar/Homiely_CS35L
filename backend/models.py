from extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)


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


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    paid_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("roommate_group.id"),
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=db.func.now())
    splits = db.relationship("ExpenseSplit", backref="expense", lazy=True)


class ExpenseSplit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(
        db.Integer,
        db.ForeignKey("expense.id"),
        nullable=False
    )
    owed_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    is_paid = db.Column(db.Boolean, default=False)

class Availability(db.Model):
    __tablename__ = 'availability'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date       = db.Column(db.Date, nullable=False)
    hour       = db.Column(db.Integer, nullable=False)  # 0–23
    status     = db.Column(db.String(20), nullable=False)  # 'available', 'busy', 'private'

    user = db.relationship('User', backref='availability')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', 'hour', name='uq_user_date_hour'),
    )