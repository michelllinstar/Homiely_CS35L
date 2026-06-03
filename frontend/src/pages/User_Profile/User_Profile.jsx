import "./User_profile.css";
import { useState, useEffect } from 'react';
import { useAuth } from "../AuthContext";
import { useNavigate } from 'react-router-dom';
import AppNavbar from "../../components/Home_components/AppNavbar";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roommateGroup, setRoommateGroup] = useState(null);
  const [groupmates, setGroupmates] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(false);

  // Parse full name into first and last name
  const parseFullName = (fullName) => {
    const parts = (fullName || '').trim().split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  const [formData, setFormData] = useState(() => {
    const { firstName, lastName } = parseFullName(user?.name);
    return {
      firstName,
      lastName,
      email: user?.email || '',
    };
  });

  useEffect(() => {
    const { firstName, lastName } = parseFullName(user?.name);
    setFormData({
      firstName,
      lastName,
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserGroup();
    }
  }, [user]);

  const fetchUserGroup = async () => {
    setLoadingGroup(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/groups/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.has_roommate_group && data.group) {
        setRoommateGroup(data.group);
        setGroupmates(data.group.members || []);
      }
    } catch (err) {
      console.log('Error fetching group:', err);
    } finally {
      setLoadingGroup(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Network error. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const { firstName, lastName } = parseFullName(user?.name);
    setFormData({
      firstName,
      lastName,
      email: user?.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div>
      <AppNavbar />
      <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-card">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!isEditing ? (
            <div className="profile-info">
              <div className="info-group">
                <label>First Name</label>
                <p className="info-value">{formData.firstName}</p>
              </div>

              <div className="info-group">
                <label>Last Name</label>
                <p className="info-value">{formData.lastName}</p>
              </div>

              <div className="info-group full-width">
                <label>Email</label>
                <p className="info-value">{formData.email}</p>
              </div>

              {user && roommateGroup && (
                <div className="info-group full-width">
                  <label>Roommate Group: {roommateGroup.name}</label>
                  <div className="roommates-list">
                    {groupmates.map((roommate) => (
                      <div key={roommate.id} className="roommate-card">
                        <p className="roommate-name">{roommate.name}</p>
                        <p className="roommate-email">{roommate.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@g.ucla.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
    
  );
}
