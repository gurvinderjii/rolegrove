"use client";

import { useState } from "react";

type PreviewTab = "Applications" | "Follow-ups" | "Insights";
const rows = [
  { company: "Linear", role: "Product Designer", status: "Interview", color: "violet" },
  { company: "Notion", role: "Frontend Engineer", status: "Applied", color: "ink" },
  { company: "Vercel", role: "Product Engineer", status: "Interview", color: "ink" },
];

export function HeroPreview() {
  const [tab, setTab] = useState<PreviewTab>("Applications");
  const [status, setStatus] = useState("Applied");
  return <div className="hero-art" aria-label="Interactive Rolegrove workspace preview">
    <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
    <div className="floating-note note-top"><span className="floating-note-icon">✦</span><span><b>Interview tomorrow</b><small>Linear · 10:30 AM</small></span></div>
    <div className="floating-note note-bottom"><span className="floating-check">✓</span><span><b>Follow-up sent</b><small>One small step forward</small></span></div>
    <div className="preview-window"><div className="preview-top"><div className="preview-dots"><i/><i/><i/></div><span>rolegrove / workspace</span><span>INTERACTIVE DEMO</span></div>
      <div className="preview-body"><aside className="preview-sidebar"><b><span className="preview-logo">r.</span> rolegrove</b><small>YOUR WORKSPACE</small>{(["Applications","Follow-ups","Insights"] as PreviewTab[]).map((item,i)=><button key={item} className={tab===item?"preview-active":""} aria-pressed={tab===item} onClick={()=>setTab(item)}><span>{["▦","◷","⌁"][i]}</span>{item}</button>)}<div className="preview-person"><i>SC</i><span>Sam Carter<small>Personal workspace</small></span></div></aside>
        <section className="preview-main" key={tab}><div className="preview-welcome"><small>YOUR SEARCH, IN GOOD ORDER</small><b>{tab==="Applications"?"Good morning, Sam":tab==="Follow-ups"?"One next step at a time":"Your search, at a glance"} <span>✳</span></b><span>{tab==="Applications"?"Here’s where things stand.":tab==="Follow-ups"?"The details you don’t want to miss.":"Small steps are adding up."}</span></div>
          <div className="preview-stats"><div><small>Applications</small><b>12 <i>↗</i></b></div><div><small>Interviews</small><b>4</b></div><div><small>Offers</small><b>1</b></div></div>
          {tab==="Applications"&&<><button className="preview-next preview-next-button" aria-label={`Change Notion's status from ${status}`} onClick={()=>setStatus(status==="Applied"?"Interview":"Applied")}><i>✦</i><span><small>TRY IT · CHANGE A STATUS</small><b>Notion · Frontend Engineer</b><small>Click to move this application</small></span><span className={`status ${status.toLowerCase()}`}><i/>{status}</span></button><div className="preview-table-head"><b>Recent applications</b><span>Search</span></div><div className="preview-table">{rows.map(row=><div className="preview-row" key={row.company}><span className={`company-logo ${row.color}`}>{row.company[0]}</span><span><b>{row.company}</b><small>{row.role}</small></span><span className={`status ${row.status.toLowerCase()}`}><i/>{row.status}</span></div>)}</div></>}
          {tab==="Follow-ups"&&<div className="preview-events"><article><span>OCT<br/><b>02</b></span><div><small>FRIDAY · 10:30 AM</small><b>Portfolio review</b><small>Linear · Product Designer</small></div><i>↗</i></article><article><span>OCT<br/><b>05</b></span><div><small>MONDAY · ALL DAY</small><b>Respond to offer</b><small>Arc · UI Engineer</small></div><i>↗</i></article></div>}
          {tab==="Insights"&&<div className="preview-chart"><div className="chart-head"><b>Applications by status</b><small>THIS MONTH</small></div>{[{name:"Applied",amount:"8",width:"72%",tone:"chart-applied"},{name:"Interview",amount:"3",width:"44%",tone:"chart-interview"},{name:"Offer",amount:"1",width:"21%",tone:"chart-offer"}].map(row=><div className="chart-row" key={row.name}><span>{row.name}</span><div><i className={row.tone} style={{width:row.width}}/></div><b>{row.amount}</b></div>)}<small className="chart-foot">You’ve shown up for 12 opportunities. Keep going.</small></div>}
        </section></div>
    </div>
  </div>;
}
