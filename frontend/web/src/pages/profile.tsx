import React from 'react';
import Header from '../components/Header';

export default function Profile(){
  return (
    <div>
      <Header />
      <div style={{maxWidth:900,margin:'72px auto 0',padding:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:96,height:96,borderRadius:48,background:'#eee'}} />
          <div>
            <div style={{fontWeight:700}}>Ahmed_StudentLeader</div>
            <div style={{color:'#666'}}>Étudiant · Président du club tech</div>
          </div>
        </div>
      </div>
    </div>
  );
}