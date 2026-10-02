import {hazards} from './mockData'
const base=import.meta.env.VITE_API_BASE_URL
const wait=(value)=>new Promise(r=>setTimeout(()=>r(value),450))
export async function getHazards(){if(!base)return wait({data:hazards});const r=await fetch(`${base}/hazards`);if(!r.ok)throw new Error('Could not load hazards');return r.json()}
export async function getHazardById(id){if(!base)return wait({data:hazards.find(h=>h.id===id)});const r=await fetch(`${base}/hazards/${id}`);if(!r.ok)throw new Error('Could not load this hazard');return r.json()}
export async function createHazard(payload){if(!base)return wait({data:{...payload,id:`RR-${Math.floor(1000+Math.random()*8999)}`,status:'reported',verificationStatus:'Pending review',reportedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}});const r=await fetch(`${base}/hazards`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(payload)});if(!r.ok)throw new Error('Could not submit report');return r.json()}
