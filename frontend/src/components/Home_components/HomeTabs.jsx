import "./HomeTabs.css";

export default function HomeTabs() {
  const roommates = [
    { initials: "EC", name: "Emma", status: "home · Available" },
    { initials: "JH", name: "Jerry", status: "out · In class" },
    { initials: "TL", name: "Thomas", status: "home · Available" },
    { initials: "ML", name: "You", status: "out · Working" },
  ];

  return (
    <section className="home-tabs">
      <div className="tabs-header">
        <h2>Sproutwood Hall · 412B</h2>
        <p>4 roommates · since Sept 2025</p>
      </div>

      <div className="roommate-grid">
        {roommates.map((person) => (
          <div className="roommate-card" key={person.name}>
            <div className="circle">{person.initials}</div>
            <div>
              <h3>{person.name}</h3>
              <p>{person.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}