
// Dashboard script - client-side localStorage
const session = JSON.parse(sessionStorage.getItem('mbg_user') || 'null');
if(!session){ alert('Silakan login terlebih dahulu'); window.location='index.html'; }
document.getElementById('name').innerText = session.name || session.username;
document.getElementById('role').innerText = session.role;
document.getElementById('userInfo').innerText = (session.name || session.username);
document.getElementById('avatarInitial').innerText = (session.name||session.username).split(' ').map(s=>s[0]).slice(0,2).join('');

document.getElementById('logout').addEventListener('click', ()=>{ sessionStorage.removeItem('mbg_user'); window.location='index.html'; });

// build class list same as app.js
const CLASS_LIST = (function(){ var arr=[]; ['X','XI','XII'].forEach(function(l){ for(var i=1;i<=10;i++){ arr.push(l+'-'+i); } }); return arr; })();
const classSelect = document.getElementById('classSelect');
CLASS_LIST.forEach(function(c){ var o=document.createElement('option'); o.value=c; o.text=c; classSelect.appendChild(o); });

// date default today
const attDate = document.getElementById('attDate');

// Format Indonesia (dd-mm-yyyy)
function formatIndo(dateString){
  const d = new Date(dateString);
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// SET tanggal otomatis (hari ini)
attDate.value = new Date().toISOString().split('T')[0];

// update label-tanggal
document.getElementById('todayLabel').innerText = formatIndo(attDate.value);

// Saat user mengubah tanggal → update ONLY & load existing data
attDate.addEventListener('change', function(){
  document.getElementById('todayLabel').innerText = formatIndo(attDate.value);
  markExisting(classSelect.value, attDate.value);

  // KPI & report ikut update
  renderKPI();
  renderReport();
});

// fungsi format dd-mm-yyyy
function formatIndo(dateString){
  const d = new Date(dateString);
  let day = String(d.getDate()).padStart(2, '0');
  let month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// set default hari ini
attDate.value = new Date().toISOString().split('T')[0];
document.getElementById('todayLabel').innerText = formatIndo(attDate.value);

// ubah label otomatis ketika tanggal diganti
attDate.addEventListener('change', () => {
  document.getElementById('todayLabel').innerText = formatIndo(attDate.value);
});


// render 1..36 grid (sorted)
const gridBox = document.getElementById('gridBox');
function renderGrid(cls){
  gridBox.innerHTML = '';
  for(var i=1;i<=36;i++){
    (function(i){
  var label = document.createElement('label');
  label.style.display = 'inline-flex';
  label.style.alignItems = 'center';
  label.style.justifyContent = 'center';
  label.style.margin = '6px';
  label.style.width = '56px';
  label.style.height = '44px';
  label.style.borderRadius = '8px';
  label.style.cursor = 'pointer';
  label.style.border = '1px solid #ccc';
  label.style.userSelect = 'none';

  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.display = 'none'; // disembunyikan

  var text = document.createElement('span');
  text.innerText = i;

  checkbox.addEventListener('change', function(){
    // ubah tampilan
    if (checkbox.checked){
      label.style.background = 'var(--blue)';
      label.style.color = 'white';
    } else {
      label.style.background = '';
      label.style.color = '';
    }

    // panggil fungsi membaca hasil
    updateSelectedNumbers();
  });

  label.appendChild(checkbox);
  label.appendChild(text);
  label.dataset.no = i;

  gridBox.appendChild(label);
})(i);

  }
  // mark existing if record exists for class+date
  markExisting(cls, attDate.value);
}


function markExisting(cls, date){
  var store = JSON.parse(localStorage.getItem('mbg_attendance_v1')||'{"records":[]}');
  var rec = store.records.find(function(r){ return r.class===cls && r.date===date; });
  if(rec){

    
    // clear then set checked for those numbers
    Array.from(gridBox.children).forEach(function(label){
  let checkbox = label.querySelector("input[type='checkbox']");
  checkbox.checked = false;
  label.style.background='';
  label.style.color='';
});

    rec.present.forEach(function(n){
  var label = Array.from(gridBox.children).find(x => x.dataset.no == n);
  if(label){
    let checkbox = label.querySelector("input[type='checkbox']");
    checkbox.checked = true;
    label.style.background = 'var(--blue)';
    label.style.color = 'white';
  }
});

  } else {
    Array.from(gridBox.children).forEach(function(label){
  let checkbox = label.querySelector("input[type='checkbox']");
  checkbox.checked = false;
  label.style.background='';
  label.style.color='';
});

  }
}

// save handler - consolidate into one record per class+date
document.getElementById('saveAbs').addEventListener('click', function(){
  var cls = classSelect.value;
  var date = attDate.value;
  var checked = Array.from(gridBox.children)
  .filter(label => label.querySelector("input[type='checkbox']").checked)
  .map(label => parseInt(label.dataset.no,10));

  var unique = Array.from(new Set(checked)).sort(function(a,b){ return a-b; });
  if(unique.some(function(n){ return n<1 || n>36; })) return alert('Nomor absen harus 1..36');
  var store = JSON.parse(localStorage.getItem('mbg_attendance_v1')||'{"records":[]}');
  // remove existing for class+date then add consolidated
  store.records = store.records.filter(function(r){ return !(r.class===cls && r.date===date); });
  store.records.push({ class: cls, date: date, present: unique });
  localStorage.setItem('mbg_attendance_v1', JSON.stringify(store));
  alert('Tersimpan: ' + unique.length + ' siswa.');
  renderKPI(); renderReport();
});

document.getElementById('clearAbs').addEventListener('click', function(){ renderGrid(classSelect.value); });

classSelect.addEventListener('change', function(){ renderGrid(classSelect.value); });

// initial render
renderGrid(classSelect.value);

// KPI and report
function renderKPI(){
  var wrap = document.getElementById('kpi');
  wrap.innerHTML='';
  var store = JSON.parse(localStorage.getItem('mbg_attendance_v1')||'{"records":[]}');
  CLASS_LIST.forEach(function(c, idx){
    var rec = store.records.find(function(r){ return r.class===c && r.date===attDate.value; });
    var cnt = rec ? rec.present.length : 0;
    var card = document.createElement('div');
    card.style.background='linear-gradient(90deg,#f6fbff,white)';
    card.style.padding='12px';
    card.style.borderRadius='10px';
    card.innerHTML = '<strong>' + c + '</strong><div style="color:var(--muted);font-size:13px">' + cnt + ' / 36 hadir</div>';
    wrap.appendChild(card);
  });
}

function renderReport(){
  var tbody = document.querySelector('#reportTable tbody');
  tbody.innerHTML='';
  var store = JSON.parse(localStorage.getItem('mbg_attendance_v1')||'{"records":[]}');
  store.records.sort(function(a,b){ if(a.class<b.class) return -1; if(a.class>b.class) return 1; return a.date<b.date ? -1 : 1; });
  store.records.forEach(function(r){
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.class + '</td><td>' + r.date + '</td><td>' + r.present.length + '</td><td>36</td>';
    tbody.appendChild(tr);
  });
}

renderKPI(); renderReport();

// simple navigation
document.getElementById('btnDash').addEventListener('click', function(){ showView('dash'); });
document.getElementById('btnAbs').addEventListener('click', function(){ showView('abs'); });
document.getElementById('btnReport').addEventListener('click', function(){ showView('report'); });

function showView(v){
  document.getElementById('viewDash').style.display = v==='dash' ? 'block' : 'none';
  document.getElementById('viewAbs').style.display = v==='abs' ? 'block' : 'none';
  document.getElementById('viewReport').style.display = v==='report' ? 'block' : 'none';
}

const toggleBtn = document.getElementById('toggleTheme');

// Cek tema yang tersimpan di localStorage
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // Simpan mode ke localStorage
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});
