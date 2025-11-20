const fs = require('fs');
const path = require('path');
(async ()=>{
  try {
    const root = process.cwd();
    const data = JSON.parse(await fs.promises.readFile(path.join(root,'repo-scan.json'),'utf8'));
    const totalFiles = data.length;
    const byLang = {};
    let binaryCount = 0;
    const todoFiles = [];
    for(const f of data){
      const lang = f.language || 'unknown';
      byLang[lang] = (byLang[lang]||0) + 1;
      if(f.isBinary) binaryCount++;
      if(f.todoCount && f.todoCount>0) todoFiles.push({path:f.path,todos:f.todoCount});
    }
    todoFiles.sort((a,b)=>b.todos-a.todos);
    const biggest = data.slice().filter(f=>typeof f.size==='number').sort((a,b)=>b.size-a.size).slice(0,15);
    const summary = { totalFiles, byLang, binaryCount, todoFiles: todoFiles.slice(0,15), biggest };
    const outPath = path.join(root,'repo-scan-summary.json');
    await fs.promises.writeFile(outPath,JSON.stringify(summary,null,2),'utf8');
    console.log('Wrote',outPath);
  }catch(err){
    console.error(err);
    process.exit(2);
  }
})();
