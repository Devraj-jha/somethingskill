(()=>{const {skills:SKL,roles:ROLES,resources:RES}=window.DEMO,$=s=>document.querySelector(s),LV=['None','Beginner','Intermediate','Proficient'];
const ST={possessed:'Possessed',improve:'Needs improvement',missing:'Missing'},nm=id=>SKL.find(s=>s.id===id).name;
$('#lg').innerHTML=LOGO;$('#lg svg').style.width='30px';
let S={role:ROLES[1].id,lv:{},prog:{},tab:'gap'};try{Object.assign(S,JSON.parse(localStorage.getItem('sp-demo')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('sp-demo',JSON.stringify(S))}catch(e){}};
const role=()=>ROLES.find(r=>r.id===S.role)||ROLES[0],col=p=>p>=80?'var(--teal)':p>=50?'var(--gold)':'var(--red)';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bar=(p,c)=>`<div class="bar"><i style="width:${p}%;background:${c||col(p)}"></i></div>`;
function calc(){const r=role(),items=r.skills.map(x=>{const l=S.lv[x.skill]||0,ratio=x.req>0?Math.min(l/x.req,1):1;return{...x,name:nm(x.skill),l,ratio,status:l>=x.req?'possessed':l>0?'improve':'missing'}});
 const tw=items.reduce((a,i)=>a+i.weight,0);return{items,score:Math.round(items.reduce((a,i)=>a+i.weight*i.ratio,0)/tw*1000)/10}}
function recs(items,score){const gaps=items.filter(i=>i.status!=='possessed').sort((a,b)=>b.weight*(1-b.ratio)-a.weight*(1-a.ratio)),out=[];
 gaps.forEach(g=>{const all=RES.filter(r=>r.skills.includes(g.skill)),m=all.filter(r=>g.status==='missing'?r.type!=='practice':r.type!=='course'||r.level!=='Beginner');(m.length?m:all).forEach(r=>{if(!out.find(o=>o.title===r.title))out.push({...r,f:g.name,why:g.status==='missing'?'Foundational: no knowledge recorded yet':'Practice: move from level '+g.l+' to '+g.req})})});
 const ids=gaps.map(g=>g.skill);let p=role().projects.filter(x=>x.skills.some(s=>ids.includes(s)));if(score>=80||!p.length)p=role().projects;return{out,p}}
function left(){$('#sk').innerHTML=role().skills.map(x=>{const l=S.lv[x.skill]||0;return`<div class="sr"><div>${esc(nm(x.skill))}<small>needs level ${x.req} · importance ${x.weight}/5</small></div><div class="seg" role="radiogroup" aria-label="${esc(nm(x.skill))} level">${[0,1,2,3].map(n=>`<span><input type="radio" name="s_${x.skill}" id="s_${x.skill}${n}" value="${n}" data-s="${x.skill}" ${l===n?'checked':''}><label for="s_${x.skill}${n}" title="${LV[n]}">${n}</label></span>`).join('')}</div></div>`}).join('')}
function right(){const{items,score}=calc(),c=k=>items.filter(i=>i.status===k).length;
 $('#ring').innerHTML=`<div class="ring"><svg viewBox="0 0 120 120" width="132" height="132"><circle cx="60" cy="60" r="50" fill="none" style="stroke:var(--soft)" stroke-width="11"/><circle cx="60" cy="60" r="50" fill="none" style="stroke:${col(score)};transition:stroke-dasharray .6s" stroke-width="11" stroke-linecap="round" stroke-dasharray="${3.1416*score} 314.16"/></svg><b>${Math.round(score)}%</b></div>`;
 $('#rt').textContent='Match for '+role().title;$('#cn').innerHTML=['possessed','improve','missing'].map(k=>`<span class="tag ${k}">${c(k)} ${ST[k]}</span>`).join('');
 document.querySelectorAll('#tb button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===S.tab));let h='';
 if(S.tab==='gap'){const top=items.filter(i=>i.status==='possessed').sort((a,b)=>b.weight-a.weight).slice(0,3).map(i=>i.name);
  h=`<p style="font-size:.9rem"><b>Strongest:</b> ${top.map(esc).join(', ')||'none yet'}<br><b>To improve:</b> ${items.filter(i=>i.status==='improve').map(i=>esc(i.name)).join(', ')||'none'}<br><b>To start:</b> ${items.filter(i=>i.status==='missing').map(i=>esc(i.name)).join(', ')||'none'}</p>`+items.map(i=>`<div style="margin-bottom:10px"><div class="flex" style="justify-content:space-between;gap:8px"><span>${esc(i.name)}</span><span class="tag ${i.status}">${ST[i.status]} · ${i.l}/${i.req}</span></div>${bar(i.ratio*100)}</div>`).join('')}
 if(S.tab==='rec'){const{out}=recs(items,score);h=out.length?out.slice(0,8).map(r=>`<div class="sr"><div><b>${esc(r.title)}</b><small>${esc(r.provider)} · ${esc(r.type)} · ${esc(r.level)} · for ${esc(r.f)}<br>${esc(r.why)}</small></div><a class="btn sm ghost" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open</a></div>`).join(''):'<p>No gaps found, so no learning resources are needed. Try a project below.</p>'}
 if(S.tab==='map')h=[1,2,3].map(n=>{const l=role().skills.filter(x=>x.stage===n),d=l.filter(x=>S.prog[x.skill]==='done').length;return`<h3 style="margin-top:${n>1?16:0}px">Stage ${n}: ${['Foundation','Intermediate','Advanced'][n-1]}</h3>${bar(l.length?d/l.length*100:0,'var(--teal)')}`+l.map(x=>`<div class="sr"><span>${esc(nm(x.skill))}</span><select data-p="${x.skill}" style="width:122px;padding:.3em" aria-label="Status of ${esc(nm(x.skill))}">${[['','Not started'],['planned','Planned'],['progress','In progress'],['done','Completed']].map(o=>`<option value="${o[0]}" ${(S.prog[x.skill]||'')===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>`).join('')}).join('')
 if(S.tab==='prj')h=recs(items,score).p.map(p=>`<div class="sr"><div><b>${esc(p.name)}</b> <span class="tag">${esc(p.level)}</span><small>${esc(p.description)}<br>Builds: ${p.skills.map(s=>esc(nm(s))).join(', ')}</small></div></div>`).join('');
 $('#pane').innerHTML=h}
function top(){$('#roles').innerHTML=ROLES.map(r=>`<button class="chip" data-r="${r.id}" aria-pressed="${r.id===S.role}">${esc(r.title)}</button>`).join('');
 $('#pre').innerHTML=[['b','Beginner'],['m','Intermediate'],['a','Advanced']].map(x=>`<button class="chip" data-pre="${x[0]}" aria-pressed="false">${x[1]}</button>`).join('')}
const PRE={b:(x,i)=>i%2?0:1,m:(x,i)=>Math.max(0,Math.min(x.req,2)-(i%3===0?1:0)),a:(x,i)=>i%4===0?Math.max(0,x.req-1):x.req};
const all=()=>{top();left();right()};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.r){S.role=b.dataset.r;S.prog={};all()}else if(b.dataset.pre){S.lv={};role().skills.forEach((x,i)=>S.lv[x.skill]=PRE[b.dataset.pre](x,i));left();right()}else if(b.id==='reset'){S.lv={};S.prog={};left();right()}else if(b.dataset.t){S.tab=b.dataset.t;right()}save()});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.s){S.lv[t.dataset.s]=+t.value;right()}if(t.dataset.p){S.prog[t.dataset.p]=t.value;right()}save()});
all()})();
