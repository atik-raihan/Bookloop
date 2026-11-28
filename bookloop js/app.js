/* BookLoop front-end application: demo/localStorage edition */

/*
 * BookLoop Project
 * Original Author: Your Friend's Name
 * GitHub: https://github.com/aladil-cmd
 * Original Source:
 * https://github.com/aladil-cmd/BookLoop
 *
 * Code reused with attribution.
 */


(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const DB = {
    get(k, fallback=[]) { try { return JSON.parse(localStorage.getItem("bookloop_"+k)) ?? fallback; } catch { return fallback; } },
    set(k,v) { localStorage.setItem("bookloop_"+k, JSON.stringify(v)); }
  };
  const departments = ["CST","Computer Science","EEE","Civil","Mechanical","Textile","BBA","English","Architecture","Other"];
  const semesters = Array.from({length:8},(_,i)=>`Semester ${i+1}`);
  const conditions = ["Like new","Very good","Good","Acceptable"];
  const spots = ["Campus library","Main gate","Cafeteria","Department building","Other public place"];
  const money = n => "৳"+Number(n||0).toLocaleString("en-BD");
  const escapeHTML = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const currentUser = () => DB.get("user", null);
  const seed = () => {
    if (!DB.get("books", null)) DB.set("books", [
      {id:"sample-1",title:"Introduction to Algorithms",author:"Thomas H. Cormen",dept:"CST",semester:"Semester 3",condition:"Very good",original:1200,price:650,description:"A few pencil notes. All pages intact.",spot:"Campus library",seller:"Nusrat Jahan",sellerEmail:"nusrat@bookloop.demo",photos:[],created:Date.now()-300000,status:"available"},
      {id:"sample-2",title:"Engineering Mathematics",author:"B. S. Grewal",dept:"EEE",semester:"Semester 2",condition:"Good",original:950,price:500,description:"Some highlighting, no missing pages.",spot:"Cafeteria",seller:"Nusrat Jahan",sellerEmail:"nusrat@bookloop.demo",photos:[],created:Date.now()-200000,status:"available"},
      {id:"sample-3",title:"Database System Concepts",author:"Silberschatz",dept:"CST",semester:"Semester 4",condition:"Like new",original:1100,price:750,description:"Clean copy.",spot:"Main gate",seller:"Rahim Ahmed",sellerEmail:"rahim@bookloop.demo",photos:[],created:Date.now()-100000,status:"available"}
    ]);
  };
  seed();
  function headerFooter(){
    const user=currentUser();
    const h=$("#site-header"), f=$("#site-footer");
    if(h) h.innerHTML=`<div class="wrap" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0;flex-wrap:wrap"><a href="index1.html" style="font-weight:800;font-size:1.45rem;text-decoration:none;color:inherit">BookLoop<span style="color:var(--accent,#c66b43)">.</span></a><nav aria-label="Main navigation" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><a href="browse.html">Browse</a><a href="sell.html">Sell a book</a><a href="messages.html">Messages</a><a href="profile.html">My shelf</a>${user?`<span class="hint">Hi, ${escapeHTML(user.name.split(" ")[0])}</span><button class="btn btn-small" id="logout-btn" type="button">Log out</button>`:`<a class="btn btn-small" href="auth.html">Log in</a>`}</nav></div>`;
    if(f) f.innerHTML=`<div class="wrap" style="padding:28px 0;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><span><strong>BookLoop</strong> · Pass it on, keep it local.</span><span class="hint">Buy and sell books with your campus community.</span></div>`;
    $("#logout-btn")?.addEventListener("click",()=>{DB.set("user",null);location.href="index1.html";});
  }
  function requireLogin(){ if(!currentUser()){location.href="auth.html";return false;} return true; }
  function card(b){return `<article class="book-card paper" style="padding:16px;border-radius:12px"><a href="book.html?id=${encodeURIComponent(b.id)}" style="text-decoration:none;color:inherit"><div style="height:150px;background:#eee8dc;border-radius:8px;display:grid;place-items:center;overflow:hidden">${b.photos?.[0]?`<img src="${b.photos[0]}" alt="${escapeHTML(b.title)} cover" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:3rem">📚</span>`}</div><h3>${escapeHTML(b.title)}</h3></a><p class="hint">${escapeHTML(b.author||"Author not listed")} · ${escapeHTML(b.dept)} · ${escapeHTML(b.semester)}</p><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong>${money(b.price)}</strong><span class="hint">${escapeHTML(b.condition)}</span></div><p class="hint">Seller: ${escapeHTML(b.seller)}</p><a class="btn btn-small" href="book.html?id=${encodeURIComponent(b.id)}">View details</a></article>`;}
  function fillSelect(el, items, first){if(!el)return;el.innerHTML=`<option value="">${first}</option>`+items.map(x=>`<option>${escapeHTML(x)}</option>`).join("");}
  function initHome(){
    const grid=$("#shelf-grid"); if(grid){const books=DB.get("books").filter(b=>b.status==="available").sort((a,b)=>b.created-a.created);grid.innerHTML=books.slice(0,3).map(card).join("")||"<p>No listings yet. Be the first to sell a book.</p>";}
    const college=$("#college-line");if(college)college.textContent="Made for campus communities";
    const orig=$("#calc-original"),pct=$("#calc-percent");
    function calc(){if(!orig||!pct)return;const n=Math.max(0,Number(orig.value)||0),p=Number(pct.value),shop=n*.6,you=n*p/100;$("#calc-pct").textContent=p+"%";$("#calc-shop").textContent=money(shop);$("#calc-you").textContent=money(you);$("#calc-shop-bar").style.width=(n?60:0)+"%";$("#calc-you-bar").style.width=p+"%";$("#calc-diff").textContent=`You keep ${money(you)} — ${money(Math.max(0,n-you))} less than the new price.`;}
    orig?.addEventListener("input",calc);pct?.addEventListener("input",calc);calc();
  }
  function initAuth(){
    const tabs=[$("#tab-login"),$("#tab-signup")], panels=[$("#panel-login"),$("#panel-signup")], err=$("#auth-error");
    function show(which){tabs.forEach((t,i)=>{t.setAttribute("aria-selected",String(i===which));t.tabIndex=i===which?0:-1;panels[i].hidden=i!==which;});if(err)err.hidden=true;}
    tabs.forEach((t,i)=>t?.addEventListener("click",()=>show(i)));
    if(location.hash==="#signup")show(1);
    const already=$("#panel-already");if(currentUser()){panels.forEach(p=>p.hidden=true);tabs.forEach(t=>t.hidden=true);already.hidden=false;$("#already-text").textContent=`You are logged in as ${currentUser().name}.`;}
    $("#fill-demo")?.addEventListener("click",()=>{$("#login-email").value="nusrat@bookloop.demo";$("#login-password").value="bookloop";});
    $("#login-form")?.addEventListener("submit",e=>{e.preventDefault();const email=$("#login-email").value.trim().toLowerCase(),pass=$("#login-password").value;if(!email||!pass){err.textContent="Enter your email and password.";err.hidden=false;return;}const users=DB.get("users");let u=users.find(x=>x.email===email&&x.password===pass);if(email==="nusrat@bookloop.demo"&&pass==="bookloop")u={name:"Nusrat Jahan",email,dept:"CST",semester:"Semester 4"};if(!u){err.textContent="Account not found or password is incorrect. Try signing up first.";err.hidden=false;return;}DB.set("user",u);location.href="profile.html";});
    fillSelect($("#su-dept"),departments,"Choose department");fillSelect($("#su-sem"),semesters,"Choose semester");
    $("#signup-form")?.addEventListener("submit",e=>{e.preventDefault();const name=$("#su-name").value.trim(),email=$("#su-email").value.trim().toLowerCase(),password=$("#su-password").value,dept=$("#su-dept").value,semester=$("#su-sem").value; if(!name||!email||password.length<6||!dept||!semester){err.textContent="Complete all fields. Password must be at least 6 characters.";err.hidden=false;return;}const users=DB.get("users");if(users.some(u=>u.email===email)){err.textContent="This email already has an account. Please log in.";err.hidden=false;return;}const u={name,email,password,dept,semester};users.push(u);DB.set("users",users);DB.set("user",u);location.href="profile.html";});
  }
  function initBrowse(){
    fillSelect($("#f-dept"),departments,"All departments");fillSelect($("#f-sem"),semesters,"All semesters");
    $("#f-cond").innerHTML=conditions.map(c=>`<label><input type="checkbox" value="${c}"> ${c}</label>`).join("");
    const render=()=>{let list=DB.get("books").filter(b=>b.status==="available");const q=$("#f-q").value.trim().toLowerCase(),d=$("#f-dept").value,s=$("#f-sem").value,max=Number($("#f-max").value),conds=$$("#f-cond input:checked").map(x=>x.value);list=list.filter(b=>(!q||[b.title,b.author,b.dept].join(" ").toLowerCase().includes(q))&&(!d||b.dept===d)&&(!s||b.semester===s)&&(!conds.length||conds.includes(b.condition))&&(!$("#f-max").value||b.price<=max));const sort=$("#f-sort").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);else if(sort==="high")list.sort((a,b)=>b.price-a.price);else if(sort==="saving")list.sort((a,b)=>(b.original-b.price)-(a.original-a.price));else list.sort((a,b)=>b.created-a.created);$("#count").textContent=`${list.length} ${list.length===1?"book":"books"} found`;$("#grid").innerHTML=list.map(card).join("");$("#empty").hidden=!!list.length;};
    $("#filters").addEventListener("input",render);$("#filters").addEventListener("change",render);$("#f-reset").addEventListener("click",()=>{$("#filters").reset();render();});render();
  }
  function initSell(){
    if(!requireLogin())return;
    fillSelect($("#dept"),departments,"Choose department");fillSelect($("#semester"),semesters,"Choose semester");fillSelect($("#spot"),spots,"Choose a meeting spot");
    $("#conditions").innerHTML=conditions.map((c,i)=>`<label class="choice"><input type="radio" name="condition" value="${c}" ${i===2?"checked":""}> ${c}</label>`).join("");
    const params=new URLSearchParams(location.search),editId=params.get("edit"),old=DB.get("books").find(b=>b.id===editId&&b.sellerEmail===currentUser().email);
    if(editId&&!old){$("#form-errors").textContent="Listing not found or you do not own it.";$("#form-errors").hidden=false;}
    if(old){$("#page-title").textContent="Edit your listing";$("#submit-btn").textContent="Save changes";["title","author","description","original","price"].forEach(k=>$("#"+k).value=old[k]??"");$("#dept").value=old.dept;$("#semester").value=old.semester;$("#spot").value=old.spot;$$('[name="condition"]').forEach(x=>x.checked=x.value===old.condition);}
    let photos=old?.photos||[];
    const updateMeter=()=>{const n=Number($("#original").value),p=Number($("#price").value);if(n>0&&p>0){$("#meter-fill").style.width=Math.min(100,p/n*100)+"%";$("#meter-shop").textContent=money(p);$("#meter-text").textContent=`Your price is ${Math.round(p/n*100)}% of the new price.`;}};
    ["original","price"].forEach(id=>$("#"+id).addEventListener("input",updateMeter));
    $$(".chip-btn").forEach(btn=>btn.addEventListener("click",()=>{const n=Number($("#original").value);if(n>0){$("#price").value=Math.round(n*Number(btn.dataset.pct)/100);updateMeter();}}));
    $("#photos").addEventListener("change",e=>{const files=[...e.target.files].slice(0,3);photos=[];let pending=files.length;files.forEach(file=>{const reader=new FileReader();reader.onload=()=>{photos.push(reader.result);pending--;if(!pending)$("#photo-previews").innerHTML=photos.map(src=>`<img src="${src}" alt="Selected book photo" style="width:90px;height:90px;object-fit:cover;border-radius:8px">`).join("");};reader.readAsDataURL(file);});});
    $("#sell-form").addEventListener("submit",e=>{e.preventDefault();const title=$("#title").value.trim(),original=Number($("#original").value),price=Number($("#price").value),condition=$('[name="condition"]:checked')?.value,err=$("#form-errors");const required=[title,original>0,price>0,price<=original,$("#dept").value,$("#semester").value,$("#spot").value,condition];if(required.some(x=>!x)){err.textContent="Please complete the required fields. Your price must be greater than 0 and no more than the new price.";err.hidden=false;err.focus();return;}const books=DB.get("books");const b={id:old?.id||"book-"+Date.now(),title,author:$("#author").value.trim(),dept:$("#dept").value,semester:$("#semester").value,condition,original,price,description:$("#description").value.trim(),spot:$("#spot").value,photos,seller:currentUser().name,sellerEmail:currentUser().email,created:old?.created||Date.now(),status:old?.status||"available"};const idx=books.findIndex(x=>x.id===b.id);if(idx>=0)books[idx]=b;else books.push(b);DB.set("books",books);location.href="profile.html?published=1";});
    updateMeter();
  }
  function initProfile(){
    if(!requireLogin())return;const u=currentUser(),root=$("#profile-root"),books=DB.get("books").filter(b=>b.sellerEmail===u.email).sort((a,b)=>b.created-a.created);
    root.innerHTML=`<div class="page-head"><h1>My shelf</h1><p>Manage your listings and account details.</p></div><section class="paper" style="padding:20px;border-radius:12px;margin-bottom:24px"><h2>${escapeHTML(u.name)}</h2><p>${escapeHTML(u.email)} · ${escapeHTML(u.dept)} · ${escapeHTML(u.semester)}</p><button class="btn btn-small" id="edit-account">Edit profile</button></section><div class="section-head"><h2>Your listings (${books.length})</h2><a class="btn btn-small btn-ink" href="sell.html">＋ Sell a book</a></div><div class="books-grid">${books.map(b=>`<article class="paper" style="padding:16px;border-radius:12px"><h3>${escapeHTML(b.title)}</h3><p>${money(b.price)} · ${escapeHTML(b.status)}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-small" href="sell.html?edit=${encodeURIComponent(b.id)}">Edit</a><button class="btn btn-small" data-status="${b.id}">${b.status==="sold"?"Mark available":"Mark sold"}</button><button class="btn btn-small" data-delete="${b.id}">Delete</button></div></article>`).join("")||"<p>You have not listed any books yet.</p>"}</div>`;
    $("#edit-account").addEventListener("click",()=>{const name=prompt("Your name",u.name);if(name?.trim()){u.name=name.trim();DB.set("user",u);const users=DB.get("users").map(x=>x.email===u.email?u:x);DB.set("users",users);location.reload();}});
    $$("[data-status]").forEach(btn=>btn.addEventListener("click",()=>{const all=DB.get("books"),b=all.find(x=>x.id===btn.dataset.status);b.status=b.status==="sold"?"available":"sold";DB.set("books",all);location.reload();}));
    $$("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{if(confirm("Delete this listing permanently?")){DB.set("books",DB.get("books").filter(x=>x.id!==btn.dataset.delete));location.reload();}}));
  }
  function initBook(){const id=new URLSearchParams(location.search).get("id"),b=DB.get("books").find(x=>x.id===id),root=$("#book-root");if(!b){root.innerHTML="<div class='empty paper'><h1>Book not found</h1><a href='browse.html'>Back to browse</a></div>";return;}root.innerHTML=`<div class="paper" style="padding:24px;border-radius:14px;display:grid;grid-template-columns:minmax(180px, .8fr) 1.2fr;gap:24px"><div style="min-height:240px;background:#eee8dc;border-radius:10px;display:grid;place-items:center;overflow:hidden">${b.photos?.[0]?`<img src="${b.photos[0]}" alt="${escapeHTML(b.title)} cover" style="width:100%;height:100%;object-fit:cover">`:"<span style='font-size:5rem'>📚</span>"}</div><div><p class="hint">${escapeHTML(b.dept)} · ${escapeHTML(b.semester)} · ${escapeHTML(b.condition)}</p><h1>${escapeHTML(b.title)}</h1><p>${escapeHTML(b.author)}</p><h2>${money(b.price)}</h2><p>${escapeHTML(b.description||"No extra details provided.")}</p><p><strong>Seller:</strong> ${escapeHTML(b.seller)}</p><p><strong>Suggested meetup:</strong> ${escapeHTML(b.spot)}</p><button class="btn btn-ink" id="message-seller">Message seller</button><p class="hint">${b.status==="sold"?"This book is marked as sold.":"Please inspect the book in person before paying."}</p></div></div>`;$("#message-seller").disabled=b.status==="sold";$("#message-seller").addEventListener("click",()=>{if(!requireLogin())return;const chats=DB.get("chats");let chat=chats.find(c=>c.bookId===b.id&&c.buyerEmail===currentUser().email);if(!chat){chat={id:"chat-"+Date.now(),bookId:b.id,buyerEmail:currentUser().email,buyer:currentUser().name,sellerEmail:b.sellerEmail,seller:b.seller,messages:[{from:currentUser().email,text:`Hi! Is "${b.title}" still available?`,at:Date.now()}]};chats.push(chat);DB.set("chats",chats);}location.href="messages.html?chat="+chat.id;});}
  function initMessages(){if(!requireLogin())return;const u=currentUser(),all=DB.get("chats").filter(c=>c.buyerEmail===u.email||c.sellerEmail===u.email),list=$("#thread-list"),pane=$("#chat-pane");if(!all.length){list.innerHTML="<p class='paper' style='padding:16px'>No conversations yet. Open a book and message its seller.</p>";pane.innerHTML="<div class='paper' style='padding:24px'>Your conversations will appear here.</div>";return;}let active=all.find(c=>c.id===new URLSearchParams(location.search).get("chat"))||all[0];const draw=()=>{list.innerHTML=all.map(c=>`<button class="btn" data-chat="${c.id}" style="display:block;width:100%;text-align:left;margin-bottom:8px">${escapeHTML(c.bookId)}<br><small>${escapeHTML(c.sellerEmail===u.email?c.buyer:c.seller)}</small></button>`).join("");pane.innerHTML=`<div class="paper" style="padding:18px;border-radius:12px"><h2>${escapeHTML(active.sellerEmail===u.email?active.buyer:active.seller)}</h2><div style="min-height:180px;max-height:340px;overflow:auto;padding:10px 0">${active.messages.map(m=>`<p style="padding:10px;border-radius:10px;background:${m.from===u.email?"#e6eee7":"#f2eee6"};max-width:85%;margin:8px ${m.from===u.email?"0 0 8px auto":"auto 0 8px 0"}">${escapeHTML(m.text)}<br><small>${new Date(m.at).toLocaleString()}</small></p>`).join("")}</div><form id="chat-form" style="display:flex;gap:8px"><input id="chat-input" required maxlength="500" placeholder="Write a message..." style="flex:1"><button class="btn btn-ink">Send</button></form></div>`;$$("[data-chat]").forEach(x=>x.addEventListener("click",()=>{active=all.find(c=>c.id===x.dataset.chat);draw();}));$("#chat-form").addEventListener("submit",e=>{e.preventDefault();const val=$("#chat-input").value.trim();if(!val)return;const chats=DB.get("chats"),c=chats.find(x=>x.id===active.id);c.messages.push({from:u.email,text:val,at:Date.now()});DB.set("chats",chats);active=c;draw();});};draw();}
  document.addEventListener("DOMContentLoaded",()=>{headerFooter();initHome();if($("#login-form"))initAuth();if($("#filters"))initBrowse();if($("#sell-form"))initSell();if($("#profile-root"))initProfile();if($("#book-root"))initBook();if($("#chat-layout"))initMessages();});
})();