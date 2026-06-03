import "./User_profile.css";
import { useState, useEffect } from 'react';
import { useAuth } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    // if (!user) {
    //   navigate('/login');
    // } else {
      setFormData({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
      });
    // }
  }, [user, navigate]);

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
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    setFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
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

              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
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
  );
}
