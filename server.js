// SkillPath – zero-dependency Node server. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const seed=require('./seed'),D=path.join(__dirname,'data'),P=path.join(__dirname,'public'),PORT=process.env.PORT||3000;
fs.mkdirSync(D,{recursive:true});
const file=n=>path.join(D,n+'.json');
const load=n=>JSON.parse(fs.readFileSync(file(n),'utf8'));
const save=(n,d)=>{const t=file(n)+'.tmp';fs.writeFileSync(t,JSON.stringify(d,null,2));fs.renameSync(t,file(n));}; // atomic write
const hash=(pw,salt=crypto.randomBytes(16).toString('hex'))=>salt+':'+crypto.scryptSync(pw,salt,64).toString('hex');
const verify=(pw,h)=>{const[s,k]=h.split(':'),a=Buffer.from(k,'hex'),b=crypto.scryptSync(pw,s,64);return a.length===b.length&&crypto.timingSafeEqual(a,b)};
const uid=()=>crypto.randomBytes(8).toString('hex');
const mk=(role,name,email,pw,extra={})=>({id:uid(),role,name,email,password:hash(pw),created:new Date().toISOString(),...extra});
const defaults={'users':()=>[mk('admin','Demo Administrator','admin@skillpath.demo','Admin@123'),mk('student','Aarav Sharma (demo)','student@skillpath.demo','Student@123',{college:'Demo Institute of Technology',programme:'B.Tech CSE',semester:5})],
'student-profiles':()=>({}),'skills':()=>seed.skills,'job-roles':()=>seed.roles,'resources':()=>seed.resources,'assessments':()=>[],'learning-progress':()=>({})};
for(const n in defaults)if(!fs.existsSync(file(n)))save(n,defaults[n]());
const SECRET=process.env.SESSION_SECRET||'skillpath-demo-secret-change-me';const sign=s=>crypto.createHmac('sha256',SECRET).update(s).digest('hex'); // stateless signed sessions (works on serverless)
const TTL=7*864e5;
const send=(res,code,obj,h={})=>{res.writeHead(code,{'Content-Type':'application/json','X-Content-Type-Options':'nosniff',...h});res.end(JSON.stringify(obj))};
const body=req=>new Promise((ok,no)=>{let b='';req.on('data',c=>{b+=c;if(b.length>2e5){no({code:413,msg:'Payload too large'});req.destroy()}});req.on('end',()=>{try{ok(b?JSON.parse(b):{})}catch{no({code:400,msg:'Invalid JSON'})}})});
const cookie=req=>Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(c=>{const i=c.indexOf('=');return[c.slice(0,i).trim(),c.slice(i+1)]}));
const getUser=req=>{const[i,e,m]=(cookie(req).sid||'').split('.');if(!m||+e<Date.now())return null;const a=Buffer.from(m),b=Buffer.from(sign(i+'.'+e));if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;return load('users').find(u=>u.id===i)||null};
const pub=u=>({id:u.id,role:u.role,name:u.name,email:u.email});
const str=(v,max=200)=>String(v??'').trim().slice(0,max);
const E={code:0,msg:''};const fail=(code,msg)=>{throw{code,msg}};

function assess(profile,role){ // weighted match: Σ w·min(level/req,1) / Σ w × 100
  const names=Object.fromEntries(load('skills').map(s=>[s.id,s.name]));
  const items=role.skills.map(r=>{const lvl=Math.max(0,Math.min(3,+profile.skills?.[r.skill]||0));
    const ratio=r.req>0?Math.min(lvl/r.req,1):1;
    const status=lvl>=r.req?'possessed':lvl>0?'improve':'missing';
    return{skill:r.skill,name:names[r.skill]||r.skill,required:r.req,current:lvl,weight:r.weight,ratio,status}});
  const tw=items.reduce((a,i)=>a+i.weight,0)||1;
  const score=Math.round(items.reduce((a,i)=>a+i.weight*i.ratio,0)/tw*1000)/10;
  return{id:uid(),date:new Date().toISOString(),roleId:role.id,roleTitle:role.title,score,items}}

