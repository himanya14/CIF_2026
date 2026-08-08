import "../styles/NotificationPanel.css";

const notifications = [
  {
    type: "critical",
    title: "API Key Leak Blocked",
    time: "2 min ago",
  },
  {
    type: "warning",
    title: "Prompt Injection Detected",
    time: "5 min ago",
  },
  {
    type: "success",
    title: "DPDP Compliance Updated",
    time: "18 min ago",
  },
  {
    type: "info",
    title: "Weekly Report Generated",
    time: "1 hour ago",
  },
];

function NotificationPanel() {
  return (
    <div className="notification-panel">

      <div className="notification-title">

        <h3>Notifications</h3>

        <button>Mark all read</button>

      </div>

      {notifications.map((item, index) => (

        <div className="notification-item" key={index}>

          <span className={`notification-dot ${item.type}`}></span>

          <div>

            <h4>{item.title}</h4>

            <p>{item.time}</p>

          </div>

        </div>

      ))}

    </div>
  );
}

export default NotificationPanel;