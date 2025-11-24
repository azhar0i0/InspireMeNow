import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./designs/Dashboard.css";
import { FaSmile, FaUsers, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  DEMO_USERS_BASIC as DEMI_USERS,
  DEMO_SESSIONS as DEMI_SESSIONS,
} from "./Parts/demoData";

const moodColors = ["#22c55e", "#f97316", "#3b82f6", "#a855f7", "#ef4444", "#14b8a6"];

const getLast7DaysKeys = () => {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
};

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  const [graphData, setGraphData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [weeklyUsers, setWeeklyUsers] = useState(0);
  const [mostCommonMood, setMostCommonMood] = useState("N/A");
  const [topMoods, setTopMoods] = useState([]);

  useEffect(() => {
    // ✅ Users data
    setTotalUsers(DEMI_USERS.length);

    const now = new Date();
    const weeklyActive = DEMI_USERS.filter(u => (now - u.lastSeen)/(1000*60*60*24) <= 7).length;
    setWeeklyUsers(weeklyActive);

    // ✅ Sessions & mood stats
    const perMoodSessions = { ...DEMI_SESSIONS };
    const last7Keys = getLast7DaysKeys();

    const moodTotals = Object.entries(perMoodSessions).map(([mood, arr]) => ({ name: mood, total: arr.length }));
    const sorted = moodTotals.sort((a,b)=>b.total - a.total);
    const top4 = sorted.slice(0,4);
    setTopMoods(top4);
    setMostCommonMood(top4.length ? top4[0].name : "N/A");

    // Graph data
    const graph = last7Keys.map(day=>{
      const entry = { date: day };
      top4.forEach(m=>{
        const cnt = (perMoodSessions[m.name] || []).reduce((acc,s)=>{
          const k = s.timestamp.toLocaleDateString("en-US", { month:"short", day:"numeric" });
          return acc + (k===day ? 1 : 0);
        },0);
        entry[m.name] = cnt;
      });
      return entry;
    });
    setGraphData(graph);

    // Recent activity
    let allActs = [];
    Object.entries(perMoodSessions).forEach(([mood, arr])=>{
      arr.forEach(s=>allActs.push({ userId: s.userId, mood, timestamp: s.timestamp }));
    });
    allActs.sort((a,b)=>b.timestamp - a.timestamp);
    setActivities(allActs.slice(0,5));
  }, []);

  // Handler functions for onClick
  const handleTotalUsersClick = () => {
    navigate("/dashboard/user-management"); // Navigate to user management page
  };

  const handleMostCommonMoodClick = () => {
    navigate("/dashboard/content-management"); // Navigate to content management page
  };

  return (
    <div className="d-flex">
      <div className="dashboard flex-grow-1">
        {/* Stats */}
        <div className="row g-4 mb-4 mt-2">
          <div className="col-md-3 col-6">
            <div className="stat-card d-flex align-items-center" onClick={handleTotalUsersClick}> {/* Add onClick handler */}
              <div><p>Total App Users</p><h3>{totalUsers}</h3></div>
              <div className="icon-box users"><FaUsers /></div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card d-flex align-items-center">
              <div><p>Active Users (Weekly)</p><h3>{weeklyUsers}</h3></div>
              <div className="icon-box active"><FaChartLine /></div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card d-flex align-items-center" onClick={handleMostCommonMoodClick}> {/* Add onClick handler */}
              <div><p>Most Common Mood</p><h3>{mostCommonMood}</h3></div>
              <div className="icon-box mood"><FaSmile /></div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card d-flex align-items-center">
              <div><p>Session Completion</p><h3>78%</h3></div>
              <div className="icon-box completion"><FaCheckCircle /></div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="graph-card mb-4">
          <h5 className="mb-3">Mood Frequency Trends (Last 7 days)</h5>
          <div style={{ width: "100%", height: "320px" }}>
            <ResponsiveContainer>
              <AreaChart data={graphData}>
                <defs>
                  {topMoods.map((m, idx)=>(
                    <linearGradient key={m.name} id={m.name} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={moodColors[idx% moodColors.length]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={moodColors[idx% moodColors.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor:"#1e293b", border:"none" }} />
                {topMoods.map((m, idx)=>(
                  <Area key={m.name} type="monotone" dataKey={m.name} stroke={moodColors[idx% moodColors.length]} fill={`url(#${m.name})`} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend mt-2">
            {topMoods.map((m, idx)=>(
              <span key={m.name} className="me-3">
                <span className="dot" style={{backgroundColor: moodColors[idx% moodColors.length], display:"inline-block", width:10, height:10, borderRadius:8, marginRight:6}}/>
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="activity-header"><h5>Recent Activity</h5></div>
          <div className="table-responsive">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>Mood</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.length===0 ? (
                  <tr><td colSpan={4} className="text-center text-muted">No recent sessions.</td></tr>
                ) : activities.map((act, idx)=>(
                  <tr key={`${act.userId}-${idx}`}>
                    <td data-label="User ID">{act.userId}</td>
                    <td data-label="Action">Session Completed</td>
                    <td data-label="Mood" className={`mood ${act.mood.toLowerCase()}`}>● {act.mood}</td>
                    <td data-label="Timestamp">{new Date(act.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
