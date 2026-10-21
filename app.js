(() => {
  'use strict';
  const data = window.MUSE_RESULTS;
  const select = document.getElementById('model-select');
  const chart = document.getElementById('results-chart');
  const table = document.getElementById('results-table');
  const fmt = value => value.toFixed(2);
  function updateResults() {
    const model = data.models[select.value];
    const cols = model.open ? ['M3CoT'] : data.benchmarks;
    const index = model.open ? 0 : 4;
    const direct = model.values[0][index], muse = model.values[4][index];
    document.getElementById('score-label').textContent = model.open ? 'M3CoT accuracy' : 'Average accuracy';
    document.getElementById('direct-score').textContent = fmt(direct);
    document.getElementById('muse-score').innerHTML = `${fmt(muse)}<span>%</span>`;
    document.getElementById('gain-score').textContent = `+${fmt(muse - direct)} pp`;
    const chartCols = model.open ? cols : cols.slice(0,4);
    chart.classList.toggle('open-chart', !!model.open);
    chart.innerHTML = chartCols.map((label,i) => `<div class="chart-group"><h4>${label}</h4><div class="bar-row"><div class="bar-fill" style="--width:${model.values[0][i]}%"></div><span class="bar-value">${fmt(model.values[0][i])}</span></div><div class="bar-row muse"><div class="bar-fill" style="--width:${model.values[4][i]}%"></div><span class="bar-value">${fmt(model.values[4][i])}</span></div><div class="bar-axis"><span>0</span><span>100%</span></div></div>`).join('');
    chart.setAttribute('aria-label', `${model.name} accuracy. ${chartCols.map((label,i)=>`${label}: Direct ${fmt(model.values[0][i])}%, MUSE ${fmt(model.values[4][i])}%`).join('. ')}`);
    table.querySelector('caption').textContent = `${model.name}: accuracy (%) by method. ${model.open ? 'M3CoT evaluation.' : 'Main results, mean of three runs.'}`;
    table.querySelector('thead').innerHTML = `<tr><th scope="col">Method</th>${cols.map(label=>`<th scope="col" class="${label==='Avg.'?'average-col':''}">${label}</th>`).join('')}</tr>`;
    table.querySelector('tbody').innerHTML = data.methods.map((method,i)=>`<tr class="${i===4?'muse-row':''}"><th scope="row">${method}${i===4?'<span class="ours-label">Ours</span>':''}</th>${model.values[i].map((v,j)=>`<td class="${!model.open&&j===4?'average-col':''}">${fmt(v)}</td>`).join('')}</tr>`).join('');
    document.getElementById('results-note').textContent = model.open ? 'M3CoT-only transfer check, reported in the manuscript’s appendix.' : 'Mean accuracy over three independent runs, each rebuilding the library. “Avg.” is the unweighted mean across four benchmarks.';
  }
  select.addEventListener('change',updateResults); updateResults();

  const analysisTabs = [...document.querySelectorAll('[data-analysis]')];
  function activateAnalysis(tab) {
    analysisTabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active});
  }
  function wireTabs(tabs, activate) {
    tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{
      let next;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+tabs.length)%tabs.length;
      if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
      if(next!==undefined){e.preventDefault();activate(tabs[next]);tabs[next].focus()}
    })});
  }
  wireTabs(analysisTabs,activateAnalysis);

  const dialog = document.getElementById('figure-dialog');
  const dialogImage = document.getElementById('dialog-image');
  document.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{
    const sourceImage=button.querySelector('img');
    dialogImage.src=button.dataset.zoom;dialogImage.alt=sourceImage.alt;
    dialogImage.parentElement.classList.toggle('is-wide',sourceImage.width/sourceImage.height>1.5);
    document.getElementById('dialog-caption').textContent=button.dataset.caption;
    dialog.showModal();document.body.classList.add('dialog-open');
  }));
  document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
  dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  const links=[...document.querySelectorAll('.site-header nav a')];
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`))})},{rootMargin:'-15% 0px -65% 0px',threshold:0});
  links.forEach(link=>{const section=document.querySelector(link.hash);if(section)observer.observe(section)});
})();
