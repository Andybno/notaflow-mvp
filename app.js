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
let activeRestaurantId=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const save=()=>localStorage.setItem("notaflow-data",JSON.stringify(data));
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const legacyPhones=["(11) 99911-2200","(11) 97733-4400","(11) 96644-5500","(11) 95555-6600","(11) 94444-7700"];
const initialUsers=[
  [["Mariana Souza","(11) 99911-2200"],["Carlos Lima","(11) 98822-3300"]],
  [["Pedro Martins","(11) 97733-4400"]],
  [["Ana Ribeiro","(11) 96644-5500"]],
  [["Carlos Lima","(11) 95555-6600"]],
  [["Juliana Alves","(11) 94444-7700"]]
];
data.restaurants.forEach((restaurant,index)=>{
  if(!Array.isArray(restaurant.users)){
    const count=Number(restaurant.users)||0;
    restaurant.users=Array.from({length:count},(_,userIndex)=>({
      id:Date.now()+index*10+userIndex,
      name:initialUsers[index]?.[userIndex]?.[0]||(userIndex===0?restaurant.manager:`Usuário ${userIndex+1}`),
      phone:initialUsers[index]?.[userIndex]?.[1]||(userIndex===0?(restaurant.phone||legacyPhones[index]||"Telefone não informado"):"Telefone não informado")
    }));
  }
});
save();
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
  $("#restaurantGrid").innerHTML=data.restaurants.map(r=>`<article class="restaurant-card"><span class="unit-icon">◇</span><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.cnpj)}</p><p>Responsável: ${escapeHtml(r.manager)}</p><footer><span>${r.users.length} usuário(s)</span><span class="active-label">● Ativo</span></footer><div class="restaurant-actions"><button class="manage-users" data-users="${r.id}">Configurar usuários</button><span class="users-total">${r.users.length}</span></div></article>`).join("");
}
function showPage(pageId,title){
  $$(".page").forEach(page=>page.classList.remove("active"));
  $("#"+pageId).classList.add("active");
  $("#pageTitle").textContent=title;
  $$(".nav-item").forEach(item=>item.classList.toggle("active",item.dataset.page===pageId||(pageId==="usuarios"&&item.dataset.page==="restaurantes")));
  $(".sidebar").classList.remove("open");
}
function resetUserForm(){
  $("#userForm").reset();
  $("#userForm [name='userId']").value="";
  $("#userFormTitle").textContent="Adicionar usuário";
  $("#saveUser").textContent="Adicionar usuário";
  $("#cancelUserEdit").classList.add("hidden");
}
function openUsers(restaurantId){
  const restaurant=data.restaurants.find(r=>r.id===restaurantId);
  if(!restaurant)return;
  activeRestaurantId=restaurantId;
  $("#usersRestaurantName").textContent=restaurant.name;
  resetUserForm();
  renderUsers();
  showPage("usuarios","Usuários");
}
function renderUsers(){
  const restaurant=data.restaurants.find(r=>r.id===activeRestaurantId);
  if(!restaurant)return;
  const count=restaurant.users.length;
  $("#usersTotal").textContent=`${count} ${count===1?"usuário":"usuários"}`;
  $("#usersList").innerHTML=count?restaurant.users.map(user=>`<article class="user-row"><div class="user-identity"><span class="user-initial">${escapeHtml(user.name.trim().charAt(0).toUpperCase()||"?")}</span><div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.phone)}</small></div></div><div class="user-actions"><button class="edit-user" data-edit-user="${user.id}">Editar</button><button class="remove-user" data-remove-user="${user.id}">Remover</button></div></article>`).join(""):'<div class="users-empty">Nenhum usuário cadastrado neste restaurante.</div>';
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
$$(".nav-item").forEach(b=>b.onclick=()=>showPage(b.dataset.page,b.dataset.page==="inicio"?"Visão geral":"Restaurantes"));
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
$("#restaurantGrid").onclick=e=>{const button=e.target.closest("[data-users]");if(button)openUsers(+button.dataset.users)};
$("#backToRestaurants").onclick=()=>showPage("restaurantes","Restaurantes");
$("#cancelUserEdit").onclick=resetUserForm;
$("#usersList").onclick=e=>{
  const restaurant=data.restaurants.find(r=>r.id===activeRestaurantId);
  if(!restaurant)return;
  const editButton=e.target.closest("[data-edit-user]");
  const removeButton=e.target.closest("[data-remove-user]");
  if(editButton){
    const user=restaurant.users.find(item=>item.id===+editButton.dataset.editUser);
    if(!user)return;
    $("#userForm [name='userId']").value=user.id;
    $("#userForm [name='userName']").value=user.name;
    $("#userForm [name='userPhone']").value=user.phone;
    $("#userFormTitle").textContent="Editar usuário";
    $("#saveUser").textContent="Salvar alterações";
    $("#cancelUserEdit").classList.remove("hidden");
    $("#userForm [name='userName']").focus();
  }
  if(removeButton){
    restaurant.users=restaurant.users.filter(item=>item.id!==+removeButton.dataset.removeUser);
    save();renderUsers();renderRestaurants();resetUserForm();toast("Usuário removido.");
  }
};
$("#userForm").onsubmit=e=>{
  e.preventDefault();
  const restaurant=data.restaurants.find(r=>r.id===activeRestaurantId);
  if(!restaurant)return;
  const form=new FormData(e.target);
  const id=Number(form.get("userId"));
  const user={id:id||Date.now(),name:form.get("userName").trim(),phone:form.get("userPhone").trim()};
  if(id){
    const index=restaurant.users.findIndex(item=>item.id===id);
    if(index>=0)restaurant.users[index]=user;
  }else restaurant.users.push(user);
  save();renderUsers();renderRestaurants();resetUserForm();toast(id?"Usuário atualizado.":"Usuário adicionado.");
};
$("#restaurantForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.restaurants.push({id:Date.now(),name:f.get("name"),cnpj:f.get("cnpj"),manager:f.get("manager"),phone:f.get("phone"),users:[{id:Date.now()+1,name:f.get("manager"),phone:f.get("phone")}],active:true});save();fillFilter();render();e.target.reset();$("#restaurantDialog").close();toast("Restaurante adicionado ao plano.")};
fillFilter();render();
