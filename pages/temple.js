import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/lib/supabaseClient';

export default function TempleDashboard() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [temple, setTemple] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Anonymous async to handle await in useEffect
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      // Get profile for this user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email, temple_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        setError("Profile not found for this user.");
        setLoading(false);
        return;
      }
      if (profile.role !== 'temple') {
        router.replace('/');
        return;
      }
      setAllowed(true);
      setProfile(profile);

      // Query for the linked temple info
      const { data: templeData, error: templeError } = await supabase
        .from('temples')
        .select('name, address, unique_id, donation_pct, donation_points, is_historic')
        .eq('unique_id', profile.temple_id)
        .single();

      if (templeError || !templeData) {
        setError("Temple record not found or not linked. Contact admin.");
      } else {
        setTemple(templeData);
      }
      setLoading(false);
    })();
  }, [router]);

  function ProgressBar({ value }) {
    return (
      <div style={{ background: "#e7e7ee", borderRadius: 9, overflow: "hidden", height: 18 }}>
        <div
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            height: 18,
            background: "linear-gradient(90deg,#06d6a0,#118ab2)",
            borderRadius: 9,
            transition: "width 0.7s cubic-bezier(.62,.5,.4,1.2)",
            textAlign: "right",
            color: "white",
            fontWeight: "bold",
            fontSize: 14,
            lineHeight: '18px',
            paddingRight: 8
          }}>{value}%</div>
      </div>
    );
  }

  if (loading) return <div style={{fontFamily:'Poppins, sans-serif',textAlign:'center',padding:60}}>Loading...</div>;
  if (error) return <div style={{color:'#d90429',fontWeight:600,fontFamily:'Poppins, sans-serif',padding:60}}>{error}</div>;

  return allowed && temple ? (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(123deg,#caf0f8,#a0c4ff,#ffd6e0 99%)"
    }}>
      <div style={{
        padding: 34, borderRadius: 30, background: "#fffefe", boxShadow: "0 4px 48px #64dfdf30",
        minWidth: 370, width: "100%", maxWidth: 440
      }}>
        <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 25, color: "#197278", letterSpacing: 2 }}>
              {temple.name}
              {temple.is_historic &&
                <span title="Historic Temple" style={{marginLeft:6, color:"#ef476f", fontSize:22}}>&#94;<sup>H</sup></span>
              }
              <span style={{ fontSize: 17, color: "#888", marginLeft: 10}}>#{temple.unique_id}</span>
            </div>
            <div style={{ color: "#575757", fontWeight: 500 }}>
              {temple.address}
            </div>
          </div>
          <div style={{
            borderRadius:12,padding:"5px 13px", background:"#90e0ef",color:"#151556",fontWeight: 700,
            fontSize: 16, marginLeft: 12,boxShadow:"0 1px 8px #00b4d833"
          }}>
            {temple.unique_id ? `^${String(temple.unique_id).padStart(2, '0')}` : ""}
          </div>
        </div>

        <hr style={{margin:"18px 0 14px 0",border:"none",borderTop:"2px solid #b5ffe140"}} />

        <div style={{fontWeight: 700, color:"#197278", fontSize: 18, marginBottom: 10}}>
          Good Waste Donation Progress
        </div>
        <ProgressBar value={temple.donation_pct ?? 0}/>
        <div style={{
          fontSize: 13, color: "#118ab2", margin: 2, marginBottom: 18,
          marginTop: 4, textAlign:"right"
        }}>{temple.donation_pct ?? 0}% for this month</div>

        <div style={{
          fontWeight: 700, color: "#197278", fontSize: 18, marginBottom: 10, marginTop: 16
        }}>
          Points Earned <span title="Earn points by maintaining clean, hygienic bins and donating more good waste">ℹ️</span>
        </div>
        <div style={{
          fontSize: 28, fontWeight: 800, color:"#06d6a0",marginBottom: 15
        }}>{temple.donation_points ?? 0} pts</div>
        <div style={{
          background:"#e3fafc",
          borderRadius: 7, padding: "11px 13px", color: "#20609e", fontSize: 16, fontWeight: 500
        }}>
          Maintain clean and hygienic bins, and donate more good waste to earn more points and help the environment!
        </div>
        <div style={{fontSize:13, color:"#bbb",marginTop:11, textAlign:"right"}}>
          * Points and donation progress are view-only for temple users
        </div>
      </div>
    </div>
  ) : null;
}
