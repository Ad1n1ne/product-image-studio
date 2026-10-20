(function(){'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(s,bad=false){$('status').textContent=s;$('status').classList.toggle('bad',bad);}
function download(name,data,type='text/plain;charset=utf-8'){const b=data instanceof Blob?data:new Blob([data],{type});const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
function csvParse(raw){raw=raw.replace(/^\uFEFF/,'');const rows=[];let row=[],s='',q=false;for(let i=0;i<raw.length;i++){const c=raw[i];if(c==='"'){if(q&&raw[i+1]==='"'){s+='"';i++;}else if(q)q=false;else if(s==='')q=true;else throw Error('CSV 引号格式错误');}else if(c===','&&!q){row.push(s);s='';}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(s);if(row.some(x=>x!==''))rows.push(row);row=[];s='';}else s+=c;}if(q)throw Error('CSV 引号未闭合');row.push(s);if(row.some(x=>x!==''))rows.push(row);return rows;}
function csv(rows){return '\uFEFF'+rows.map(r=>r.map(v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
function table(head,rows){return '<div class="table-wrap"><table><thead><tr>'+head.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function num(id,min=0,max=Infinity){const raw=$(id).value.trim(),v=Number(raw);if(!raw||!Number.isFinite(v)||v<min||v>max)throw Error(($(id).getAttribute('aria-label')||$(id).labels?.[0]?.textContent||id)+'请输入 '+min+' 到 '+(max===Infinity?'合理范围':max)+' 的数字');return v;}
function int(id,min=1,max=10000){const n=num(id,min,max);if(!Number.isInteger(n))throw Error('请输入整数');return n;}
function safeName(s){s=String(s).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/^\.+/,'').replace(/[. ]+$/,'').trim().slice(0,100)||'untitled';return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(s)?'_'+s:s;}
async function imageLoad(file){const u=URL.createObjectURL(file);try{const im=new Image();im.src=u;await im.decode();return im;}finally{URL.revokeObjectURL(u);}}
function canvasBlob(canvas,type='image/png',quality=.85){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片编码失败')),type,quality));}
function click(id,fn){$(id).addEventListener('click',async()=>{const b=$(id);b.disabled=true;try{await fn();}catch(e){status(e.message,true);}finally{b.disabled=false;}});}
function textRead(id,target){$(id).addEventListener('change',async()=>{try{if($(id).files[0])$(target).value=await $(id).files[0].text();status('文件已读取，请继续处理。');}catch(e){status(e.message,true);}});}
async function zipSave(zip,name){download(name,await zip.generateAsync({type:'blob',compression:'DEFLATE'}));}
window.U={$,esc,status,download,csvParse,csv,table,num,int,safeName,imageLoad,canvasBlob,click,textRead,zipSave};
})();
