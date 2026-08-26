document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector('.overlay');
    if(overlay){ overlay.style.pointerEvents = 'none'; overlay.style.zIndex = '-1'; }

    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const cancelUpload = document.getElementById('cancelUpload');
    const uploadForm = document.getElementById('uploadForm');
    const itemGrid = document.getElementById('itemGrid');
    const search = document.getElementById('search');
    const floorFilter = document.getElementById('floorFilter');
    const typeFilter = document.getElementById('typeFilter');
    const imageSearchBtn = document.getElementById('imageSearchBtn');
    const imageSearchInput = document.getElementById('imageSearchInput');
    const loader = document.getElementById('loader');

    const chatToggle = document.getElementById("chatToggle");
    const itemChatModal = document.getElementById("itemChatModal");
    const closeChat = document.getElementById("closeItemChat");
    const msgInput = document.getElementById("chatMessageInput");
    const sendBtn = document.getElementById("sendChatMsg");
    const msgBox = document.getElementById("chatMessages");

    const adminBtn = document.getElementById('adminBtn');
    if(adminBtn) adminBtn.addEventListener('click', ()=> location.href='admin.html');

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', ()=> {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    let items = JSON.parse(localStorage.getItem('lostFoundItems')) || [];

    function renderItems(filterText = '', floor = '', type = ''){
        itemGrid.innerHTML = '';
        const filtered = items.filter(i=>{
            return (
                (i.title.toLowerCase().includes(filterText.toLowerCase()) || 
                 i.description.toLowerCase().includes(filterText.toLowerCase())) && 
                (floor === '' || i.floor === floor) && 
                (type === '' || i.type === type)
            );
        });

        if(filtered.length===0){
            itemGrid.innerHTML = '<p style="padding:20px;color:#6b5a47">No items yet — post one using "Report Item".</p>';
            return;
        }

        filtered.forEach(i=>{
            const div=document.createElement('div');
            div.className='card-item';
            div.innerHTML = `<img src="${i.image}" alt=""><h3>${i.title}</h3><small>${i.description}</small><small>📍 ${i.location} (Floor ${i.floor})</small><div style="margin-top:8px"><button class="btn" data-id="${i.id}" onclick="openChatById('${i.id}')">💬 Chat</button> <button class="btn" onclick="showAIMatch('${i.id}')">🤖 AI Match</button></div>`;
            itemGrid.appendChild(div);
        });
    }

    if(uploadBtn) uploadBtn.addEventListener('click', ()=> uploadModal.classList.remove('hidden'));
    if(cancelUpload) cancelUpload.addEventListener('click', ()=> uploadModal.classList.add('hidden'));

    uploadForm.addEventListener('submit', e=>{
        e.preventDefault();
        const title=document.getElementById('title').value;
        const description=document.getElementById('description').value;
        const location=document.getElementById('location').value;
        const floor=document.getElementById('floor').value;
        const type=document.getElementById('itemType').value;
        const file=document.getElementById('image').files[0];

        if(!file) return alert('Select an image');

        const reader=new FileReader();
        reader.onload = function(ev){
            const obj={id:'id_'+Date.now(), title, description, location, floor, type, image:ev.target.result, created: Date.now()};
            items.push(obj);
            localStorage.setItem('lostFoundItems', JSON.stringify(items));
            uploadModal.classList.add('hidden');
            uploadForm.reset();
            renderItems();
            simulateAIMatch(obj);
        }
        reader.readAsDataURL(file);
    });

    search.addEventListener('input', ()=> renderItems(search.value, floorFilter.value, typeFilter.value));
    floorFilter.addEventListener('change', ()=> renderItems(search.value, floorFilter.value, typeFilter.value));
    typeFilter.addEventListener('change', ()=> renderItems(search.value, floorFilter.value, typeFilter.value));

    imageSearchBtn.addEventListener('click', ()=> imageSearchInput.click());
    imageSearchInput.addEventListener('change', e=>{
        const f=e.target.files[0];
        if(!f) return;
        loader.classList.remove('hidden');
        const reader=new FileReader();
        reader.onload = function(ev){
            setTimeout(()=>{
                loader.classList.add('hidden');
                const picks = items.slice(0, Math.min(items.length, Math.floor(Math.random()*3)+1));
                if(picks.length===0){ alert('No matches found.'); return; }
                alert('AI found '+picks.length+' visually similar item(s).');
                highlightItems(picks);
            }, 1200);
        }
        reader.readAsDataURL(f);
    });

    function simulateAIMatch(newItem){
        const keywords = newItem.title.toLowerCase().split(' ');
        const similar = items.filter(i=> i.id !== newItem.id && keywords.some(k=> i.title.toLowerCase().includes(k)));
        if(similar.length>0){
            setTimeout(()=>{ alert('AI Suggestion: Found '+similar.length+' similar item(s).'); highlightItems(similar); }, 700);
        }
    }

    function highlightItems(list){
        const nodes = document.querySelectorAll('.card-item');
        nodes.forEach(n=> n.style.boxShadow='none');
        list.forEach(it=>{
            const idx = items.findIndex(x=>x.id===it.id);
            if(idx>=0 && nodes[idx]) nodes[idx].style.boxShadow='0 0 18px rgba(184,145,99,0.9)';
        });
        setTimeout(()=>{ renderItems(search.value, floorFilter.value, typeFilter.value); }, 2500);
    }

    const timelineBtn = document.createElement('button');
    timelineBtn.textContent='🕒 Timeline';
    timelineBtn.className='btn';
    timelineBtn.onclick = ()=>{ document.getElementById('itemGrid').classList.toggle('hidden'); document.getElementById('timelineContainer').classList.toggle('hidden'); renderTimeline(); };
    document.querySelector('.top-actions').appendChild(timelineBtn);

    function renderTimeline(){
        const container = document.getElementById('timeline');
        container.innerHTML='';
        const sorted = items.slice().sort((a,b)=>b.created - a.created);
        sorted.forEach((item, idx)=>{
            const d=document.createElement('div'); d.className='timeline-item '+(idx%2===0?'left':'right');
            const date = new Date(item.created).toLocaleString();
            d.innerHTML=`<img src="${item.image}" style="width:100%;border-radius:8px;margin-bottom:8px;"><h4>${item.title}</h4><p>${item.description}</p><small>📍 ${item.location}, Floor ${item.floor}</small><br><small>🕒 ${date}</small>`;
            container.appendChild(d);
        });
    }

    chatToggle.addEventListener('click', ()=> { itemChatModal.classList.remove('hidden'); setTimeout(()=> itemChatModal.classList.add('open'), 10); });
    closeChat.addEventListener('click', ()=> { itemChatModal.classList.remove('open'); setTimeout(()=> itemChatModal.classList.add('hidden'), 420); });
    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e)=> { if(e.key === 'Enter') sendMessage(); });

    function sendMessage(){ const txt = msgInput.value.trim(); if(!txt) return; const p = document.createElement('div'); p.className = 'bubble me'; p.textContent = txt; msgBox.appendChild(p); msgInput.value = ''; msgBox.scrollTop = msgBox.scrollHeight; }

    window.openChatById = function(id){ const it = items.find(x=>x.id===id); if(!it) return alert('Item not found'); document.getElementById('chatItemTitle').textContent = 'Chat: '+it.title; itemChatModal.classList.remove('hidden'); setTimeout(()=> itemChatModal.classList.add('open'), 10); }
    window.showAIMatch = function(id){ const picks = items.filter(x=>x.id!==id).slice(0,2); if(!picks.length) return alert('No similar items'); highlightItems(picks); alert('Suggested possible matches (mock).'); }

    renderItems();
});