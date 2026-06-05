from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash

from extensions import blocklist, db
from helpers import user_to_json
from models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "credentials incorrect. try again."}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_to_json(user)
    })


@auth_bp.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token})


@auth_bp.route("/api/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    blocklist.add(jti)
    return jsonify({"message": "Logged out"})


@auth_bp.route("/api/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user_to_json(user))


@auth_bp.route("/api/profile/update", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    email = data.get("email", "").lower().strip()

    # Combine names the same way signup does
    name = f"{first_name} {last_name}".strip()
    
    if name:
        user.name = name
    
    if email:
        # Check if email is already taken by another user
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Email already in use"}), 400
        user.email = email
    
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": user_to_json(user)
    })

# [GenAI Prompt] how would i write a react.js, flask web app page for a login.jsx with proper authentication?

# [GenAI Use] LLM Response Start
# Here's a complete guide for building a React + Flask login with proper authentication.

# Architecture Overview
# project/
# ├── frontend/          # React app
# │   └── src/
# │       ├── Login.jsx
# │       ├── PrivateRoute.jsx
# │       └── AuthContext.jsx
# └── backend/           # Flask app
#     ├── app.py
#     └── requirements.txt

# Backend: Flask
# app.py
# pythonfrom flask import Flask, request, jsonify
# from flask_cors import CORS
# from flask_jwt_extended import (
#     JWTManager, create_access_token, create_refresh_token,
#     jwt_required, get_jwt_identity, get_jwt
# )
# from werkzeug.security import generate_password_hash, check_password_hash
# from datetime import timedelta

# app = Flask(__name__)
# CORS(app, supports_credentials=True)

# app.config["JWT_SECRET_KEY"] = "your-secret-key-change-in-production"
# app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
# app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

# jwt = JWTManager(app)

# # Token blocklist for logout (use Redis in production)
# blocklist = set()

# @jwt.token_in_blocklist_loader
# def check_if_token_revoked(jwt_header, jwt_payload):
#     return jwt_payload["jti"] in blocklist

# # Mock DB — replace with SQLAlchemy/Postgres in production
# users_db = {
#     "alice@example.com": {
#         "id": 1,
#         "name": "Alice",
#         "password": generate_password_hash("password123")
#     }
# }

# @app.route("/api/login", methods=["POST"])
# def login():
#     data = request.get_json()
#     email = data.get("email", "").lower().strip()
#     password = data.get("password", "")

#     user = users_db.get(email)
#     if not user or not check_password_hash(user["password"], password):
#         return jsonify({"error": "Invalid email or password"}), 401

#     access_token = create_access_token(identity=str(user["id"]))
#     refresh_token = create_refresh_token(identity=str(user["id"]))

#     return jsonify({
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "user": {"id": user["id"], "name": user["name"], "email": email}
#     })

# @app.route("/api/refresh", methods=["POST"])
# @jwt_required(refresh=True)
# def refresh():
#     identity = get_jwt_identity()
#     access_token = create_access_token(identity=identity)
#     return jsonify({"access_token": access_token})

# @app.route("/api/logout", methods=["DELETE"])
# @jwt_required()
# def logout():
#     jti = get_jwt()["jti"]
#     blocklist.add(jti)
#     return jsonify({"message": "Logged out"})

# @app.route("/api/me", methods=["GET"])
# @jwt_required()
# def me():
#     user_id = get_jwt_identity()
#     # Fetch from DB in production
#     return jsonify({"id": user_id, "name": "Alice"})

# if __name__ == "__main__":
#     app.run(debug=True)
# requirements.txt
# flask
# flask-cors
# flask-jwt-extended
# werkzeug

# Frontend: React
# AuthContext.jsx — Global auth state
# jsximport { createContext, useContext, useState, useCallback } from "react";

# const AuthContext = createContext(null);

# export function AuthProvider({ children }) {
#   const [user, setUser] = useState(() => {
#     const saved = localStorage.getItem("user");
#     return saved ? JSON.parse(saved) : null;
#   });

#   const login = useCallback((userData, accessToken, refreshToken) => {
#     localStorage.setItem("access_token", accessToken);
#     localStorage.setItem("refresh_token", refreshToken);
#     localStorage.setItem("user", JSON.stringify(userData));
#     setUser(userData);
#   }, []);

#   const logout = useCallback(async () => {
#     const token = localStorage.getItem("access_token");
#     await fetch("/api/logout", {
#       method: "DELETE",
#       headers: { Authorization: `Bearer ${token}` },
#     });
#     localStorage.clear();
#     setUser(null);
#   }, []);

#   return (
#     <AuthContext.Provider value={{ user, login, logout }}>
#       {children}
#     </AuthContext.Provider>
#   );
# }

# export const useAuth = () => useContext(AuthContext);
# Login.jsx
# jsximport { useState } from "react";
# import { useNavigate } from "react-router-dom";
# import { useAuth } from "./AuthContext";

# export default function Login() {
#   const { login } = useAuth();
#   const navigate = useNavigate();
#   const [form, setForm] = useState({ email: "", password: "" });
#   const [error, setError] = useState("");
#   const [loading, setLoading] = useState(false);

#   const handleSubmit = async (e) => {
#     e.preventDefault();
#     setError("");
#     setLoading(true);

#     try {
#       const res = await fetch("/api/login", {
#         method: "POST",
#         headers: { "Content-Type": "application/json" },
#         body: JSON.stringify(form),
#       });

#       const data = await res.json();

#       if (!res.ok) {
#         setError(data.error || "Login failed");
#         return;
#       }

#       login(data.user, data.access_token, data.refresh_token);
#       navigate("/dashboard");
#     } catch (err) {
#       setError("Network error. Please try again.");
#     } finally {
#       setLoading(false);
#     }
#   };

#   return (
#     <div className="login-container">
#       <h1>Sign In</h1>
#       <form onSubmit={handleSubmit}>
#         <input
#           type="email"
#           placeholder="Email"
#           value={form.email}
#           onChange={(e) => setForm({ ...form, email: e.target.value })}
#           required
#         />
#         <input
#           type="password"
#           placeholder="Password"
#           value={form.password}
#           onChange={(e) => setForm({ ...form, password: e.target.value })}
#           required
#         />
#         {error && <p className="error">{error}</p>}
#         <button type="submit" disabled={loading}>
#           {loading ? "Signing in..." : "Sign In"}
#         </button>
#       </form>
#     </div>
#   );
# }
# PrivateRoute.jsx — Protect routes
# jsximport { Navigate } from "react-router-dom";
# import { useAuth } from "./AuthContext";

# export default function PrivateRoute({ children }) {
#   const { user } = useAuth();
#   return user ? children : <Navigate to="/login" replace />;
# }
# api.js — Axios with auto token refresh
# jsimport axios from "axios";

# const api = axios.create({ baseURL: "/api" });

# // Attach access token to every request
# api.interceptors.request.use((config) => {
#   const token = localStorage.getItem("access_token");
#   if (token) config.headers.Authorization = `Bearer ${token}`;
#   return config;
# });

# // Auto-refresh on 401
# api.interceptors.response.use(
#   (res) => res,
#   async (error) => {
#     const original = error.config;
#     if (error.response?.status === 401 && !original._retry) {
#       original._retry = true;
#       const refresh = localStorage.getItem("refresh_token");
#       const { data } = await axios.post("/api/refresh", null, {
#         headers: { Authorization: `Bearer ${refresh}` },
#       });
#       localStorage.setItem("access_token", data.access_token);
#       original.headers.Authorization = `Bearer ${data.access_token}`;
#       return api(original);
#     }
#     return Promise.reject(error);
#   }
# );

# export default api;
# App.jsx — Wire it all together
# jsximport { BrowserRouter, Routes, Route } from "react-router-dom";
# import { AuthProvider } from "./AuthContext";
# import PrivateRoute from "./PrivateRoute";
# import Login from "./Login";
# import Dashboard from "./Dashboard";

# export default function App() {
#   return (
#     <AuthProvider>
#       <BrowserRouter>
#         <Routes>
#           <Route path="/login" element={<Login />} />
#           <Route
#             path="/dashboard"
#             element={
#               <PrivateRoute>
#                 <Dashboard />
#               </PrivateRoute>
#             }
#           />
#         </Routes>
#       </BrowserRouter>
#     </AuthProvider>
#   );
# }

# Key Security Points
# ConcernSolutionPasswordswerkzeug.security bcrypt hashingAuth tokensShort-lived JWTs (15 min) + refresh tokensLogoutServer-side token blocklistRoute protectionPrivateRoute wrapper componentToken refreshAxios interceptor handles silentlyCORSflask-cors with supports_credentials=True
# Production Checklist

# Move JWT_SECRET_KEY to an environment variable
# Replace the in-memory blocklist with Redis
# Use HTTPS only — never send tokens over HTTP
# Store tokens in httpOnly cookies instead of localStorage to prevent XSS
# Add rate limiting to /api/login (e.g. Flask-Limiter)
# Use a real DB (PostgreSQL + SQLAlchemy) instead of the mock dict

# [GenAI Use] LLM Response End
# [GenAI Use] Reflection: After taking a look at these scripts, I took the time to understand what each part did. Although I wanted to be able to leverage AI usage in the project, I also wanted to make sure I could properly understand each part. For that reason, I omitted the part with the refresh token so I could incrementally understand the code. I also wanted to make sure I could write the code myself, so I didn't just copy and paste the AI generated code, but rather used it as a guide to write my own code. I also made sure to test each part of the code to ensure it worked properly. Overall, I think this approach allowed me to learn and understand the code better, while still leveraging AI to help me write it more efficiently. To understand what each part did, I also prompted Claude to explain to me what each part does and how each part connects to the other. 

# [GenAI Prompt] can you describe what each file does generally?
# [GenAI Use] LLM Response Start
# Sure! Here's a quick rundown:
# Backend

# app.py — The entire Flask server. It defines all the API endpoints (/login, /logout, /refresh, /me), handles password verification, creates JWTs, and manages the token blocklist for logouts.
# requirements.txt — Just lists the Python packages Flask needs to install via pip install -r requirements.txt.

# Frontend

# AuthContext.jsx — A React context that acts as a global "who is logged in?" store. Any component in the app can read the current user or call login/logout from here, without passing props around.
# Login.jsx — The actual login page/form. It collects email and password, sends them to Flask, and on success hands the tokens and user data off to AuthContext.
# PrivateRoute.jsx — A gatekeeper wrapper for protected pages. If you're not logged in and try to visit /dashboard, it redirects you to /login instead of showing the page.
# api.js — A pre-configured Axios instance that automatically attaches your JWT to every request, and silently refreshes the access token when it expires — so your users don't get randomly logged out mid-session.
# App.jsx — The root of the app. It sets up the router, wraps everything in AuthProvider (so all components can access auth state), and maps URL paths to their corresponding page components.

# Think of the data flow as: Login.jsx collects credentials → app.py validates and returns tokens → AuthContext.jsx stores them → api.js attaches them to future requests → PrivateRoute.jsx enforces access control.
# [GenAI Use] LLM Response End
# [GenAI Use] Reflection: From here, I could start to elucidate what each part does a bit more. I took the time to look through the endpoints created in app.py, and realized that if we were to add more routes, it would be wise to create separate endpoint files for each resource (e.g. user_routes.py, group_routes.py, etc.) and then import them into app.py. This would help keep the code organized and maintainable as the project grows. I also noticed that the token blocklist is currently just a set in memory, which is fine for development but not suitable for production. In a real application, we would want to use something like Redis to store the blocklist so that it persists across server restarts and can be shared across multiple instances of the server. Overall, I think this structure provides a solid foundation for building out the authentication system and can be easily extended as needed.