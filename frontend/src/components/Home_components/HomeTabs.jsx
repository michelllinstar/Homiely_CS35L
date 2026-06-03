import "./HomeTabs.css";

export default function HomeTabs({ group }) {
  if (!group) {
    return (
      <section className="home-tabs">
        <h2>No roommate group found</h2>
        <p>Create or join a group to see roommates here.</p>
      </section>
    );
  }

  return (
    <section className="home-tabs">
      <div className="tabs-header">
        <h2>{group.name}</h2>
        <p>{group.members.length} roommates · Join code: {group.join_code}</p>
      </div>

      <div className="roommate-grid">
        {group.members.map((member) => (
          <div className="roommate-card" key={member.id}>
            <div className="circle">
              {member.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h3>{member.name}</h3>
              <p>{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}