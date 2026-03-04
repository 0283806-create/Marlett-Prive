// Importar cliente de Supabase configurado con variables de entorno
import { supabase } from './lib/supabaseClient.js';

/**
 * ESTRUCTURA DE LA TABLA EN SUPABASE
 * 
 * Tabla: reservas_marlett
 * 
 * Campos requeridos:
 * - id: uuid (primary key, default: uuid_generate_v4())
 * - created_at: timestamp with time zone (default: now())
 * - nombre_completo: text (obligatorio)
 * - telefono_whatsapp: text (obligatorio)
 * - correo: text (opcional)
 * - area_preferida: text (opcional)
 * - tipo_evento: text (opcional)
 * - fecha_evento: date (obligatorio)
 * - hora_inicio: text (opcional)
 * - cantidad_invitados: integer (opcional)
 * - usa_visuales: text (opcional: "Sí", "No", "No estoy seguro")
 * - paquetes_foto_video: text (opcional: "Sí", "No", "Tal vez")
 * - notas_adicionales: text (opcional)
 * 
 * IMPORTANTE: Esta tabla debe crearse en Supabase antes de usar el formulario.
 * Puedes crear la tabla desde el SQL Editor en Supabase Dashboard.
 */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function refreshChips(){
  $$(".chip").forEach(c=>{
    const i=c.querySelector("input");
    c.dataset.checked = i.checked?"true":"false";
    c.onclick=()=>{
      if(i.type==="checkbox"){ i.checked=!i.checked; c.dataset.checked=i.checked?"true":"false"; }
      else { i.checked=true; $$(`input[name="${i.name}"]`).forEach(r=>r.closest(".chip").dataset.checked=r.checked?"true":"false"); }
      toggleConditional();
    };
  });
}

function toggleConditional(){
  const fd = new FormData($("#resForm"));
  const needsAV = fd.get("needs_av")||"";
  $("#avDetailsWrap").style.display = (needsAV==="Sí"||needsAV==="No estoy seguro") ? "block":"none";
  const media = fd.get("media_interest")||"";
  $("#mediaDetailsWrap").style.display = (media==="Sí"||media==="Tal vez") ? "block":"none";
}

function setMinDate(){
  const d=new Date(); d.setDate(d.getDate()+1); $("#date").min=d.toISOString().slice(0,10);
}

function validateField(field){
  const value = field.value.trim();
  const type = field.type || field.tagName.toLowerCase();
  const id = field.id;
  
  let isValid = false;
  
  if(id === "name"){
    isValid = value.length >= 2;
  }else if(id === "phone"){
    const digits = value.replace(/\D/g,"");
    isValid = digits.length >= 8;
  }else if(id === "email"){
    isValid = value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }else if(id === "date"){
    isValid = value !== "";
  }else if(id === "time"){
    isValid = value !== "";
  }else if(id === "guests"){
    const num = Number(value);
    isValid = num >= 1 && num <= 1000;
  }else if(id === "eventType"){
    isValid = value !== "";
  }
  
  if(isValid && value !== ""){
    field.classList.add("valid");
  }else{
    field.classList.remove("valid");
  }
}

function validate(){
  const name=$("#name").value.trim(), phone=$("#phone").value.trim();
  const digits=phone.replace(/\D/g,""); const guests=Number($("#guests").value);
  const needsAV = ($("#resForm").querySelector('input[name="needs_av"]')?.value || "").trim();
  const mediaInterest = ($("#resForm").querySelector('input[name="media_interest"]')?.value || "").trim();
  return (
    name.length>=2 &&
    digits.length>=8 &&
    guests>=1 &&
    $("#eventType").value &&
    $("#date").value &&
    $("#time").value &&
    needsAV &&
    mediaInterest &&
    $("#consent").checked
  );
}

