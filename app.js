const toast = document.getElementById('toast');
function message(text){ toast.textContent=text; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3200); }
const categoryConfig = {
  neckwear: { types:['Pendant','Charm','Locket','Necklace'], labels:['Height','Width','Depth'], values:['22.4','13.8','4.6'], code:'PEN' },
  rings: { types:['Engagement ring','Band ring','Signet ring','Cocktail ring'], labels:['Ring size','Head width','Shank width'], values:['7','8.2','2.1'], code:'RNG' },
  earrings: { types:['Stud earring','Hoop earring','Drop earring','Ear cuff'], labels:['Drop length','Width','Depth'], values:['14.0','7.5','3.8'], code:'EAR' },
  wristwear: { types:['Chain bracelet','Bangle','Cuff bracelet','Tennis bracelet'], labels:['Inner length','Width','Depth'], values:['180','4.2','2.9'], code:'BRC' }
};
const category = document.getElementById('category');
const productType = document.getElementById('productType');
const dimensionFields = document.getElementById('dimensionFields');
const dimensionHeading = document.getElementById('dimensionHeading');
function updateSheet(){
  const type = productType.value || 'Pendant';
  const sku = document.getElementById('sku').value || 'DRAFT';
  const values = [...dimensionFields.querySelectorAll('input')].map(input=>input.value);
  const labels = [...dimensionFields.querySelectorAll('label')].map(label=>label.childNodes[0].textContent.trim());
  document.getElementById('sheetSku').textContent = sku;
  document.getElementById('sheetProductTitle').textContent = `${type} / ${sku}`;
  document.getElementById('sheetDimensions').textContent = labels.map((label,index)=>`${label.toUpperCase()}: ${values[index]} MM`).join('  ·  ');
}
function setCategory(){
  const config = categoryConfig[category.value];
  productType.innerHTML = config.types.map(type=>`<option>${type}</option>`).join('');
  dimensionHeading.textContent = `${productType.value} dimensions`;
  dimensionFields.innerHTML = config.labels.map((label,index)=>`<label>${label}<input value="${config.values[index]}" /></label>`).join('');
  const sku = document.getElementById('sku');
  if (/^(PEN|RNG|EAR|BRC)-\d+$/i.test(sku.value)) sku.value = `${config.code}-214`;
  updateSheet();
}
category.addEventListener('change',()=>{setCategory();message(`${category.options[category.selectedIndex].text} selected — product types and dimensions updated.`);});
productType.addEventListener('change',()=>{dimensionHeading.textContent = `${productType.value} dimensions`;updateSheet();});
document.getElementById('sku').addEventListener('input',updateSheet);
setCategory();
document.getElementById('cadFile').addEventListener('change', e=>{const f=e.target.files[0];if(!f)return;document.getElementById('fileName').textContent=f.name;document.getElementById('fileInfo').textContent=`${(f.size/1024/1024).toFixed(1)} MB · source uploaded`;message('Source geometry added and ready for validation.');});
document.getElementById('generateBtn').addEventListener('click',()=>{const btn=document.getElementById('generateBtn');btn.innerHTML='<span>◌</span> Validating locked geometry…';btn.disabled=true;setTimeout(()=>{btn.innerHTML='<span>✓</span> Catalogue sheet generated';message('Preview generated. The production pipeline will also package SVG, PDF and source manifest.');},1100);});
document.getElementById('exportBtn').addEventListener('click',()=>message('Export package queued: print PDF, SVG technical pack and 4K PNG.'));
