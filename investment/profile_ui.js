'use strict';
function renderProfileName(){document.querySelector('#profile-name').textContent=profileSettings.name||'My profile';}
function openProfileSettings(){
 const dialog=document.querySelector('#profile-settings'),body=document.querySelector('#settings-body');body.replaceChildren();
 const form=element('form');form.id='profile-settings-form';body.append(form);
 const intro=element('p','Configure each holding separately by account. Purchase prices and minimum acceptable stock bids use the account’s currency. A blank minimum bid uses purchase-price break-even. For CAD accounts, enter the actual purchase-time CAD per USD rate to recover the original USD purchase price for strike selection. Today’s FX values current proceeds and CAD break-even. Missing purchase FX is never filled from today’s rate. Your separate 5% stock-loss warning remains active.','context');form.append(intro);
 form.append(element('p','Initial purchase prices are averages derived from saved broker book costs. Replace them with your verified original prices. Option sale premiums remain managed in the stock’s entry-price editor.','context'));
 const fields=element('div',undefined,'fields');form.append(fields);
 const nameLabel=element('label','Profile name'),name=element('input');name.type='text';name.maxLength=60;name.value=profileSettings.name||'';name.placeholder='My profile';nameLabel.append(name);fields.append(nameLabel);
 const rows=[];
 for(const account of accounts){
  const effective=EntryPrices.apply(account,entryOverrides);
  form.append(element('h3',`${account.account} · ${account.currency}`));
  const wrap=element('div',undefined,'table-scroll'),table=element('table');wrap.append(table);form.append(wrap);
  const header=element('thead'),tr=element('tr');header.append(tr);table.append(header);
  for(const label of ['Holding','Original purchase price / share','Minimum acceptable stock bid / share','Purchase FX (CAD per USD)','Restore']){const th=element('th',label);th.scope='col';tr.append(th);}
  const body=element('tbody');table.append(body);
  for(const position of account.positions||[]){
   const current=effective.positions.find(p=>p.symbol===position.symbol),row=element('tr');body.append(row);
   row.append(element('td',`${position.symbol} · ${position.shares} shares`));
   function input(label,value,required){const td=element('td'),node=element('input');node.type='number';node.min='0.00000001';node.step='any';node.required=required;node.value=value==null?'':String(value);node.setAttribute('aria-label',`${account.account} ${position.symbol} ${label} (${account.currency}/share)`);td.append(node);row.append(td);return node;}
   const purchase=input('original purchase price',current.cost===null?null:current.cost/current.shares,true);
   const bid=input('minimum acceptable stock bid',profileSettings.holdings?.[ProfileSettings.key(account,position)]?.minimumBid??null,false);
   const fx=input('purchase FX CAD per USD',account.currency==='CAD'?current.entryFx:null,false);
   fx.disabled=account.currency!=='CAD';fx.placeholder=account.currency==='CAD'?'Enter historical rate':'Not needed';
   bid.placeholder=purchase.value;
   purchase.addEventListener('input',()=>{bid.placeholder=purchase.value;});
   const td=element('td'),reset=element('button','Original values');reset.type='button';td.append(reset);row.append(td);
   reset.addEventListener('click',()=>{purchase.value=position.cost===null?'':String(position.cost/position.shares);bid.value='';bid.placeholder=purchase.value;fx.value=position.entryFx??'';});
   rows.push({account,position,current,purchase,bid,fx});
  }
 }
 const actions=element('div',undefined,'entry-actions');form.append(actions);
 const save=element('button','Save settings');save.type='submit';save.className='primary';actions.append(save);
 const cancel=element('button','Cancel');cancel.type='button';cancel.addEventListener('click',()=>dialog.close());actions.append(cancel);
 const status=element('p',undefined,'context');status.setAttribute('role','status');form.append(status);
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const nextProfile={name:name.value.trim(),holdings:{...profileSettings.holdings}},nextEntries={...entryOverrides};
  try{
   for(const {account,position,current,purchase,bid,fx} of rows){
    const value=bid.value.trim()===''?null:Number(bid.value);ProfileSettings.validateMinimum(value);
    const holdingKey=ProfileSettings.key(account,position);
    if(value===null)delete nextProfile.holdings[holdingKey];else nextProfile.holdings[holdingKey]={minimumBid:value};
    const stockPrice=Number(purchase.value);if(!Number.isFinite(stockPrice)||stockPrice<=0)throw new Error('Enter a positive purchase price.');
    const entryKey=EntryPrices.key(account,position),existing=entryOverrides[entryKey];
    // Preserve the option premium, including a USD entry previously converted to CAD.
    const optionPrice=existing?.optionPrice!=null?current.premium/(current.contracts*100):null;
    const original=position.cost===null?null:position.cost/position.shares;
    const entryFx=account.currency==='CAD'&&fx.value.trim()!==''?Number(fx.value):null;
    if(entryFx!==null&&(!Number.isFinite(entryFx)||entryFx<=0))throw new Error('Enter a positive purchase FX.');
    if(stockPrice===original&&optionPrice===null&&entryFx===null)delete nextEntries[entryKey];
    else nextEntries[entryKey]={currency:account.currency,stockPrice:stockPrice===original?null:stockPrice,optionPrice,entryFx};
   }
  }catch(error){status.textContent=error.message;return;}
  profileSettings=nextProfile;entryOverrides=nextEntries;
  let persisted=true;
  try{localStorage.setItem(ProfileSettings.STORAGE_KEY,JSON.stringify(nextProfile));localStorage.setItem(EntryPrices.STORAGE_KEY,JSON.stringify(nextEntries));}catch{persisted=false;}
  renderProfileName();renderAccounts();renderStockDetails();
  status.textContent=persisted?'Settings saved in this browser. Purchase prices, P/L and bid thresholds updated.':'Settings apply for this session. Browser storage is unavailable; changes may be lost on reload.';
 });
 dialog.showModal();
 document.querySelector('#profile-menu').classList.remove('open');document.querySelector('#profile-button').setAttribute('aria-expanded','false');
}
const profileMenu=document.querySelector('#profile-menu'),profileButton=document.querySelector('#profile-button');
profileButton.addEventListener('click',()=>{profileMenu.classList.toggle('open');profileButton.setAttribute('aria-expanded',String(profileMenu.classList.contains('open')));});
profileMenu.addEventListener('mouseenter',()=>profileButton.setAttribute('aria-expanded','true'));
profileMenu.addEventListener('mouseleave',()=>{if(!profileMenu.contains(document.activeElement)){profileMenu.classList.remove('open');profileButton.setAttribute('aria-expanded','false');}});
document.querySelector('#open-settings').addEventListener('click',openProfileSettings);
document.querySelector('#close-settings').addEventListener('click',()=>document.querySelector('#profile-settings').close());
renderProfileName();
