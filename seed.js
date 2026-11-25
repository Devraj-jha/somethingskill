// Default data written to /data/*.json on first run. Edit the JSON files (or use the Admin panel) afterwards.
const S=(id,name,cat)=>({id,name,category:cat});
exports.skills=[S('prog','Programming fundamentals','Programming'),S('dsa','Data structures & algorithms','Programming'),S('oop','Object-oriented design','Programming'),
S('git','Git & GitHub','Tools'),S('linux','Linux & command line','Tools'),S('html','HTML','Frontend'),S('css','CSS & responsive design','Frontend'),S('js','JavaScript','Frontend'),
S('http','HTTP & REST APIs','Backend'),S('node','Server-side development','Backend'),S('auth','Authentication & security basics','Backend'),S('db','Databases & SQL','Databases'),
S('test','Testing & debugging','Tools'),S('deploy','Deployment','Tools'),S('python','Python','Programming'),S('stats','Statistics','Data'),S('excel','Spreadsheets','Data'),
S('pandas','Data wrangling','Data'),S('viz','Data visualisation','Data'),S('net','Computer networks','Security'),S('crypto','Cryptography basics','Security'),
S('vuln','Web vulnerabilities (OWASP)','Security'),S('comm','Communication','Soft skills'),S('team','Teamwork','Soft skills'),S('solve','Problem solving','Soft skills'),S('time','Time management','Soft skills')];
// skills: [skillId, requiredLevel(0-3), weight(1-5), roadmapStage(1-3)]
const R=(id,title,cat,desc,tools,pre,sk,projects)=>({id,title,category:cat,description:desc,tools,prerequisites:pre,skills:sk.map(([skill,req,weight,stage])=>({skill,req,weight,stage})),projects});
exports.roles=[
R('software-developer','Software Developer','Software','Designs, builds and maintains software systems using sound engineering practice.',['Git','VS Code','Docker','Postman'],['Basic programming','Discrete mathematics'],
[['prog',3,5,1],['dsa',2,5,1],['oop',2,4,2],['git',2,3,1],['db',2,3,2],['test',2,3,3],['http',2,2,2],['solve',3,4,1],['team',2,2,3],['comm',2,2,3]],
[{name:'Library management system',description:'CRUD app with search, issue and return rules.',skills:['oop','db'],level:'Intermediate'},{name:'CLI task tracker with tests',description:'Command-line tool with unit tests and clean modules.',skills:['prog','test'],level:'Beginner'},{name:'REST service with CI',description:'Documented API with automated tests and a pipeline.',skills:['http','test','git'],level:'Advanced'}]),
R('web-developer','Web Developer','Web','Builds responsive, accessible websites and full-stack web applications.',['HTML','CSS','JavaScript','Node.js','Git'],['Programming fundamentals'],
[['html',3,4,1],['css',3,4,1],['prog',2,3,1],['js',3,5,2],['git',2,3,2],['http',2,4,2],['db',2,3,2],['node',2,3,3],['auth',2,3,3],['test',2,2,3],['deploy',2,2,3]],
[{name:'Personal portfolio website',description:'Responsive multi-section portfolio with accessible markup.',skills:['html','css'],level:'Beginner'},{name:'Weather dashboard',description:'Fetch API data and render charts and forecasts.',skills:['js','http'],level:'Intermediate'},{name:'Full-stack task manager',description:'Login, tasks and persistence with a REST API.',skills:['node','db','auth'],level:'Advanced'}]),
R('data-analyst','Data Analyst','Data','Turns raw data into insight using statistics, SQL and visualisation.',['Excel','SQL','Python','Pandas','Power BI'],['School-level statistics'],
[['excel',2,3,1],['stats',3,5,1],['python',2,4,1],['db',3,5,2],['pandas',2,4,2],['viz',3,4,2],['comm',3,4,3],['solve',2,3,3]],
[{name:'Sales dashboard in a spreadsheet',description:'Clean data and build pivot tables and charts.',skills:['excel','viz'],level:'Beginner'},{name:'Exploratory analysis notebook',description:'Analyse a public dataset and report findings.',skills:['python','pandas','stats'],level:'Intermediate'},{name:'SQL reporting suite',description:'Design queries answering ten business questions.',skills:['db','viz'],level:'Advanced'}]),
R('cybersecurity-associate','Cybersecurity Associate','Security','Helps protect systems by monitoring, testing and hardening them.',['Wireshark','Nmap','Burp Suite','Linux'],['Operating systems basics'],
[['net',3,5,1],['linux',2,4,1],['prog',1,2,1],['crypto',2,4,2],['vuln',2,5,2],['http',2,3,2],['python',2,3,3],['auth',2,3,3],['comm',2,2,3]],
[{name:'Home network traffic analysis',description:'Capture and explain traffic patterns.',skills:['net','linux'],level:'Beginner'},{name:'Password hashing demo',description:'Compare hashing schemes and salting.',skills:['crypto','auth'],level:'Intermediate'},{name:'Vulnerable app audit',description:'Test a practice app and write a findings report.',skills:['vuln','http'],level:'Advanced'}])];
const C=(skills,type,title,provider,url,level)=>({skills,type,title,provider,url,level});
exports.resources=[
C(['html','css','js','prog'],'course','Responsive Web Design & JavaScript curricula','freeCodeCamp','https://www.freecodecamp.org/learn','Beginner'),
C(['html','css','js','http'],'course','Web technology documentation and guides','MDN Web Docs','https://developer.mozilla.org/en-US/docs/Learn','Beginner'),
C(['prog','dsa','oop','solve'],'course','Introduction to Computer Science (CS50)','Harvard / edX','https://cs50.harvard.edu/x/','Beginner'),
C(['git'],'course','Git documentation: Pro Git book','git-scm.com','https://git-scm.com/book','Beginner'),
C(['python','pandas','stats','viz'],'course','Python, Pandas and Data Visualisation micro-courses','Kaggle Learn','https://www.kaggle.com/learn','Beginner'),
C(['db'],'course','Intro to SQL','Kaggle Learn','https://www.kaggle.com/learn/intro-to-sql','Beginner'),
C(['vuln','auth','crypto'],'course','OWASP Top 10 and cheat sheets','OWASP','https://owasp.org/www-project-top-ten/','Intermediate'),
C(['net','linux','vuln'],'course','Guided security learning paths','TryHackMe','https://tryhackme.com','Beginner'),
C(['dsa','prog','solve'],'practice','Coding practice problems','LeetCode','https://leetcode.com/problemset/','Intermediate'),
C(['js','css','html'],'practice','Front-end challenges','Frontend Mentor','https://www.frontendmentor.io/challenges','Intermediate'),
C(['db','pandas','stats'],'practice','SQL practice exercises','SQLBolt','https://sqlbolt.com','Beginner'),
C(['net','crypto','vuln'],'certification','Security+ (exam objectives)','CompTIA','https://www.comptia.org/certifications/security','Intermediate'),
C(['excel','viz','stats'],'certification','Data analytics professional certificate','Google (Coursera)','https://www.coursera.org/professional-certificates/google-data-analytics','Beginner'),
C(['deploy','node','test'],'certification','Node.js application developer paths','OpenJS Foundation','https://openjsf.org/certification/','Intermediate')];
