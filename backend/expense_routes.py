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
