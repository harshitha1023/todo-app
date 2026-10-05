import os
from datetime import datetime, timezone
from bson import ObjectId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, DESCENDING

app = Flask(__name__)
CORS(app)

client = MongoClient(os.environ.get("MONGO_URI", "mongodb://localhost:27017"))
todos = client["todo_db"]["todos"]


def serialize(doc):
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "completed": doc.get("completed", False),
        "created_at": doc["created_at"].isoformat(),
    }


@app.get("/api/todos")
def list_todos():
    docs = todos.find().sort("created_at", DESCENDING)
    return jsonify([serialize(d) for d in docs])


@app.post("/api/todos")
def create_todo():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    doc = {"title": title, "completed": False,
           "created_at": datetime.now(timezone.utc)}
    doc["_id"] = todos.insert_one(doc).inserted_id
    return jsonify(serialize(doc)), 201


@app.put("/api/todos/<todo_id>")
def update_todo(todo_id):
    data = request.get_json(silent=True) or {}
    updates = {}
    if "title" in data:
        updates["title"] = data["title"].strip()
    if "completed" in data:
        updates["completed"] = bool(data["completed"])

    result = todos.find_one_and_update(
        {"_id": ObjectId(todo_id)}, {"$set": updates}, return_document=True)
    if result is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(serialize(result))


@app.delete("/api/todos/<todo_id>")
def delete_todo(todo_id):
    todos.delete_one({"_id": ObjectId(todo_id)})
    return "", 204


if __name__ == "__main__":
    app.run(port=5000, debug=True)