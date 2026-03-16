// FSH Empire — Config: Supabase, global state, boot
const SUPABASE_URL='https://obliysgyuizoyxkevqxv.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGl5c2d5dWl6b3l4a2V2cXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzkzMjQsImV4cCI6MjA4OTI1NTMyNH0.x5G8rtTC8xisZAcQ7d251kYbATp8ihBARd02Mb_4Vyo';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let derivWS=null,derivToken='',allTrades=[],selectedEmotion='',currentUser=null;

document.addEventListener('DOMContentLoaded',async()=>{
  startClock();

  // Handle email confirmation redirect (token in URL hash or query)
  const hash = window.location.hash;
  const query = window.location.search;
  if(hash.includes('access_token') || query.includes('access_token') || hash.includes('type=signup') || query.includes('type=signup')){
    const { data, error } = await sb.auth.getSession();
    if(data?.session){
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      onLogin(data.session.user);
      showToast('✅ Email confirmed! Welcome to FSH Empire!');
      return;
    }
  }

  const{data:{session}}=await sb.auth.getSession();
  if(session)onLogin(session.user);
  sb.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_IN')onLogin(session.user);
    if(event==='SIGNED_OUT')onLogout();
  });
});

document.addEventListener('DOMContentLoaded',async()=>{
  startClock();

  // Handle email confirmation redirect (token in URL hash or query)
  const hash = window.location.hash;
  const query = window.location.search;
  if(hash.includes('access_token') || query.includes('access_token') || hash.includes('type=signup') || query.includes('type=signup')){
    const { data, error } = await sb.auth.getSession();
    if(data?.session){
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      onLogin(data.session.user);
      showToast('✅ Email confirmed! Welcome to FSH Empire!');
      return;
    }
  }

  const{data:{session}}=await sb.auth.getSession();
  if(session)onLogin(session.user);
  sb.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_IN')onLogin(session.user);
    if(event==='SIGNED_OUT')onLogout();
  });
});
