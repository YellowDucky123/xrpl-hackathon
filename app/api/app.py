from flask import Flask, jsonify, request
from flask_cors import CORS
from db import (
    get_all_projects,
    get_projects_by_flag,
    get_all_users,
    get_user_by_id,
    login_user,
)

app = Flask(__name__)
CORS(app)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/projects")
def projects():
    return jsonify(get_all_projects())


@app.route("/projects/featured")
def projects_featured():
    return jsonify(get_projects_by_flag("is_featured"))


@app.route("/projects/recommended")
def projects_recommended():
    return jsonify(get_projects_by_flag("is_recommended"))


@app.route("/projects/popular")
def projects_popular():
    return jsonify(get_projects_by_flag("is_popular"))


@app.route("/users")
def users():
    return jsonify(get_all_users())


@app.route("/users/<int:user_id>")
def user(user_id):
    result = get_user_by_id(user_id)
    if result is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(result)


@app.route("/login", methods=["POST"])
def login():
    body = request.get_json()
    user = login_user(body.get("username", ""), body.get("password", ""))
    if user is None:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify(user)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