function recommend(userId){
  const prof=load('student-profiles')[userId]||{},list=load('assessments').filter(a=>a.userId===userId);
  const a=list[list.length-1];if(!a)return{assessment:null,resources:[],projects:[]};
  const role=load('job-roles').find(r=>r.id===a.roleId),res=load('resources'),gaps=a.items.filter(i=>i.status!=='possessed').sort((x,y)=>y.weight*(1-y.ratio)-x.weight*(1-x.ratio));
  const out=[];
  for(const g of gaps){const m=res.filter(r=>r.skills.includes(g.skill)&&(g.status==='missing'?r.type!=='practice':r.type!=='course'||r.level!=='Beginner'||g.current===0));
    for(const r of (m.length?m:res.filter(r=>r.skills.includes(g.skill))))
      if(!out.find(o=>o.title===r.title))out.push({...r,forSkill:g.name,reason:g.status==='missing'?'Foundational learning – you have no recorded knowledge yet':'Practice to move from level '+g.current+' to '+g.required})}
  const gapIds=gaps.map(g=>g.skill);
  let projects=(role?.projects||[]).filter(p=>p.skills.some(s=>gapIds.includes(s)));
  if(a.score>=80||!projects.length)projects=role?.projects||[];
  return{assessment:{id:a.id,roleTitle:a.roleTitle,score:a.score},resources:out,projects}}

