/* Per-stock/account profit thresholds, alongside the existing entry-price store. */
(function(root){
'use strict';
const STORAGE_KEY='covered-call-profile-v1';
function key(account,position){return JSON.stringify([account.account,account.currency,position.symbol]);}
function minimumBid(account,position,settings){
 const value=settings.holdings?.[key(account,position)]?.minimumBid;
 return Number.isFinite(value)&&value>0?value:position.cost===null?null:position.cost/position.shares;
}
function validateMinimum(value){if(value!==null&&(!Number.isFinite(value)||value<=0))throw new Error('Minimum bids must be positive prices or blank for purchase-price break-even.');return value;}
const api={STORAGE_KEY,key,minimumBid,validateMinimum};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ProfileSettings=api;
})(typeof globalThis!=='undefined'?globalThis:this);
