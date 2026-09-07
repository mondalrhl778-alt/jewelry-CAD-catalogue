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
function fileName(extension){ return `${document.getElementById('sku').value.trim().replace(/[^a-z0-9_-]/gi,'-') || 'catalogue-sheet'}-catalogue.${extension}`; }
async function captureSheet(){
  if (!window.html2canvas) throw new Error('The export library did not load. Check your internet connection and refresh the page.');
  return window.html2canvas(document.getElementById('catalogueSheet'), { backgroundColor:'#ffffff', scale:4, useCORS:true, logging:false });
}
async function exportSheet(format){
  const button = format === 'png' ? document.getElementById('generateBtn') : document.getElementById('exportBtn');
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span>◌</span> Preparing download…';
  try {
    const canvas = await captureSheet();
    const image = canvas.toDataURL('image/png');
    if (format === 'png') {
      const link = document.createElement('a');
      link.href = image;
      link.download = fileName('png');
      link.click();
      message('Catalogue PNG downloaded.');
    } else {
      if (!window.jspdf) throw new Error('The PDF library did not load. Check your internet connection and refresh the page.');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:'portrait', unit:'px', format:[canvas.width, canvas.height], hotfixes:['px_scaling'] });
      pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(fileName('pdf'));
      message('Print-ready catalogue PDF downloaded.');
    }
  } catch (error) {
    message(error.message || 'The export could not be created.');
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}
document.getElementById('generateBtn').addEventListener('click',()=>exportSheet('png'));
document.getElementById('exportBtn').addEventListener('click',()=>exportSheet('pdf'));