function showPreview(){
  const fd=new FormData($("#resForm")); const items=[]; fd.forEach((v,k)=>{if(k==="av_items")items.push(v);});
  const avItems=items.length?items.join(", "):"—";
  const data={
    nombre: fd.get("name")||"—", telefono: fd.get("phone")||"—", correo: fd.get("email")||"—",
    fecha: fd.get("date")||"—", hora: fd.get("time")||"—", invitados: fd.get("guests")||"—",
    tipo: fd.get("event_type")||"—", area: fd.get("venue_area")||"—",
    av: fd.get("needs_av")||"—", av_items: avItems, av_notas: fd.get("av_notes")||"—",
    media: fd.get("media_interest")||"—", media_notas: fd.get("media_notes")||"—",
    notas: fd.get("notes")||"—"
  };
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  $("#preview").innerHTML = `
    <strong>Vista previa — Marlett</strong><br><br>
    <div style="display:grid;grid-template-columns:170px 1fr;gap:6px 12px">
      <div>Nombre</div><div>${esc(data.nombre)}</div>
      <div>Teléfono</div><div>${esc(data.telefono)}</div>
      <div>Correo</div><div>${esc(data.correo)}</div>
      <div>Fecha</div><div>${esc(data.fecha)}</div>
      <div>Hora</div><div>${esc(data.hora)}</div>
      <div>Invitados</div><div>${esc(String(data.invitados))}</div>
      <div>Tipo de evento</div><div>${esc(data.tipo)}</div>
      <div>Área</div><div>${esc(data.area)}</div>
      <div>A/V</div><div>${esc(data.av)}</div>
      <div>Elementos A/V</div><div>${esc(data.av_items)}</div>
      <div>Notas A/V</div><div>${esc(data.av_notas)}</div>
      <div>Foto/Video</div><div>${esc(data.media)}</div>
      <div>Notas media</div><div>${esc(data.media_notas)}</div>
      <div>Notas</div><div>${esc(data.notas)}</div>
    </div>`;
  $("#preview").style.display="block";
}

function getWhatsAppNumber(){
  const fromGlobal = (window.MARLETT_WAPP || "").replace(/\D/g,"");
  if(fromGlobal) return fromGlobal;
  const form = document.getElementById("resForm");
  return (form?.dataset?.whatsapp || "").replace(/\D/g,"");
}

function buildWhatsAppText(fd){
  const items=[]; fd.forEach((v,k)=>{if(k==="av_items")items.push(v);});
  const avItems=items.length?items.join(", "):"—";
  const m={
    nombre:fd.get("name")||"—", telefono:fd.get("phone")||"—", correo:fd.get("email")||"—",
    fecha:fd.get("date")||"—", hora:fd.get("time")||"—", invitados:fd.get("guests")||"—",
    tipo:fd.get("event_type")||"—", area:fd.get("venue_area")||"—", av:fd.get("needs_av")||"—",
    av_items:avItems, av_notas:fd.get("av_notes")||"—", media:fd.get("media_interest")||"—",
    media_notas:fd.get("media_notes")||"—", notas:fd.get("notes")||"—"
  };
  return [
    "¡Hola, Marlett! Quiero confirmar mi evento:",
    `• Nombre: ${m.nombre}`,
    `• Teléfono: ${m.telefono}`,
    m.correo!=="—"?`• Correo: ${m.correo}`:null,
    `• Fecha: ${m.fecha}  • Hora: ${m.hora}`,
    `• Invitados: ${m.invitados}`,
    `• Tipo de evento: ${m.tipo}`,
    m.area!=="—"?`• Área: ${m.area}`:null,
    `• A/V: ${m.av}`,
    m.av_items!=="—"?`• Elementos A/V: ${m.av_items}`:null,
    m.av_notas!=="—"?`• Notas A/V: ${m.av_notas}`:null,
    `• Foto/Video: ${m.media}`,
    m.media_notas!=="—"?`• Notas media: ${m.media_notas}`:null,
    m.notas!=="—"?`• Comentarios: ${m.notas}`:null
  ].filter(Boolean).join("\n");
}

function openWhatsAppWithText(numberDigitsOnly,text){
  if(!numberDigitsOnly){ alert("No hay un número de WhatsApp configurado para Marlett."); return; }
  const url=`https://wa.me/${numberDigitsOnly}?text=${encodeURIComponent(text)}`;
  const win = window.open(url,"_blank","noopener,noreferrer");
  if(!win){
    window.location.href = url;
  }
}

