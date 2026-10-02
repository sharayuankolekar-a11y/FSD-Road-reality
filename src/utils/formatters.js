export const label=s=>String(s||'').replaceAll('_',' ').replace(/\w/g,c=>c.toUpperCase())
export const ago=d=>{const m=Math.max(1,Math.round((Date.now()-new Date(d))/60000));return m<60?`${m} min ago`:m<1440?`${Math.round(m/60)} hr ago`:`${Math.round(m/1440)} days ago`}
