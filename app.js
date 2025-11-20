import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://svserlrkymykmabvjclh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2c2VybHJreW15a21hYnZqY2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTEyNTEsImV4cCI6MjA3MTkyNzI1MX0.x-XA9gLLWBi6vaWKQdnd055zErvWqx8H2w7mFmT4Mg8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function refreshChips(){
  $$(".chip").forEach(c=>{
    const input = c.querySelector("input");
    if(input.type==="radio"){
      c.dataset.checked = input.checked ? "true":"false";
    }else{
      c.dataset.checked = input.checked ? "true":"false";
    }
    c.onclick = ()=>{
      const i = c.querySelector("input");
      if(i.type==="checkbox"){
        i.checked = !i.checked; c.dataset.checked = i.checked?"true":"false";
      }else{
        i.checked = true;
        $$(`input[name="${i.name}"]`).forEach(r=>r.closest(".chip").dataset.checked = r.checked?"true":"false");
      }
      toggleConditional();
    };
  });
}

function toggleConditional(){
  const needsAV = (new FormData($("#resForm")).get("needs_av")) || "";
  $("#avDetailsWrap").style.display = (needsAV==="Sí"||needsAV==="No estoy seguro") ? "block" : "none";

  const media = (new FormData($("#resForm")).get("media_interest")) || "";
  $("#mediaDetailsWrap").style.display = (media==="Sí"||media==="Tal vez") ? "block" : "none";
}

function setMinDate(){
  const d = new Date();
  d.setDate(d.getDate()+1); // mínimo: mañana
  const iso = d.toISOString().slice(0,10);
  $("#date").min = iso;
}

function validate(form){
  const phone = $("#phone").value.trim();
  const name = $("#name").value.trim();
  const guests = Number($("#guests").value);
  let ok = true;

  if(!name || name.length<2) ok=false;
  const digits = phone.replace(/\D/g,"");
  if(digits.length<8) ok=false;
  if(!(guests>=1)) ok=false;

  return ok;
}

function showPreview(){
  const fd = new FormData($("#resForm"));
  const items = [];
  fd.forEach((v,k)=>{ if(k==="av_items") items.push(v); });

  const avItems = items.length ? items.join(", ") : "—";

  const data = {
    nombre: fd.get("name")||"—",
    telefono: fd.get("phone")||"—",
    correo: fd.get("email")||"—",
    fecha: fd.get("date")||"—",
    hora: fd.get("time")||"—",
    invitados: fd.get("guests")||"—",
    tipo: fd.get("event_type")||"—",
    area: fd.get("venue_area")||"—",
    av: fd.get("needs_av")||"—",
    av_items: avItems,
    av_notas: fd.get("av_notes")||"—",
    media: fd.get("media_interest")||"—",
    media_notas: fd.get("media_notes")||"—",
    notas: fd.get("notes")||"—"
  };

  const html = `
    <strong>Vista previa — Marlett</strong><br><br>
    <div style="display:grid;grid-template-columns:170px 1fr;gap:6px 12px">
      <div>Nombre</div><div>${esc(data.nombre)}</div>
      <div>Teléfono</div><div>${esc(data.telefono)}</div>
      <div>Correo</div><div>${esc(data.correo)}</div>
      <div>Fecha</div><div>${esc(data.fecha)}</div>
      <div>Hora</div><div>${esc(data.hora)}</div>
      <div>Invitados</div><div>${esc(String(data.invitados))}</div>
      <div>Tipo de evento</div><div>${esc(data.tipo)}</div>
      <div>Área preferida</div><div>${esc(data.area)}</div>
      <div>A/V</div><div>${esc(data.av)}</div>
      <div>Elementos A/V</div><div>${esc(data.av_items)}</div>
      <div>Notas A/V</div><div>${esc(data.av_notas)}</div>
      <div>Foto/Video</div><div>${esc(data.media)}</div>
      <div>Notas de media</div><div>${esc(data.media_notas)}</div>
      <div>Notas</div><div>${esc(data.notas)}</div>
    </div>
  `;
  const pv = $("#preview");
  pv.innerHTML = html;
  pv.style.display = "block";
}

function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// Handle form submission with Supabase
$("#resForm").addEventListener("submit", async e=>{
  e.preventDefault();
  
  if(!validate(e.target)){
    alert("Completa los campos obligatorios: Nombre, Teléfono, Fecha, Hora, Invitados, Tipo de evento, y selecciones de A/V y Foto/Video.");
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const fd = new FormData(form);
  
  // Get checkbox values
  const avItems = [];
  fd.forEach((v,k)=>{ if(k==="av_items") avItems.push(v); });

  // Prepare data for Supabase
  const reservationData = {
    name: fd.get("name"),
    phone: fd.get("phone"),
    email: fd.get("email") || null,
    date: fd.get("date"),
    time: fd.get("time"),
    guests: parseInt(fd.get("guests")),
    event_type: fd.get("event_type"),
    venue_area: fd.get("venue_area") || null,
    needs_av: fd.get("needs_av"),
    av_items: avItems.length ? avItems.join(", ") : null,
    av_notes: fd.get("av_notes") || null,
    media_interest: fd.get("media_interest"),
    media_notes: fd.get("media_notes") || null,
    notes: fd.get("notes") || null,
    created_at: new Date().toISOString(),
    status: 'upcoming'
  };

  // Add loading state
  form.classList.add('loading');
  submitBtn.disabled = true;

  try {
    // Insert into Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single();

    if (error) throw error;

    // Success!
    $("#success").style.display = "block";
    showPreview();
    form.reset();
    form.classList.remove('loading');
    submitBtn.disabled = false;
    
    window.scrollTo({top: document.body.scrollTop, behavior:"smooth"});
    
    // Hide success message after 10 seconds
    setTimeout(() => {
      $("#success").style.display = "none";
      $("#preview").style.display = "none";
    }, 10000);

  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo.');
    form.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

$("#previewBtn").addEventListener("click", showPreview);

document.addEventListener("input", (e)=>{
  if(e.target.matches('.chip input')) refreshChips();

  if(e.target.id==="phone"){
    const v = e.target.value.replace(/[^\d+]/g,"").replace(/\s+/g,"");
    e.target.value = v;
  }

  if(e.target.name==="needs_av" || e.target.name==="media_interest"){
    refreshChips();
    toggleConditional();
  }
});

// Initialize
setMinDate();
refreshChips();
toggleConditional();
