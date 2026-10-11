import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify
from sqlalchemy import text, delete
from datetime import datetime, timezone
from flask_migrate import Migrate



load_dotenv() 
app = Flask(__name__)

database_url = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app) #Database Object
migrate = Migrate(app, db) #Migrate Object, migrates app and db

@app.route("/")
def home():
    return "Flask is Working!!!"

@app.route("/test-db")
def test_db():
    try:
        db.session.execute(text("SELECT 1"))
        return "Database Connection Successfull"

    except Exception as e:  
        return f"Error: {str(e)}"

class Transaction(db.Model):
        __tablename__ = "transactions"

        id = db.Column(db.Integer, primary_key = True)
        type = db.Column(db.String, nullable = False, default = "income")
        amount = db.Column(db.Float, nullable = False, default = 0.0)
        category = db.Column(db.String, nullable = False)
        description = db.Column(db.Text, nullable = False)
        date = db.Column(db.DateTime)
        created = db.Column(db.DateTime, default = datetime.utcnow)

        def to_dict(self):
            return {
                "id": self.id,
                "type": self.type,
                "amount": self.amount,
                "category": self.category,
                "description": self.description,
                "date": self.date,
                "created": self.created
            }
            


@app.route("/transactions", methods = ["POST"])
def create_transaction():
    try:
        data = request.get_json()
        new_transaction = Transaction(  
            type=data.get("type"),
            amount=data.get("amount"),
            category=data.get("category"),
            description=data.get("description"),
            date=datetime.fromisoformat(data.get("date"))
        )     
        db.session.add(new_transaction)
        db.session.commit()
        return {"message": "Transaction Created", "id": new_transaction.id}, 201
    except Exception as e:
        return{"Error": str(e)}, 400

@app.route("/transactions/<id>", methods = ["GET"])
def get_transaction(id):
    try:
        id = int(id)
        transactions = Transaction.query.get(id)
        if not transactions:
            return jsonify({"message": "transaction not found"}), 404
        return jsonify(transactions.to_dict()), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 400

@app.route("/transactions/<id>", methods = ["PUT"])
def update_transaction(id):
    try:
        id = int(id)
        transaction = Transaction.query.get(id)
        if not transaction:
            return jsonify({"message": "id not found"}), 404

        data = request.get_json()

        if data.get("type"):
            transaction.type = data.get("type")
        if data.get("amount"):
            transaction.amount = data.get("amount")
        if data.get("category"):
            transaction.category = data.get("category")
        if data.get("description"):
            transaction.description = data.get("description")
        if data.get("date"):
            transaction.date = datetime.fromisoformat(data.get("date"))

        
        db.session.commit()
        return jsonify(transaction.to_dict()), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 400

@app.route("/transactions/<id>", methods = ["DELETE"])
def delete_transaction(id):
    try:
        id = int(id)
        transaction = Transaction.query.get(id)
        if not transaction:
            return jsonify({"message": "id not found"}), 404
        db.session.delete(transaction)
        db.session.commit()    
        return jsonify({"message": "transaction deleted"}), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 400


with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug = True)   