// Handle form submission with Supabase
$("#resForm").addEventListener("submit", async e=>{
  e.preventDefault();
  
  if(!validate()){ alert("Completa los campos obligatorios y acepta el consentimiento."); return; }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const fd = new FormData(form);
  
  const avItems = [];
  fd.forEach((v,k)=>{ if(k==="av_items") avItems.push(v); });

  // Mapear campos del formulario a la estructura de reservas_marlett
  // NOTA: created_at se genera automáticamente por Supabase (default: now())
  // No es necesario incluirlo en reservationData
  const reservationData = {
    nombre_completo: fd.get("name"),
    telefono_whatsapp: fd.get("phone"),
    correo: fd.get("email") || null,
    area_preferida: fd.get("venue_area") || null,
    tipo_evento: fd.get("event_type"),
    fecha_evento: fd.get("date"),
    hora_inicio: fd.get("time"),
    cantidad_invitados: parseInt(fd.get("guests")) || null,
    usa_visuales: fd.get("needs_av") || null,
    paquetes_foto_video: fd.get("media_interest") || null,
    notas_adicionales: fd.get("notes") || null
    // created_at se genera automáticamente en Supabase
  };

  form.classList.add('loading');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    // Insertar reserva en Supabase
    // created_at se genera automáticamente por la base de datos (default: now())
    const { data, error } = await supabase
      .from('reservas_marlett')
      .insert([reservationData])
      .select()
      .single();

    if (error) throw error;

    // EJEMPLO: Para consultar reservas ordenadas por created_at (más recientes primero):
    // const { data: reservas, error } = await supabase
    //   .from('reservas_marlett')
    //   .select('*')
    //   .order('created_at', { ascending: false });

    // Mostrar mensaje de éxito
    const successMsg = $("#success");
    successMsg.textContent = "✅ Tu solicitud fue enviada correctamente. Te contactaremos por WhatsApp.";
    successMsg.style.display = "block";
    successMsg.style.background = "";
    successMsg.style.borderColor = "";
    successMsg.style.color = "";
    
    showPreview(); 
    window.scrollTo({top:0,behavior:"smooth"});

    form.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar solicitud';
    
    // Limpiar formulario después de éxito
    setTimeout(() => {
      form.reset();
      refreshChips();
      toggleConditional();
      $("#success").style.display = "none";
      $("#preview").style.display = "none";
    }, 10000);

    // Open WhatsApp
    const text=buildWhatsAppText(fd);
    openWhatsAppWithText(getWhatsAppNumber(), text);

  } catch (error) {
    console.error('Error submitting form:', error);
    const errorMsg = $("#success");
    errorMsg.textContent = "❌ Hubo un problema al guardar tu solicitud. Intenta de nuevo.";
    errorMsg.style.display = "block";
    errorMsg.style.background = "#1a0f0f";
    errorMsg.style.borderColor = "rgba(255,100,100,0.4)";
    errorMsg.style.color = "#ffb4b4";
    form.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar solicitud';
    setTimeout(() => {
      errorMsg.style.display = "none";
    }, 8000);
  }
});

// Función para exportar reservas a CSV
async function exportarReservasCSV() {
  try {
    const { data, error } = await supabase
      .from('reservas_marlett')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      alert('No hay reservas para exportar.');
      return;
    }

    // Función para escapar valores CSV
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Encabezados
    const headers = [
      'id',
      'created_at',
      'nombre_completo',
      'telefono_whatsapp',
      'correo',
      'area_preferida',
      'tipo_evento',
      'fecha_evento',
      'hora_inicio',
      'cantidad_invitados',
      'usa_visuales',
      'paquetes_foto_video',
      'notas_adicionales'
    ];

    // Crear filas CSV
    const rows = data.map(row => 
      headers.map(header => escapeCSV(row[header])).join(',')
    );

    // Combinar encabezados y filas
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Nombre del archivo con fecha
    const fecha = new Date().toISOString().slice(0,19).replace(/:/g, '-');
    link.setAttribute('download', `reservas_marlett-${fecha}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Se exportaron ${data.length} reservas correctamente.`);
  } catch (error) {
    console.error('Error al exportar:', error);
    alert('❌ Hubo un error al exportar las reservas. Verifica la consola para más detalles.');
  }
}

$("#ctaWapp").addEventListener("click", ()=>{
  openWhatsAppWithText(getWhatsAppNumber(), "Hola Marlett, me interesa cotizar un evento.");
});