const api={
 'POST /api/register':async(req,res)=>{const b=await body(req),users=load('users');
  const email=str(b.email,120).toLowerCase(),pw=String(b.password||'');
  if(str(b.name,80).length<2)fail(400,'Enter your full name');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))fail(400,'Enter a valid email address');
  if(pw.length<8||!/\d/.test(pw)||!/[a-zA-Z]/.test(pw))fail(400,'Password needs 8+ characters with letters and numbers');
  if(pw!==b.confirm)fail(400,'Passwords do not match');
  if(users.find(u=>u.email===email))fail(409,'An account with this email already exists');
  const u=mk('student',str(b.name,80),email,pw,{college:str(b.college),programme:str(b.programme),semester:Math.max(1,Math.min(8,+b.semester||1))});
  users.push(u);save('users',users);login(res,u);return[201,pub(u)]},
 'POST /api/login':async(req,res)=>{const b=await body(req),u=load('users').find(u=>u.email===str(b.email).toLowerCase());
  if(!u||!verify(String(b.password||''),u.password))fail(401,'Incorrect email or password');login(res,u);return[200,pub(u)]},
 'POST /api/logout':async(req,res)=>{res.setHeader('Set-Cookie','sid=; HttpOnly; Path=/; Max-Age=0');return[200,{ok:1}]},
 'GET /api/me':async(req,res,u)=>[200,{...pub(u),college:u.college,programme:u.programme,semester:u.semester}],
 'GET /api/skills':async()=>[200,load('skills')],
 'GET /api/roles':async()=>[200,load('job-roles')],
 'GET /api/profile':async(req,res,u)=>[200,load('student-profiles')[u.id]||{skills:{},projects:[],interests:{}}],
 'PUT /api/profile':async(req,res,u)=>{const b=await body(req),all=load('student-profiles'),old=all[u.id]||{},valid=new Set(load('skills').map(s=>s.id));
  const skills={};for(const k in b.skills||{})if(valid.has(k))skills[k]=Math.max(0,Math.min(3,Math.round(+b.skills[k]||0)));
  const projects=(Array.isArray(b.projects)?b.projects:[]).slice(0,20).map(p=>({title:str(p.title,100),description:str(p.description,500),tech:str(p.tech,150),github:/^https?:\/\//.test(p.github)?str(p.github,200):'',contribution:str(p.contribution,300)})).filter(p=>p.title);
  all[u.id]={...old,college:str(b.college),programme:str(b.programme),semester:+b.semester||0,gradYear:+b.gradYear||0,skills,projects,
   interests:{domains:str(b.interests?.domains),goals:str(b.interests?.goals)},targetRole:str(b.targetRole,60)||old.targetRole||''};
  save('student-profiles',all);return[200,all[u.id]]},
 'POST /api/assess':async(req,res,u)=>{const b=await body(req),role=load('job-roles').find(r=>r.id===b.roleId);if(!role)fail(404,'Career role not found');
  const all=load('student-profiles'),prof=all[u.id]||{skills:{}},a={...assess(prof,role),userId:u.id},list=load('assessments');
  list.push(a);save('assessments',list);all[u.id]={...prof,targetRole:role.id};save('student-profiles',all);return[200,a]},
 'GET /api/assessments':async(req,res,u)=>[200,load('assessments').filter(a=>a.userId===u.id).reverse()],
 'GET /api/recommendations':async(req,res,u)=>[200,recommend(u.id)],
 'GET /api/progress':async(req,res,u)=>[200,load('learning-progress')[u.id]||{}],
 'PUT /api/progress':async(req,res,u)=>{const b=await body(req),all=load('learning-progress');
  if(!['planned','progress','done','none'].includes(b.status)||!load('skills').find(s=>s.id===b.skill))fail(400,'Invalid progress update');
  all[u.id]=all[u.id]||{};if(b.status==='none')delete all[u.id][b.skill];else all[u.id][b.skill]=b.status;save('learning-progress',all);return[200,all[u.id]]},
 'GET /api/admin/stats':async()=>{const u=load('users'),a=load('assessments'),c={};a.forEach(x=>c[x.roleTitle]=(c[x.roleTitle]||0)+1);
  return[200,{students:u.filter(x=>x.role==='student').length,assessments:a.length,avgScore:a.length?Math.round(a.reduce((s,x)=>s+x.score,0)/a.length*10)/10:0,byRole:c,roles:load('job-roles').length}]},
 'GET /api/admin/students':async()=>{const pr=load('student-profiles'),as=load('assessments');
  return[200,load('users').filter(u=>u.role==='student').map(u=>({...pub(u),college:u.college,created:u.created,skillsRecorded:Object.keys(pr[u.id]?.skills||{}).length,assessments:as.filter(a=>a.userId===u.id).length}))]},
 'PUT /api/admin/roles':async(req)=>{const r=await body(req),roles=load('job-roles'),valid=new Set(load('skills').map(s=>s.id));
  if(!/^[a-z0-9-]{3,40}$/.test(r.id||'')||str(r.title).length<2||!Array.isArray(r.skills))fail(400,'Role needs a lowercase-hyphen id, a title and a skills list');
  for(const s of r.skills)if(!valid.has(s.skill)||!(s.req>=0&&s.req<=3)||!(s.weight>=1&&s.weight<=5)||![1,2,3].includes(+s.stage))fail(400,'Invalid skill entry: '+s.skill);
  const clean={id:r.id,title:str(r.title,80),category:str(r.category,40),description:str(r.description,400),tools:[].concat(r.tools||[]).map(x=>str(x,40)),prerequisites:[].concat(r.prerequisites||[]).map(x=>str(x,80)),skills:r.skills.map(s=>({skill:s.skill,req:+s.req,weight:+s.weight,stage:+s.stage})),projects:Array.isArray(r.projects)?r.projects:[]};
  const i=roles.findIndex(x=>x.id===r.id);i<0?roles.push(clean):roles[i]=clean;save('job-roles',roles);return[200,clean]}};
function login(res,u){const e=Date.now()+TTL,t=u.id+'.'+e+'.'+sign(u.id+'.'+e);
  res.setHeader('Set-Cookie',`sid=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TTL/1000}${process.env.VERCEL?'; Secure':''}`)}
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json'};
const handler=async(req,res)=>{
 const url=new URL(req.url,'http://x'),key=req.method+' '+url.pathname;
 if(url.pathname.startsWith('/api/')){
  try{const h=api[key];if(!h)return send(res,404,{error:'Not found'});
   const open=['POST /api/register','POST /api/login','POST /api/logout'].includes(key);let u=null;
   if(!open){u=getUser(req);if(!u)return send(res,401,{error:'Please sign in'});
    if(url.pathname.startsWith('/api/admin/')&&u.role!=='admin')return send(res,403,{error:'Administrator access required'});
    if(req.method!=='GET'&&req.headers['x-requested-with']!=='skillpath')return send(res,403,{error:'Blocked request'})} // CSRF guard
   const[code,data]=await h(req,res,u);send(res,code,data)}
  catch(e){e.code?send(res,e.code,{error:e.msg}):(console.error(e),send(res,500,{error:'Something went wrong on the server'}))}return}
 let p=path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[\/\\])+/,'');if(p==='/'||p==='\\')p='/index.html';
 const fp=path.join(P,p);if(!fp.startsWith(P))return send(res,403,{error:'Forbidden'});
 fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':(types[path.extname(fp)]||'application/octet-stream')+'; charset=utf-8','X-Content-Type-Options':'nosniff'});res.end(d)})
};
module.exports=handler;
if(require.main===module)http.createServer(handler).listen(PORT,()=>console.log(`SkillPath running at http://localhost:${PORT}\n Student: student@skillpath.demo / Student@123\n Admin:   admin@skillpath.demo / Admin@123`));
