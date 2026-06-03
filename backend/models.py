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

class Chore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("roommate_group.id"), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    description = db.Column(db.String(200), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)      # "Sunday", "Monday", etc.
    time_of_day = db.Column(db.String(50), default="Due anytime")
    week_start_date = db.Column(db.Date, nullable=False)        # The Sunday of that week
    is_completed = db.Column(db.Integer, default=False)
    completed_by = db.Column(db.Integer, db.ForeginKey("user.id"), nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    group = db.relationship("RoommateGroup", backref="chores")
    assignee = db.relationship("User", foreign_keys=[assigned_to], backref="assigned_chores")
    completer = db.relationship("User", foreign_keys=[completed_by], backref="completed_chores")

    def to_dict(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "assigned_to": self.assigned_to,
            "description": self.description,
            "day_of_week": self.day_of_week,
            "time_of_day": self.time_of_day,
            "week_start_date": str(self.week_start_date),
            "is_completed": self.is_completed,
            "completed_by": self.completed_by,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }