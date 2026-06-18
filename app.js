const seed = {
  items: [
    ["Salmão fresco","Restaurante Vila Mariana","8 kg","09:18","NF 48291"],
    ["Cream cheese","Restaurante Vila Mariana","12 unidades","09:18","NF 48291"],
    ["Pão brioche","Unidade Mooca","6 pacotes","11:42","NF 10984"],
    ["Molho de tomate","Unidade Tatuapé","10 unidades","13:07","NF 33710"],
    ["Farinha de trigo","Unidade Tatuapé","25 kg","13:07","NF 33710"],
    ["Óleo de cozinha","Unidade Pinheiros","4 caixas","14:22","NF 77402"],
    ["Arroz tipo 1","Unidade Pinheiros","15 kg","14:22","NF 77402"],
    ["Café em grãos","Unidade Paulista","5 pacotes","15:05","NF 55126"]
  ].map((x,i)=>({id:i+1,item:x[0],restaurant:x[1],quantity:x[2],time:x[3],invoice:x[4],status:"pending",selected:true})),
  restaurants: [
    ["Restaurante Vila Mariana","12.345.678/0001-10","Mariana Souza",2],
    ["Unidade Mooca","12.345.678/0002-09","Pedro Martins",1],
    ["Unidade Tatuapé","12.345.678/0003-80","Ana Ribeiro",1],
    ["Unidade Pinheiros","12.345.678/0004-61","Carlos Lima",1],
    ["Unidade Paulista","12.345.678/0005-42","Juliana Alves",1]
  ].map((x,i)=>({id:i+1,name:x[0],cnpj:x[1],manager:x[2],users:x[3],active:true}))
};
let data=JSON.parse(localStorage.getItem("notaflow-data")||"null")||seed;
let activeItem=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const save=()=>localStorage.setItem("notaflow-data",JSON.stringify(data));
function toast(text){const el=$("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function render(){
  const filter=$("#restaurantFilter").value;
  const pending=data.items.filter(i=>i.status==="pending"&&(!filter||i.restaurant===filter));
  $("#itemsTable").innerHTML=pending.map(i=>`<tr><td><input class="row-check" type="checkbox" data-id="${i.id}" ${i.selected?"checked":""}></td><td><strong>${i.item}</strong><span class="sub">${i.invoice}</span></td><td>${i.restaurant}</td><td>${i.quantity}</td><td>Hoje, ${i.time}</td><td><span class="status">Aguardando</span></td><td><button class="review" data-review="${i.id}">Revisar →</button></td></tr>`).join("");
  $("#emptyState").classList.toggle("hidden",pending.length>0);
  const allPending=data.items.filter(i=>i.status==="pending"), selected=allPending.filter(i=>i.selected);
  $("#pendingCount").textContent=allPending.length; $("#approvedCount").textContent=data.items.filter(i=>i.status==="approved").length;
  $("#restaurantCount").textContent=data.restaurants.filter(r=>r.active).length;
  $("#approveAllLabel").textContent=`${selected.length} ${selected.length===1?"item selecionado":"itens selecionados"}`;
  $("#masterCheck").checked=allPending.length>0&&allPending.every(i=>i.selected);
  renderRestaurants();
}
function fillFilter(){
  const current=$("#restaurantFilter").value;
  $("#restaurantFilter").innerHTML='<option value="">Todos os restaurantes</option>'+data.restaurants.map(r=>`<option>${r.name}</option>`).join("");
  $("#restaurantFilter").value=current;
}
function renderRestaurants(){
  $("#restaurantGrid").innerHTML=data.restaurants.map(r=>`<article class="restaurant-card"><span class="unit-icon">◇</span><h3>${r.name}</h3><p>${r.cnpj}</p><p>Responsável: ${r.manager}</p><footer><span>${r.users} usuário(s)</span><span class="active-label">● Ativo</span></footer></article>`).join("");
}
function openItem(id){
  activeItem=data.items.find(i=>i.id===id); if(!activeItem)return;
  $("#dialogItem").textContent=activeItem.item;$("#dialogRestaurant").textContent=activeItem.restaurant;
  $("#dialogQuantity").value=activeItem.quantity;$("#dialogDescription").value=activeItem.item;
  $("#receiptPreview").textContent=`${activeItem.restaurant.toUpperCase()}\n\nDOCUMENTO AUXILIAR DA NOTA FISCAL\n${activeItem.invoice}\n\n--------------------------------\nITEM                         QTD\n${activeItem.item.padEnd(24)} ${activeItem.quantity}\n--------------------------------\n\nRecebido via WhatsApp às ${activeItem.time}\nLeitura automática NotaFlow`;
  $("#itemDialog").showModal();
}
function setStatus(status){
  if(!activeItem)return;
  activeItem.item=$("#dialogDescription").value.trim()||activeItem.item;activeItem.quantity=$("#dialogQuantity").value.trim()||activeItem.quantity;activeItem.status=status;activeItem.selected=false;
  save();$("#itemDialog").close();render();toast(status==="approved"?"Item aprovado com sucesso.":"Item recusado e retirado da fila.");
}
$$(".nav-item").forEach(b=>b.onclick=()=>{$$(".nav-item,.page").forEach(e=>e.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.page).classList.add("active");$("#pageTitle").textContent=b.dataset.page==="inicio"?"Visão geral":"Restaurantes";$(".sidebar").classList.remove("open")});
$("#menuButton").onclick=()=>$(".sidebar").classList.toggle("open");
$("#restaurantFilter").onchange=render;
$("#itemsTable").onclick=e=>{const b=e.target.closest("[data-review]");if(b)openItem(+b.dataset.review)};
$("#itemsTable").onchange=e=>{if(e.target.matches(".row-check")){data.items.find(i=>i.id===+e.target.dataset.id).selected=e.target.checked;save();render()}};
$("#masterCheck").onchange=e=>{data.items.filter(i=>i.status==="pending").forEach(i=>i.selected=e.target.checked);save();render()};
$("#selectAll").onclick=()=>{data.items.filter(i=>i.status==="pending").forEach(i=>i.selected=true);save();render()};
$("#approveAll").onclick=()=>{const selected=data.items.filter(i=>i.status==="pending"&&i.selected);if(!selected.length)return toast("Selecione ao menos um item.");selected.forEach(i=>{i.status="approved";i.selected=false});save();render();toast(`${selected.length} item(ns) aprovado(s).`)};
$("#approveItem").onclick=()=>setStatus("approved");$("#rejectItem").onclick=()=>setStatus("rejected");
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close());
$("#newRestaurant").onclick=()=>$("#restaurantDialog").showModal();
$("#restaurantForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.restaurants.push({id:Date.now(),name:f.get("name"),cnpj:f.get("cnpj"),manager:f.get("manager"),phone:f.get("phone"),users:1,active:true});save();fillFilter();render();e.target.reset();$("#restaurantDialog").close();toast("Restaurante adicionado ao plano.")};
fillFilter();render();
