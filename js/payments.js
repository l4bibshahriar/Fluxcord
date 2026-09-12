/* Public checkout destinations. Replace the placeholders with your real payment details. */
window.FLUXCORD_PAYMENTS={
  bKash:{label:'bKash',type:'mobile',destination:'YOUR_BKASH_NUMBER'},
  Nagad:{label:'Nagad',type:'mobile',destination:'YOUR_NAGAD_NUMBER'},
  Bitcoin:{label:'Bitcoin',type:'crypto',destination:'YOUR_BTC_ADDRESS',symbol:'BTC'},
  Litecoin:{label:'Litecoin',type:'crypto',destination:'YOUR_LTC_ADDRESS',symbol:'LTC'},
  USDT:{label:'USDT',type:'crypto',destination:'YOUR_USDT_ADDRESS',symbol:'USDT',network:'TRC20'}
};
function renderPaymentDestination(method){const p=window.FLUXCORD_PAYMENTS?.[method],box=document.querySelector('#paymentDestination');if(!box||!p)return;if(p.destination.startsWith('YOUR_')){box.innerHTML=`<b>${p.label}</b><p>Payment destination is not configured yet.</p>`;return}box.innerHTML=`<b>Send payment to</b><div class="payment-destination"><span>${p.network?escapeHtml(p.network)+' · ':''}${escapeHtml(p.destination)}</span><button class="btn small outline" onclick="navigator.clipboard?.writeText('${escapeHtml(p.destination)}');toast('Payment destination copied.','success')">Copy</button></div>`}