$("#navbarWapp").addEventListener("click", ()=>{
  openWhatsAppWithText(getWhatsAppNumber(), "Hola Marlett, quiero cotizar un evento especial.");
});

$("#previewBtn").addEventListener("click", showPreview);

document.addEventListener("input",e=>{
  if(e.target.matches('.chip input')) refreshChips();
  if(e.target.id==="phone"){ e.target.value=e.target.value.replace(/[^\d+]/g,"").replace(/\s+/g,""); }
  if(e.target.name==="needs_av"||e.target.name==="media_interest"){ refreshChips(); toggleConditional(); }
  
  // Validación en tiempo real
  if(e.target.matches('.fld')) validateField(e.target);
});

document.addEventListener("blur",e=>{
  // Validar al salir del campo
  if(e.target.matches('.fld')) validateField(e.target);
}, true);

document.addEventListener("change",e=>{
  // Validar cuando cambian valores (select, date, etc.)
  if(e.target.matches('.fld')) validateField(e.target);
});

(function initChoiceGroups(){
  const groups = document.querySelectorAll(".choice-group");
  if(!groups.length) return;

  groups.forEach(group=>{
    const hidden = group.parentElement.querySelector('input[type="hidden"]');
    const setActive = value=>{
      group.querySelectorAll(".choice-btn").forEach(b=>b.classList.remove("is-active"));
      if(!value) return;
      const btn = Array.from(group.querySelectorAll(".choice-btn")).find(el=>{
        const data = (el.dataset.value || "").trim();
        const text = el.textContent.trim();
        return data === value || text === value;
      });
      if(btn) btn.classList.add("is-active");
    };
    const normalize = btn => (btn?.dataset?.value || btn?.textContent || "").trim();
    const applyValue = value=>{
      if(!hidden) return;
      hidden.value = value;
      setActive(value);
      if(hidden.name==="needs_av"||hidden.name==="media_interest"){
        toggleConditional();
      }
    };

    const initial = (hidden?.value || "").trim();
    if(initial){
      applyValue(initial);
    }else if(hidden){
      hidden.value = "";
      setActive("");
      if(hidden.name==="needs_av"||hidden.name==="media_interest"){
        toggleConditional();
      }
    }

    group.addEventListener("click", e=>{
      const btn = e.target.closest(".choice-btn");
      if(!btn) return;
      applyValue(normalize(btn));
    });
  });
})();

(function init(){ 
  const d=new Date(); d.setDate(d.getDate()+1); 
  $("#date").min=d.toISOString().slice(0,10); 
  refreshChips(); 
  toggleConditional(); 
  document.querySelectorAll('.choice-group').forEach(group=>{
    const hidden = group.parentElement.querySelector('input[type="hidden"]');
    if(hidden && group.querySelector('.choice-btn.is-active')){
      hidden.value = group.querySelector('.choice-btn.is-active').dataset.value || group.querySelector('.choice-btn.is-active').textContent.trim();
    }
  });
})();

// Theme switcher
(function themeInit(){
  const KEY="marlett-theme";
  const saved = localStorage.getItem(KEY);
  if(saved) document.body.className = saved;

  document.querySelectorAll('#themePicker .tbtn').forEach(btn=>{
    btn.style.cssText = "border:1px solid var(--border);padding:6px 10px;border-radius:10px;background:var(--panel);color:var(--text);cursor:pointer;font-size:12px";
    btn.addEventListener('click', ()=>{
      const t = btn.dataset.theme;
      document.body.className = t;
      localStorage.setItem(KEY, t);
      applyPhrase();
    });
  });

  const phrases = {
    "theme-altos": ""Celebra tus momentos que importan."",
    "theme-marfil": ""Elegancia clara para tu gran día."",
    "theme-dorado": ""Noches doradas, recuerdos inolvidables."",
    "theme-terracota": ""Calidez auténtica en cada detalle.""
  };

  function applyPhrase(){
    const cls = document.body.className || "theme-altos";
    const el = document.querySelector(".hero .desc strong");
    if(el && phrases[cls]) el.textContent = phrases[cls];
  }

  applyPhrase();
  window.addEventListener("storage", applyPhrase);
})();
