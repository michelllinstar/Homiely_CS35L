from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Expense, ExpenseSplit

expenses_bp = Blueprint("expenses", __name__)


@expenses_bp.route("/api/expenses", methods=["POST"])
@jwt_required()
def add_expense():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    split_between = data.get("split_between", [])

    if not split_between:
        return jsonify({"message": "Choose at least one person to split with"}), 400

    share = round(data["amount"] / len(split_between), 2)

    expense = Expense(
        description=data["description"],
        amount=data["amount"],
        paid_by=data.get("paid_by", user_id),
        group_id=data["group_id"]
    )
    db.session.add(expense)
    db.session.flush()

    for uid in split_between:
        db.session.add(ExpenseSplit(
            expense_id=expense.id,
            owed_by=uid,
            amount=share
        ))

    db.session.commit()
    return jsonify({"message": "Expense added", "expense_id": expense.id})


@expenses_bp.route("/api/expenses/<int:group_id>", methods=["GET"])
@jwt_required()
def get_expenses(group_id):
    expenses = Expense.query.filter_by(group_id=group_id).all()
    return jsonify([{
        "id": e.id,
        "description": e.description,
        "amount": e.amount,
        "paid_by": e.paid_by,
        "group_id": e.group_id,
        "split_between": [s.owed_by for s in e.splits],
        "splits": [
            {
                "owed_by": s.owed_by,
                "amount": s.amount,
                "is_paid": s.is_paid
            }
            for s in e.splits
        ]
    } for e in expenses])


@expenses_bp.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    ExpenseSplit.query.filter_by(expense_id=expense_id).delete()
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Deleted"})

# [GenAI Use] Prompt: i want an expense page that allows roommates to add expenses and show what they owe each other. what information would i send to the backend, and how would you recommend i organize the information with what i currently have?
# [GenAI Use] LLM Response Start

# Great feature! Here's how I'd think about it given your existing setup.
# What information to send to the backend:
# When a roommate adds an expense:
# json{
#   "description": "Groceries",
#   "amount": 84.50,
#   "paid_by": 1,          // user_id of who paid
#   "split_between": [1, 2, 3]  // user_ids of who owes a share
# }
# Database models to add:
# pythonclass Expense(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     description = db.Column(db.String(100), nullable=False)
#     amount = db.Column(db.Float, nullable=False)
#     paid_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False)
#     created_at = db.Column(db.DateTime, default=db.func.now())
#     splits = db.relationship('ExpenseSplit', backref='expense', lazy=True)

# class ExpenseSplit(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
#     owed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     amount = db.Column(db.Float, nullable=False)   # each person's share
#     is_paid = db.Column(db.Boolean, default=False)
# The reason for two tables is that one expense can have multiple splits — e.g. a $90 grocery bill split 3 ways creates one Expense row and three ExpenseSplit rows of $30 each.
# Flask endpoints:
# python@app.route('/api/expenses', methods=['POST'])
# @jwt_required()
# def add_expense():
#     data = request.get_json()
#     user_id = int(get_jwt_identity())

#     split_between = data.get("split_between", [])
#     share = round(data["amount"] / len(split_between), 2)

#     expense = Expense(
#         description=data["description"],
#         amount=data["amount"],
#         paid_by=user_id,
#         group_id=data["group_id"]
#     )
#     db.session.add(expense)
#     db.session.flush()

#     for uid in split_between:
#         split = ExpenseSplit(
#             expense_id=expense.id,
#             owed_by=uid,
#             amount=share
#         )
#         db.session.add(split)

#     db.session.commit()
#     return jsonify({"message": "Expense added", "expense_id": expense.id})


# @app.route('/api/expenses/<int:group_id>', methods=['GET'])
# @jwt_required()
# def get_expenses(group_id):
#     expenses = Expense.query.filter_by(group_id=group_id).all()
#     result = []
#     for e in expenses:
#         result.append({
#             "id": e.id,
#             "description": e.description,
#             "amount": e.amount,
#             "paid_by": e.paid_by,
#             "splits": [
#                 {"owed_by": s.owed_by, "amount": s.amount, "is_paid": s.is_paid}
#                 for s in e.splits
#             ]
#         })
#     return jsonify(result)


# @app.route('/api/expenses/settle', methods=['POST'])
# @jwt_required()
# def settle_split():
#     data = request.get_json()
#     split = ExpenseSplit.query.get(data["split_id"])
#     split.is_paid = True
#     db.session.commit()
#     return jsonify({"message": "Marked as paid"})
# How the data flows on the frontend:
# Expenses Page
# ├── Add Expense Form
# │     ├── description (text input)
# │     ├── amount (number input)
# │     └── split_between (checkboxes, one per roommate)
# │
# └── Expense List
#       └── per expense:
#             ├── who paid, total amount
#             └── per split: who owes what, paid/unpaid status
# Calculating who owes who (do this on the frontend from the splits data):
# js// build a summary like "Alice owes Bob $30"
# function calculateBalances(expenses, currentUserId) {
#   const balances = {}; // { userId: amount } positive = they owe you, negative = you owe them

#   expenses.forEach(expense => {
#     expense.splits.forEach(split => {
#       if (split.is_paid) return;

#       if (expense.paid_by === currentUserId && split.owed_by !== currentUserId) {
#         // someone owes you
#         balances[split.owed_by] = (balances[split.owed_by] || 0) + split.amount;
#       } else if (split.owed_by === currentUserId && expense.paid_by !== currentUserId) {
#         // you owe someone
#         balances[expense.paid_by] = (balances[expense.paid_by] || 0) - split.amount;
#       }
#     });
#   });

#   return balances;
# }
# How it fits into your existing system:
# User ──belongs to──► Group
#                        │
#                        ├──has many──► Expense (paid_by a User)
#                                         │
#                                         └──has many──► ExpenseSplit (owed_by a User)
# Everything is scoped to a group_id so roommates only see their group's expenses, which slots naturally into the group system you already built.

# [GenAI Use] LLM Response End
# [GenAI Use] Reflection: From the way I prompted the LLM, I wanted to extra sure that the LLM wasn't coding for me, but was recommending me methods for developing the feature myself. The LLM did a great job of this, giving me a clear outline of what information to send to the backend, how to organize the database models, what Flask endpoints to create, and how the data would flow on the frontend. This gave me a great starting point, and I continued to adapt and implement some of the text featured in the LLM response. 