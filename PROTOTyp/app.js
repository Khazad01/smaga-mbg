
// Simple client-side app (no backend). Demo credentials included.
// Users: admin / admin123 and ketua_{class} accounts as described in README.
const USERS = {
  "admin": { role: "admin", pw: "admin123", name: "Administrator" }
};
const CLASS_NAMES = [];
["X","XI","XII"].forEach(level => {
  for(let i=1;i<=10;i++){
    const cls = `${level}-${i}`;
    CLASS_NAMES.push(cls);
    USERS[`ketua_${cls}`] = { role: "ketua", pw: `ketua_${i}pass`, name: `Ketua ${cls}`, class: cls };
  }
});

document.getElementById('demo')?.addEventListener('click', ()=>{
  document.getElementById('username').value = 'admin';
  document.getElementById('pin').value = 'admin123';
});

document.getElementById('loginForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('pin').value.trim();
  if(!USERS[u] || USERS[u].pw !== p){ alert('Username / PIN salah'); return; }
  // store session and redirect to dashboard
  sessionStorage.setItem('mbg_user', JSON.stringify(Object.assign({ username: u }, USERS[u])));
  window.location = 'dashboard.html';
});

// Carousel simple
let idx = 0;
const slides = document.querySelectorAll('.slides img');
function show(i){
  const container = document.getElementById('slides');
  const w = container.clientWidth;
  container.style.transform = `translateX(${-i * w}px)`;
}
window.addEventListener('resize', ()=> show(idx));
document.getElementById('prev')?.addEventListener('click', ()=>{ idx = (idx-1+slides.length)%slides.length; show(idx); });
document.getElementById('next')?.addEventListener('click', ()=>{ idx = (idx+1)%slides.length; show(idx); });
document.getElementById('goDash')?.addEventListener('click', ()=>{ window.location='dashboard.html'; });

// initial auto rotate
setInterval(()=>{ idx = (idx+1)%slides.length; show(idx); }, 4500);
