import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => (
  <footer style={{background:'#0d1630',borderTop:'1px solid rgba(249,115,22,0.15)',padding:'60px 40px 30px'}}>
    <div style={{maxWidth:'1200px',margin:'0 auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'40px',marginBottom:'40px'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
            <Bus color="#f97316" size={22}/>
            <span style={{fontFamily:'Syne',fontSize:'20px',fontWeight:800,color:'#f97316'}}>Bus<span style={{color:'#f1f5f9'}}>Go</span></span>
          </div>
          <p style={{color:'#94a3b8',fontSize:'14px',lineHeight:1.7,maxWidth:'260px'}}>India's most trusted bus booking platform. Safe, comfortable, and on-time travel across 500+ routes.</p>
          <div style={{display:'flex',gap:'10px',marginTop:'18px'}}>
            {[Facebook,Twitter,Instagram].map((Icon,i) => (
              <button key={i} style={{width:'34px',height:'34px',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.25)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <Icon size={15} color="#f97316"/>
              </button>
            ))}
          </div>
        </div>
        {[
          { title:'Quick Links', links:[['/', 'Home'],['/search','Search Buses'],['/track','Track Bus'],['/my-bookings','My Bookings']] },
          { title:'Support', links:[['#','Help Center'],['#','Cancellation Policy'],['#','Refund Policy'],['#','Contact Us']] },
          { title:'Company', links:[['#','About Us'],['#','Careers'],['#','Blog'],['#','Partners']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 style={{fontFamily:'Syne',fontSize:'14px',fontWeight:700,color:'#f1f5f9',marginBottom:'14px'}}>{title}</h4>
            {links.map(([href,label]) => (
              <Link key={label} to={href} style={{display:'block',color:'#94a3b8',fontSize:'14px',marginBottom:'9px',transition:'color .2s'}}
                onMouseOver={e=>e.target.style.color='#f97316'} onMouseOut={e=>e.target.style.color='#94a3b8'}>{label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div style={{borderTop:'1px solid rgba(148,163,184,0.1)',paddingTop:'22px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
        <p style={{color:'#64748b',fontSize:'13px'}}>© 2025 BusGo. All rights reserved.</p>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {['📞 1800-BUS-GO','✉ support@busgo.com'].map(c=>(
            <span key={c} style={{color:'#94a3b8',fontSize:'12px',padding:'4px 12px',background:'rgba(30,45,80,0.6)',borderRadius:'20px'}}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
export default Footer;