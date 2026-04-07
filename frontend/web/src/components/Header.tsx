import React from 'react';

export default function Header(){
  return (<header style={{position:'fixed',top:0,left:0,right:0,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',background:'#fff',boxShadow:'0 1px 8px rgba(0,0,0,0.06)',zIndex:50}}>
    <div style={{fontWeight:700,color:'#2B8AEB'}}>AFROZA CAMPUS</div>
    <div style={{display:'flex',gap:12}}>
      <button>🔔</button>
      <button>✈️</button>
    </div>
  </header>);
}