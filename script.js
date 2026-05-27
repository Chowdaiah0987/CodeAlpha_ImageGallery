/* MY GALLERY - script.js */

const defaultImages = [
  { id:1,  title:"Golden Retriever",    category:"animals",      src:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80" },
  { id:2,  title:"Snowy Owl",           category:"animals",      src:"https://images.unsplash.com/photo-1550159930-40066082a4fc?w=600&q=80" },
  { id:3,  title:"Red Fox",             category:"animals",      src:"https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80" },
  { id:4,  title:"Gentle Elephant",     category:"animals",      src:"https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=80" },
  { id:5,  title:"Zebra Portrait",      category:"animals",      src:"https://images.unsplash.com/photo-1624891680213-e1b0c2fc5344?w=600&q=80" },
  { id:6,  title:"Misty Forest",        category:"nature",       src:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80" },
  { id:7,  title:"Mountain Lake",       category:"nature",       src:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" },
  { id:8,  title:"Cherry Blossom",      category:"nature",       src:"https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80" },
  { id:9,  title:"Waterfall Veil",      category:"nature",       src:"https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=80" },
  { id:10, title:"Desert Dunes",        category:"nature",       src:"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80" },
  { id:11, title:"Ferrari 488",         category:"cars",         src:"https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80" },
  { id:12, title:"Lamborghini Huracan", category:"cars",         src:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80" },
  { id:13, title:"Porsche 911",         category:"cars",         src:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80" },
  { id:14, title:"Vintage Mustang",     category:"cars",         src:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80" },
  { id:15, title:"Night Drive",         category:"cars",         src:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80" },
  { id:16, title:"Milky Way",           category:"wallpapers",   src:"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80" },
  { id:17, title:"Aurora Borealis",     category:"wallpapers",   src:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80" },
  { id:18, title:"City at Night",       category:"wallpapers",   src:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" },
  { id:19, title:"Abstract Waves",      category:"wallpapers",   src:"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80" },
  { id:20, title:"Cosmic Storm",        category:"wallpapers",   src:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80" },
];

const CAT_ICONS = { all:"fa-border-all", animals:"fa-paw", nature:"fa-leaf", cars:"fa-car", wallpapers:"fa-image", travel:"fa-plane", food:"fa-utensils", sports:"fa-futbol", art:"fa-palette", architecture:"fa-building", people:"fa-user" };
function getCatIcon(c){ return CAT_ICONS[c]||"fa-tag"; }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

// STATE
let allImages      = [...defaultImages];
let filtered       = [...allImages];
let currentCat     = "all";
let lightboxIdx    = 0;
let isMasonry      = false;
let slideShowTimer = null;
let nextId         = 100;
let catQuery       = "";  // sidebar category search query
let currentUser    = null;

// STORAGE
function loadStorage(){
  const s = localStorage.getItem("gallery_images");
  if(s) allImages = [...defaultImages,...JSON.parse(s)];
  const u = localStorage.getItem("gallery_user");
  if(u) currentUser = JSON.parse(u);
}
function saveImages(){ localStorage.setItem("gallery_images", JSON.stringify(allImages.filter(i=>i.id>=100))); }
function getFavs()   { return JSON.parse(localStorage.getItem("gallery_favs")||"[]"); }
function getDls()    { return JSON.parse(localStorage.getItem("gallery_dls")||"[]"); }
function saveFavs(a) { localStorage.setItem("gallery_favs", JSON.stringify(a)); }
function saveDls(a)  { localStorage.setItem("gallery_dls",  JSON.stringify(a)); }
function getUploads(){ return allImages.filter(i=>i.id>=100).length; }

// ALL CATEGORIES
function getAllCats(){ return ["all",...[...new Set(allImages.map(i=>i.category))].sort()]; }

// REBUILD SIDEBAR CATEGORY LIST (searchable)
function rebuildSidebarCats(){
  const cats = getAllCats();
  const q = catQuery.toLowerCase();
  const visible = cats.filter(c => !q || c.includes(q) || cap(c).toLowerCase().includes(q));
  const el = document.getElementById("sidebarCats");
  if(visible.length === 0){
    el.innerHTML = `<p class="empty-msg">No categories found</p>`;
    return;
  }
  el.innerHTML = visible.map(cat=>`
    <button class="scat-btn ${cat===currentCat?"active":""}" data-cat="${cat}">
      <i class="fa-solid ${getCatIcon(cat)}"></i>
      <span>${cat==="all"?"All Photos":cap(cat)}</span>
      <span class="count-badge">${cat==="all"?allImages.length:allImages.filter(i=>i.category===cat).length}</span>
    </button>`).join("");
  el.querySelectorAll(".scat-btn").forEach(b=>b.addEventListener("click",()=>{setCategory(b.dataset.cat);closeSidebar();}));
}

// REBUILD UPLOAD SELECT
function rebuildUploadSelect(){
  const cats = getAllCats().filter(c=>c!=="all");
  const emojis={animals:"🐾",nature:"🌿",cars:"🚗",wallpapers:"🖼️",travel:"✈️",food:"🍕",sports:"⚽",art:"🎨",architecture:"🏛️",people:"👤"};
  const sel = document.getElementById("uploadCategory");
  const prev = sel.value;
  sel.innerHTML = cats.map(c=>`<option value="${c}">${emojis[c]||"🏷️"} ${cap(c)}</option>`).join("")
    + `<option value="__custom__">✏️ New category…</option>`;
  if([...sel.options].some(o=>o.value===prev)) sel.value=prev;
}

// DOM
const galleryGrid    = document.getElementById("galleryGrid");
const galleryTitle   = document.getElementById("galleryTitle");
const galleryCount   = document.getElementById("galleryCount");
const noResults      = document.getElementById("noResults");
const sidebar        = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const hamburgerBtn   = document.getElementById("hamburgerBtn");
const sidebarClose   = document.getElementById("sidebarClose");
const catSearchInput = document.getElementById("catSearchInput");
const catSearchClear = document.getElementById("catSearchClear");
const lightbox       = document.getElementById("lightbox");
const lbImg          = document.getElementById("lbImg");
const lbTitle        = document.getElementById("lbTitle");
const lbCategory     = document.getElementById("lbCategory");
const lbFavBtn       = document.getElementById("lbFavBtn");
const lbDownloadBtn  = document.getElementById("lbDownloadBtn");
const lbClose        = document.getElementById("lbClose");
const lbPrev         = document.getElementById("lbPrev");
const lbNext         = document.getElementById("lbNext");
const lbFullscreen   = document.getElementById("lbFullscreen");
const lightboxStrip  = document.getElementById("lightboxStrip");
const themeToggle    = document.getElementById("themeToggle");
const slideshowBtn   = document.getElementById("slideshowBtn");
const gridViewBtn    = document.getElementById("gridViewBtn");
const masonryViewBtn = document.getElementById("masonryViewBtn");
const favThumbsCont  = document.getElementById("favThumbsContainer");
const dlThumbsCont   = document.getElementById("dlThumbsContainer");
const favCount       = document.getElementById("favCount");
const dlCount        = document.getElementById("dlCount");
const uploadArea     = document.getElementById("uploadArea");
const fileInput      = document.getElementById("fileInput");
const uploadForm     = document.getElementById("uploadForm");
const uploadPreview  = document.getElementById("uploadPreview");
const uploadName     = document.getElementById("uploadName");
const uploadCategory = document.getElementById("uploadCategory");
const uploadCancel   = document.getElementById("uploadCancel");
const uploadAdd      = document.getElementById("uploadAdd");
const customCatInput = document.getElementById("customCategoryInput");
const lbBackdrop     = document.getElementById("lightboxBackdrop");
const loginBtn       = document.getElementById("loginBtn");
const loginModal     = document.getElementById("loginModal");
const modalClose     = document.getElementById("modalClose");
const moreCatsBtn    = document.getElementById("moreCatsBtn");

// RENDER GALLERY — show ALL images
function applyFilters(){
  filtered = allImages.filter(img => currentCat==="all" || img.category===currentCat);
}
function renderGallery(){
  applyFilters();
  galleryGrid.innerHTML="";
  const label = currentCat==="all"?"All Photos":cap(currentCat);
  galleryTitle.textContent = label;
  galleryCount.textContent = `${filtered.length} photo${filtered.length!==1?"s":""}`;
  if(filtered.length===0){ noResults.style.display="block"; return; }
  noResults.style.display="none";
  const favs = getFavs();
  filtered.forEach((img,idx)=>{
    const card = document.createElement("div");
    card.className="gallery-card";
    if(isMasonry) card.style.gridRowEnd=`span ${Math.floor(Math.random()*8)+18}`;
    card.innerHTML=`
      <div class="card-img-wrap"><img src="${img.src}" alt="${img.title}" loading="lazy"/></div>
      <div class="card-overlay">
        <div class="card-info">
          <span class="card-title">${img.title}</span>
          <span class="card-cat">${img.category}</span>
        </div>
        <div class="card-actions">
          <button class="card-action-btn fav-card-btn ${favs.includes(img.id)?"faved":""}" data-id="${img.id}" title="Favorite">
            <i class="${favs.includes(img.id)?"fa-solid":"fa-regular"} fa-heart"></i>
          </button>
          <button class="card-action-btn download-card-btn" data-id="${img.id}" title="Download">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>
      </div>`;
    card.addEventListener("click",e=>{ if(e.target.closest(".card-action-btn")) return; openLightbox(idx); });
    card.querySelector(".fav-card-btn").addEventListener("click",e=>{ e.stopPropagation(); toggleFavorite(img.id,e.currentTarget); });
    card.querySelector(".download-card-btn").addEventListener("click",e=>{ e.stopPropagation(); downloadImage(img); });
    galleryGrid.appendChild(card);
  });
  updateSidebarSections();
}

// CATEGORY
function setCategory(cat){
  currentCat=cat;
  // Update header pills
  document.querySelectorAll(".cat-btn:not(.more-cats-btn)").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat));
  // If selected cat is not one of the header pills, highlight "More" button
  const headerCats = [...document.querySelectorAll(".cat-btn:not(.more-cats-btn)")].map(b=>b.dataset.cat);
  moreCatsBtn && moreCatsBtn.classList.toggle("active", !headerCats.includes(cat) && cat!=="all");
  rebuildSidebarCats();
  renderGallery();
}

// Header pill clicks
document.querySelectorAll(".cat-btn:not(.more-cats-btn)").forEach(b=>b.addEventListener("click",()=>setCategory(b.dataset.cat)));
// More button opens sidebar
moreCatsBtn && moreCatsBtn.addEventListener("click",()=>{ openSidebar(); setTimeout(()=>catSearchInput.focus(),350); });

// CATEGORY SEARCH in sidebar
catSearchInput.addEventListener("input",()=>{
  catQuery = catSearchInput.value.trim();
  catSearchClear.classList.toggle("visible", catQuery.length>0);
  rebuildSidebarCats();
});
catSearchClear.addEventListener("click",()=>{
  catSearchInput.value=""; catQuery="";
  catSearchClear.classList.remove("visible");
  rebuildSidebarCats();
  catSearchInput.focus();
});

// SIDEBAR
function openSidebar()  { sidebar.classList.add("open"); sidebarOverlay.classList.add("active"); hamburgerBtn.classList.add("active"); document.body.style.overflow="hidden"; }
function closeSidebar() { sidebar.classList.remove("open"); sidebarOverlay.classList.remove("active"); hamburgerBtn.classList.remove("active"); document.body.style.overflow=""; }
hamburgerBtn.addEventListener("click",()=>sidebar.classList.contains("open")?closeSidebar():openSidebar());
sidebarClose.addEventListener("click",closeSidebar);
sidebarOverlay.addEventListener("click",closeSidebar);

// LIGHTBOX
function openLightbox(idx){ lightboxIdx=idx; updateLightbox(); buildStrip(); lightbox.classList.add("open"); document.body.style.overflow="hidden"; }
function updateLightbox(){
  const img=filtered[lightboxIdx]; if(!img) return;
  lbImg.style.opacity="0"; lbImg.src=img.src; lbImg.alt=img.title;
  lbImg.onload=()=>{ lbImg.style.opacity="1"; };
  lbTitle.textContent=img.title; lbCategory.textContent=img.category;
  const favs=getFavs(); const isFaved=favs.includes(img.id);
  lbFavBtn.classList.toggle("faved",isFaved);
  lbFavBtn.querySelector("i").className=`${isFaved?"fa-solid":"fa-regular"} fa-heart`;
  document.querySelectorAll(".strip-thumb").forEach((t,i)=>t.classList.toggle("active",i===lightboxIdx));
  const at=document.querySelector(".strip-thumb.active"); if(at) at.scrollIntoView({inline:"center",behavior:"smooth"});
}
function buildStrip(){
  lightboxStrip.innerHTML="";
  filtered.forEach((img,i)=>{
    const t=document.createElement("div"); t.className=`strip-thumb ${i===lightboxIdx?"active":""}`;
    t.innerHTML=`<img src="${img.src}" alt="${img.title}" loading="lazy"/>`;
    t.addEventListener("click",()=>{ lightboxIdx=i; updateLightbox(); });
    lightboxStrip.appendChild(t);
  });
}
lbPrev.addEventListener("click",()=>{ lightboxIdx=(lightboxIdx-1+filtered.length)%filtered.length; updateLightbox(); });
lbNext.addEventListener("click",()=>{ lightboxIdx=(lightboxIdx+1)%filtered.length; updateLightbox(); });
document.addEventListener("keydown",e=>{
  if(isFullscreen&&e.key==="Escape"){ setFullscreen(false); return; }
  if(loginModal.classList.contains("open")){ if(e.key==="Escape") closeLoginModal(); return; }
  if(!lightbox.classList.contains("open")) return;
  if(e.key==="ArrowLeft")  { lightboxIdx=(lightboxIdx-1+filtered.length)%filtered.length; updateLightbox(); }
  if(e.key==="ArrowRight") { lightboxIdx=(lightboxIdx+1)%filtered.length; updateLightbox(); }
  if(e.key==="Escape") closeLightboxFn();
});

// FAVORITE
function toggleFavorite(id,btnEl){
  const favs=getFavs(); const idx=favs.indexOf(id); const adding=idx===-1;
  if(adding) favs.push(id); else favs.splice(idx,1);
  saveFavs(favs);
  if(btnEl){ btnEl.classList.toggle("faved",adding); btnEl.querySelector("i").className=`${adding?"fa-solid":"fa-regular"} fa-heart`; btnEl.classList.add("pulse-heart"); setTimeout(()=>btnEl.classList.remove("pulse-heart"),300); }
  lbFavBtn.classList.toggle("faved",adding); lbFavBtn.querySelector("i").className=`${adding?"fa-solid":"fa-regular"} fa-heart`;
  showToast(adding?"❤️ Added to Favorites":"💔 Removed",adding?"heart":"");
  updateSidebarSections();
}
lbFavBtn.addEventListener("click",()=>{ const img=filtered[lightboxIdx]; if(img) toggleFavorite(img.id,null); });

// DOWNLOAD
function downloadImage(img){
  const a=document.createElement("a"); a.href=img.src; a.download=img.title.replace(/\s+/g,"-").toLowerCase()+".jpg"; a.target="_blank"; a.click();
  const dls=getDls(); if(!dls.includes(img.id)){ dls.push(img.id); saveDls(dls); }
  showToast("⬇️ Downloading…","success"); updateSidebarSections();
}
lbDownloadBtn.addEventListener("click",()=>{ const img=filtered[lightboxIdx]; if(img) downloadImage(img); });

// FULLSCREEN
let isFullscreen=false;
const fsExitBtn=document.getElementById("fullscreenExitBtn");
function setFullscreen(val){
  isFullscreen=val;
  if(val){ const w=document.querySelector(".lb-img-wrap"); (w.requestFullscreen||w.webkitRequestFullscreen).call(w); lbFullscreen.querySelector("i").className="fa-solid fa-compress"; fsExitBtn.style.display="flex"; }
  else { if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); } lbFullscreen.querySelector("i").className="fa-solid fa-expand"; fsExitBtn.style.display="none"; }
}
document.addEventListener("fullscreenchange",()=>{ if(!document.fullscreenElement){ isFullscreen=false; lbFullscreen.querySelector("i").className="fa-solid fa-expand"; fsExitBtn.style.display="none"; } });
lbFullscreen.addEventListener("click",()=>setFullscreen(!isFullscreen));
fsExitBtn.addEventListener("click",()=>setFullscreen(false));
function closeLightboxFn(){ setFullscreen(false); lightbox.classList.remove("open"); document.body.style.overflow=""; stopSlideshow(); }
lbClose.addEventListener("click",closeLightboxFn);
lbBackdrop.addEventListener("click",closeLightboxFn);

// SLIDESHOW
function startSlideshow(){
  stopSlideshow();
  if(!lightbox.classList.contains("open")&&filtered.length>0) openLightbox(0);
  slideShowTimer=setInterval(()=>{ lightboxIdx=(lightboxIdx+1)%filtered.length; updateLightbox(); },3000);
  slideshowBtn.classList.add("playing"); slideshowBtn.querySelector("i").className="fa-solid fa-pause";
  showToast("▶ Slideshow started","success");
}
function stopSlideshow(){
  clearInterval(slideShowTimer); slideShowTimer=null;
  slideshowBtn.classList.remove("playing"); slideshowBtn.querySelector("i").className="fa-solid fa-play";
}
slideshowBtn.addEventListener("click",()=>{ if(slideShowTimer){ stopSlideshow(); showToast("⏸ Paused"); } else startSlideshow(); });

// VIEW
gridViewBtn.addEventListener("click",()=>{ isMasonry=false; galleryGrid.classList.remove("masonry"); gridViewBtn.classList.add("active"); masonryViewBtn.classList.remove("active"); renderGallery(); });
masonryViewBtn.addEventListener("click",()=>{ isMasonry=true; galleryGrid.classList.add("masonry"); masonryViewBtn.classList.add("active"); gridViewBtn.classList.remove("active"); renderGallery(); });

// THEME
function applyTheme(t){ document.documentElement.setAttribute("data-theme",t); localStorage.setItem("gallery_theme",t); themeToggle.querySelector("i").className=t==="dark"?"fa-solid fa-moon":"fa-solid fa-sun"; }
themeToggle.addEventListener("click",()=>applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"));

// UPLOAD
uploadArea.addEventListener("click",()=>fileInput.click());
uploadArea.addEventListener("dragover",e=>{e.preventDefault();uploadArea.style.borderColor="var(--accent)";});
uploadArea.addEventListener("dragleave",()=>{uploadArea.style.borderColor="";});
uploadArea.addEventListener("drop",e=>{e.preventDefault();uploadArea.style.borderColor="";const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/"))handleFile(f);});
fileInput.addEventListener("change",()=>{if(fileInput.files[0])handleFile(fileInput.files[0]);});
function handleFile(file){
  const r=new FileReader();
  r.onload=e=>{uploadPreview.src=e.target.result;uploadArea.style.display="none";uploadForm.style.display="flex";uploadName.value=file.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ");};
  r.readAsDataURL(file);
}
uploadCategory.addEventListener("change",()=>{ customCatInput.style.display=uploadCategory.value==="__custom__"?"block":"none"; if(uploadCategory.value==="__custom__") customCatInput.focus(); });
uploadCancel.addEventListener("click",()=>{ uploadArea.style.display="block"; uploadForm.style.display="none"; customCatInput.style.display="none"; fileInput.value=""; });
uploadAdd.addEventListener("click",()=>{
  const title=uploadName.value.trim()||"Uploaded Image";
  let cat=uploadCategory.value;
  if(cat==="__custom__"){ cat=customCatInput.value.trim().toLowerCase(); if(!cat){showToast("⚠️ Enter a category name","error");return;} }
  const src=uploadPreview.src; if(!src) return;
  allImages.push({id:nextId++,title,category:cat,src});
  saveImages(); rebuildUploadSelect(); rebuildSidebarCats(); renderGallery();
  uploadArea.style.display="block"; uploadForm.style.display="none"; customCatInput.style.display="none"; fileInput.value="";
  closeSidebar(); showToast(`✅ "${title}" added!`,"success");
});

// SIDEBAR THUMBS
function updateSidebarSections(){
  const favs=getFavs(); const dls=getDls();
  favCount.textContent=favs.length; dlCount.textContent=dls.length;
  renderThumbContainer(favThumbsCont,favs,"fav");
  renderThumbContainer(dlThumbsCont,dls,"dl");
  const cf=document.getElementById("clearFavsBtn"); const cd=document.getElementById("clearDlsBtn");
  if(cf) cf.style.display=favs.length?"flex":"none";
  if(cd) cd.style.display=dls.length?"flex":"none";
}
document.getElementById("clearFavsBtn").addEventListener("click",()=>{ if(!confirm("Remove all favorites?")) return; saveFavs([]); showToast("💔 Favorites cleared","heart"); renderGallery(); updateSidebarSections(); });
document.getElementById("clearDlsBtn").addEventListener("click",()=>{ if(!confirm("Clear download history?")) return; saveDls([]); showToast("🗑️ Downloads cleared"); updateSidebarSections(); });
function renderThumbContainer(container,ids,type){
  if(!ids.length){ container.innerHTML=`<p class="empty-msg">None yet</p>`; return; }
  container.innerHTML=ids.map(id=>{ const img=allImages.find(i=>i.id===id); if(!img) return ""; return `<div class="sidebar-thumb" data-id="${id}"><img src="${img.src}" alt="${img.title}" loading="lazy"/><button class="thumb-delete" data-id="${id}" data-type="${type}"><i class="fa-solid fa-xmark"></i></button></div>`; }).join("");
  container.querySelectorAll(".sidebar-thumb").forEach(t=>{
    t.querySelector("img").addEventListener("click",()=>{ const id=parseInt(t.dataset.id); const idx=filtered.findIndex(i=>i.id===id); if(idx>=0){openLightbox(idx);closeSidebar();} else{setCategory("all");const i2=filtered.findIndex(i=>i.id===id);if(i2>=0){openLightbox(i2);closeSidebar();}} });
    t.querySelector(".thumb-delete").addEventListener("click",e=>{ e.stopPropagation(); const id=parseInt(e.currentTarget.dataset.id); const kind=e.currentTarget.dataset.type; if(kind==="fav"){saveFavs(getFavs().filter(x=>x!==id));showToast("💔 Removed","heart");renderGallery();} else{saveDls(getDls().filter(x=>x!==id));showToast("🗑️ Removed");} updateSidebarSections(); });
  });
}

// TOAST
function showToast(msg,type=""){
  const t=document.createElement("div"); t.className=`toast ${type}`; t.innerHTML=`<span>${msg}</span>`;
  document.getElementById("toastContainer").appendChild(t);
  setTimeout(()=>{ t.classList.add("removing"); t.addEventListener("animationend",()=>t.remove()); },2800);
}

// TOUCH SWIPE
let touchStartX=0;
lightbox.addEventListener("touchstart",e=>{touchStartX=e.touches[0].clientX;},{passive:true});
lightbox.addEventListener("touchend",e=>{ const dx=e.changedTouches[0].clientX-touchStartX; if(Math.abs(dx)>50){lightboxIdx=dx<0?(lightboxIdx+1)%filtered.length:(lightboxIdx-1+filtered.length)%filtered.length;updateLightbox();} });

// ════════════════════════════════════════
// LOGIN / AUTH MODAL
// ════════════════════════════════════════
function openLoginModal(){
  updateModalState();
  loginModal.classList.add("open");
  document.body.style.overflow="hidden";
}
function closeLoginModal(){
  loginModal.classList.remove("open");
  document.body.style.overflow="";
}
function updateModalState(){
  const pl=document.getElementById("panelLogin");
  const pr=document.getElementById("panelRegister");
  const pli=document.getElementById("panelLoggedIn");
  if(currentUser){
    pl.style.display="none"; pr.style.display="none"; pli.style.display="flex";
    document.getElementById("loggedInName").textContent=currentUser.name;
    document.getElementById("loggedInEmail").textContent=currentUser.email;
    document.getElementById("modalAvatar").textContent=currentUser.name.charAt(0).toUpperCase();
    document.getElementById("statFavs").textContent=getFavs().length;
    document.getElementById("statDls").textContent=getDls().length;
    document.getElementById("statUploads").textContent=getUploads();
    // Update header button
    loginBtn.innerHTML=`<i class="fa-solid fa-user-check"></i><span>${currentUser.name.split(" ")[0]}</span>`;
    loginBtn.classList.add("logged-in");
  } else {
    pl.style.display="flex"; pr.style.display="none"; pli.style.display="none";
    loginBtn.innerHTML=`<i class="fa-solid fa-user"></i><span>Login</span>`;
    loginBtn.classList.remove("logged-in");
  }
}
function showPanel(panelId){
  ["panelLogin","panelRegister","panelLoggedIn"].forEach(id=>{ document.getElementById(id).style.display=id===panelId?"flex":"none"; });
}
function validateEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

loginBtn.addEventListener("click",openLoginModal);
loginModal.addEventListener("click",e=>{ if(e.target===loginModal) closeLoginModal(); });
modalClose.addEventListener("click",closeLoginModal);

document.getElementById("goToRegister").addEventListener("click",()=>showPanel("panelRegister"));
document.getElementById("goToLogin").addEventListener("click",()=>showPanel("panelLogin"));

// Toggle password visibility
document.getElementById("toggleLoginPw").addEventListener("click",()=>{
  const inp=document.getElementById("loginPassword"); inp.type=inp.type==="password"?"text":"password";
  document.getElementById("toggleLoginPw").querySelector("i").className=inp.type==="password"?"fa-solid fa-eye":"fa-solid fa-eye-slash";
});
document.getElementById("toggleRegPw").addEventListener("click",()=>{
  const inp=document.getElementById("regPassword"); inp.type=inp.type==="password"?"text":"password";
  document.getElementById("toggleRegPw").querySelector("i").className=inp.type==="password"?"fa-solid fa-eye":"fa-solid fa-eye-slash";
});

// LOGIN SUBMIT
document.getElementById("loginSubmit").addEventListener("click",()=>{
  const email=document.getElementById("loginEmail").value.trim();
  const pw=document.getElementById("loginPassword").value;
  if(!validateEmail(email)){ showToast("⚠️ Enter a valid email","error"); return; }
  if(pw.length<6){ showToast("⚠️ Password too short","error"); return; }
  // Check stored users
  const users=JSON.parse(localStorage.getItem("gallery_users")||"[]");
  const match=users.find(u=>u.email===email&&u.password===pw);
  if(!match){ showToast("❌ Invalid email or password","error"); return; }
  currentUser=match;
  localStorage.setItem("gallery_user",JSON.stringify(currentUser));
  if(document.getElementById("rememberMe").checked) localStorage.setItem("gallery_remember","1");
  updateModalState(); showToast(`👋 Welcome back, ${currentUser.name.split(" ")[0]}!`,"success");
  setTimeout(closeLoginModal,800);
});

// REGISTER SUBMIT
document.getElementById("registerSubmit").addEventListener("click",()=>{
  const name=document.getElementById("regName").value.trim();
  const email=document.getElementById("regEmail").value.trim();
  const pw=document.getElementById("regPassword").value;
  if(!name){ showToast("⚠️ Enter your name","error"); return; }
  if(!validateEmail(email)){ showToast("⚠️ Enter a valid email","error"); return; }
  if(pw.length<6){ showToast("⚠️ Password must be 6+ chars","error"); return; }
  const users=JSON.parse(localStorage.getItem("gallery_users")||"[]");
  if(users.find(u=>u.email===email)){ showToast("⚠️ Email already registered","error"); return; }
  const newUser={name,email,password:pw};
  users.push(newUser); localStorage.setItem("gallery_users",JSON.stringify(users));
  currentUser=newUser; localStorage.setItem("gallery_user",JSON.stringify(currentUser));
  updateModalState(); showToast(`🎉 Account created! Welcome, ${name.split(" ")[0]}!`,"success");
  setTimeout(closeLoginModal,800);
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click",()=>{
  currentUser=null; localStorage.removeItem("gallery_user"); localStorage.removeItem("gallery_remember");
  updateModalState(); showToast("👋 Signed out",""); closeLoginModal();
});

// INIT
(function init(){
  applyTheme(localStorage.getItem("gallery_theme")||"dark");
  loadStorage();
  nextId=Math.max(...allImages.map(i=>i.id),99)+1;
  rebuildSidebarCats();
  rebuildUploadSelect();
  renderGallery();
  updateModalState(); // restore login state
})();