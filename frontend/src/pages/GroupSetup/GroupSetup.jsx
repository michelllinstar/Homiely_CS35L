import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./GroupSetup.css";


// [GenAI Use] Prompt: "Role: React tutor. Context: My app lets logged-in users create a roommate group or join one with a code. Task: Give me a fill-in React template for this GroupSetup component, not final code. Criteria: Include TODO placeholders for route names, request bodies, state names, auth update logic, and navigation; add beginner-friendly comments explaining form submit and fetch syntax."
// [GenAI Use] LLM Response Start
/* Fill-in template:
    export default function GroupSetup() {
        // TODO: use state for each form input.
        const [createInput, setCreateInput] = useState("");
        const [joinInput, setJoinInput] = useState("");

        // TODO: use state for request status and errors.
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        // TODO: get token/auth updater from context and navigate from router.
        const { accessToken, updateUser } = useAuth();
        const navigate = useNavigate();

        async function submitGroupAction(url, body) {
            setError("");
            setLoading(true);

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    // fetch cannot send a JS object directly, so stringify it.
                    body: JSON.stringify(body),
                });

                const data = await res.json();

                if (!res.ok) {
                    // TODO: show the backend error message.
                    setError(data.message || "TODO_ERROR_MESSAGE");
                    return;
                }

                // TODO: save the updated user and route to the next page.
                updateUser(data.user);
                navigate("TODO_SUCCESS_ROUTE");
            } finally {
                setLoading(false);
            }
        }

        function handleCreate(e) {
            // Prevents the browser's default full-page form refresh.
            e.preventDefault();
            submitGroupAction(CREATE_ROUTE, {
                // TODO: fill in the backend's expected create payload.
                name: createInput,
            });
        }

        function handleJoin(e) {
            e.preventDefault();
            submitGroupAction(JOIN_ROUTE, {
                // TODO: fill in the backend's expected join payload.
                join_code: joinInput,
            });
        }
    } */
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: I used this as a planning template instead of copying it directly. I filled in Homiely's real API routes, request bodies, auth update logic, navigation path, and form names.

const DEFAULT_GROUP_NAME = "My Roommate Group";
const CREATE_GROUP_URL = "/api/groups/create";
const JOIN_GROUP_URL = "/api/groups/join";

export default function GroupSetup() {
  // These two pieces of state keep track of what the user types in each form.
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // loading disables both forms so the user cannot submit twice.
  const [loading, setLoading] = useState(false);

  // error is shared because only one request is happening at a time.
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { accessToken, updateUser } = useAuth();

  const saveUserAndGoHome = (user) => {
    // Creating or joining a group changes the user object, not the JWT tokens.
    // Updating auth context also updates localStorage through AuthContext.
    updateUser(user);
    navigate("/home");
  };

  // Both forms send almost the same request.
  // url decides which backend route we call, and body is the form data.
  const submitGroupAction = async (url, body) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        // fetch needs a string body, so we turn the JS object into JSON.
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      saveUserAndGoHome(data.user);
    } catch (err) {
      setError("Network error. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = (e) => {
    // Stop the browser from refreshing the page when the form submits.
    e.preventDefault();

    // If the user leaves the field blank, still create a usable group.
    submitGroupAction(CREATE_GROUP_URL, {
      name: groupName.trim() || DEFAULT_GROUP_NAME,
    });
  };

  const joinGroup = (e) => {
    e.preventDefault();

    submitGroupAction(JOIN_GROUP_URL, {
      join_code: joinCode.trim(),
    });
  };

  return (
    <div className="group-setup-page">
      <div className="group-setup-panel">
        {/* Small eyebrow text makes this feel like a setup step, not a whole new app page. */}
        <p className="group-setup-eyebrow">One last step</p>
        <h1>Set up your home</h1>
        <p className="group-setup-subtitle">
          Create a new roommate group or join one with an invite code.
        </p>

        {/* Show backend errors, like invalid join code or already being in a group. */}
        {error && <p className="group-setup-error">{error}</p>}

        {/* Two cards give create and join equal weight. A user may need either path. */}
        <div className="group-setup-grid">
          <form onSubmit={createGroup} className="group-setup-card">
            <h2>Create a group</h2>
            <label htmlFor="group-name">Home name</label>
            <input
              id="group-name"
              type="text"
              placeholder="Gayley Apartment"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Working..." : "Create group"}
            </button>
          </form>

          <form onSubmit={joinGroup} className="group-setup-card">
            <h2>Join a group</h2>
            <label htmlFor="join-code">Join code</label>
            <input
              id="join-code"
              type="text"
              placeholder="ABC123"
              value={joinCode}
              // Join codes are stored uppercase, so make the input match while typing.
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button type="submit" disabled={loading || !joinCode}>
              {loading ? "Working..." : "Join group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
