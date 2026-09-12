const RESEND_API = 'https://api.resend.com/emails';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
}
const env = (name) => process.env[name] || '';
const siteUrl = () => (env('SITE_URL') || 'https://fluxcord.store').replace(/\/$/, '');
function fromAddress() { const raw=env('RESEND_FROM_EMAIL'); return raw ? (raw.includes('<') ? raw : `Fluxcord <${raw}>`) : ''; }
function emailShell({preheader,eyebrow,title,intro,body='',ctaText,ctaUrl}) {
  const cta = ctaText && ctaUrl ? `<a href="${esc(ctaUrl)}" style="display:inline-block;padding:13px 20px;border-radius:12px;background:#f59e0b;color:#0a0a0f;text-decoration:none;font-weight:800">${esc(ctaText)}</a>` : '';
  return `<!doctype html><html><body style="margin:0;background:#080a0f;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader||'Fluxcord account notification')}</div><div style="padding:34px 14px"><div style="max-width:620px;margin:0 auto;background:#10131a;border:1px solid #ffffff14;border-radius:22px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)"><div style="padding:25px 28px;border-bottom:1px solid #ffffff12"><div style="font-size:20px;font-weight:900;letter-spacing:.8px;color:#fff">FLUX<span style="color:#f59e0b">CORD</span></div><div style="margin-top:8px;font-size:11px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#f59e0b">${esc(eyebrow||'ACCOUNT')}</div></div><div style="padding:32px 28px"><h1 style="margin:0 0 12px;font-size:29px;line-height:1.15;color:#fff">${esc(title)}</h1><p style="margin:0 0 20px;color:#b8bdc9;font-size:15px;line-height:1.7">${esc(intro||'')}</p>${body}${cta?`<div style="margin-top:25px">${cta}</div>`:''}<p style="margin:28px 0 0;color:#777f8e;font-size:12px;line-height:1.6">If you did not request this, you can safely ignore this email.</p></div><div style="padding:18px 28px;border-top:1px solid #ffffff12;color:#727a89;font-size:12px;line-height:1.6">Fluxcord · Premium digital resources<br>This is an automated message — please do not reply.</div></div></div></body></html>`;
}
async function sendEmail({to,subject,html,text}) {
  const key=env('RESEND_API_KEY'), from=fromAddress();
  if(!key) throw new Error('RESEND_API_KEY is not configured in Vercel.');
  if(!from) throw new Error('RESEND_FROM_EMAIL is not configured in Vercel.');
  const r=await fetch(RESEND_API,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject,html,text:text||subject})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.message||data?.name||`Resend returned ${r.status}.`);
  return data;
}
async function generateAuthLink({type,email,password,data,redirectTo,newEmail}) {
  const base=(env('SUPABASE_URL')||env('NEXT_PUBLIC_SUPABASE_URL')).replace(/\/$/,'');
  const secret=env('SUPABASE_SECRET_KEY');
  if(!base||!secret) throw new Error('Server Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.');
  const payload={type,email};
  if(password) payload.password=password;
  if(data) payload.data=data;
  if(redirectTo) payload.redirect_to=redirectTo;
  if(newEmail) payload.new_email=newEmail;
  const r=await fetch(`${base}/auth/v1/admin/generate_link`,{method:'POST',headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const out=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(out?.msg||out?.message||out?.error_description||`Supabase Auth returned ${r.status}.`);
  return out;
}
async function main(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  let body={}; try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}')}catch{return json(res,400,{error:'Invalid JSON body.'})}
  const action=body.action, email=String(body.email||'').trim().toLowerCase();
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res,400,{error:'Enter a valid email address.'});
  try{
    if(action==='register'){
      const password=String(body.password||''),first=String(body.firstName||'').trim(),last=String(body.lastName||'').trim();
      if(password.length<6) return json(res,400,{error:'Password must be at least 6 characters.'});
      const link=await generateAuthLink({type:'signup',email,password,data:{full_name:`${first} ${last}`.trim(),name:`${first} ${last}`.trim()},redirectTo:`${siteUrl()}/login.html`});
      const url=link?.properties?.action_link||link?.action_link;
      if(!url) throw new Error('Supabase did not return a confirmation link.');
      const name=first||email.split('@')[0];
      const html=emailShell({preheader:'Confirm your Fluxcord account',eyebrow:'WELCOME TO FLUXCORD',title:`Welcome, ${name}.`,intro:'Your Fluxcord account is almost ready. Confirm your email address to activate it.',body:'<div style="padding:16px 18px;border:1px solid #ffffff12;background:#0c0f15;border-radius:14px;color:#aeb4c0;font-size:13px;line-height:1.7">This confirmation link is personal to you and should not be forwarded.</div>',ctaText:'Confirm my email',ctaUrl:url});
      await sendEmail({to:email,subject:'Confirm your Fluxcord account',html,text:`Welcome to Fluxcord. Confirm your email: ${url}`});
      return json(res,200,{ok:true,message:'Account created. Check your email to confirm your account.'});
    }
    if(action==='recovery'){
      try{const link=await generateAuthLink({type:'recovery',email,redirectTo:`${siteUrl()}/reset-password.html`});const url=link?.properties?.action_link||link?.action_link;if(url){const html=emailShell({preheader:'Reset your Fluxcord password',eyebrow:'SECURITY',title:'Reset your password',intro:'We received a request to reset your Fluxcord password.',body:'<div style="padding:16px 18px;border:1px solid #ffffff12;background:#0c0f15;border-radius:14px;color:#aeb4c0;font-size:13px;line-height:1.7">If you did not request this, ignore this email. Your current password remains unchanged.</div>',ctaText:'Reset password',ctaUrl:url});await sendEmail({to:email,subject:'Reset your Fluxcord password',html,text:`Reset your Fluxcord password: ${url}`})}}catch(e){console.error('recovery:',e)}
      return json(res,200,{ok:true,message:'If an account exists for that email, a password reset email has been sent.'});
    }
    if(action==='magiclink'){
      const link=await generateAuthLink({type:'magiclink',email,redirectTo:`${siteUrl()}/account.html`});const url=link?.properties?.action_link||link?.action_link;if(!url)throw new Error('Could not create a magic link.');
      const html=emailShell({preheader:'Your secure Fluxcord sign-in link',eyebrow:'ONE-TIME SIGN IN',title:'Sign in to Fluxcord',intro:'Use this secure link to sign in. It is intended for you only.',ctaText:'Sign in securely',ctaUrl:url});
      await sendEmail({to:email,subject:'Your Fluxcord sign-in link',html,text:`Sign in to Fluxcord: ${url}`});
      return json(res,200,{ok:true,message:'Check your email for a secure sign-in link.'});
    }
    return json(res,400,{error:'Unknown email action.'});
  }catch(e){console.error('auth email error:',e);return json(res,500,{error:e?.message||'Unable to process the email request.'})}
}
module.exports=main;
