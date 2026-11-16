import { createClient, type SupabaseClient } from '@supabase/supabase-js';
export type Role='job_seeker'|'recruiter'|'admin';
export type User={id:string;name:string;email:string;role:Role;company?:string};
export type Job={id:string;title:string;company:string;location:string;type:string;salary:string;category:string;featured?:boolean;description:string;skills:string[]};
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const supabase:SupabaseClient|null=url&&key&&!url.includes('YOUR_PROJECT')&&!key.includes('YOUR_')?createClient(url,key):null;
export const demoJobs:Job[]=[
{id:'JH-1042',title:'Junior Data Analyst',company:'Northstar Labs',location:'Ahmedabad, Gujarat',type:'Full-time',salary:'₹3.5–5 LPA',category:'Data & Analytics',featured:true,description:'Turn business data into clear insights. Work with SQL, spreadsheets and dashboards alongside a collaborative analytics team.',skills:['SQL','Excel','Power BI','Python']},
{id:'JH-1041',title:'Frontend Developer',company:'PixelForge Studio',location:'Remote · India',type:'Full-time',salary:'₹4–7 LPA',category:'Engineering',featured:true,description:'Build thoughtful, accessible product experiences with a modern frontend stack.',skills:['React','TypeScript','CSS','REST APIs']},
{id:'JH-1040',title:'Python Developer Intern',company:'Aster Digital',location:'Ahmedabad, Gujarat',type:'Internship',salary:'₹12k–18k / month',category:'Engineering',description:'Join a small product team and contribute to Python services, APIs and internal tools.',skills:['Python','Django','MySQL','Git']},
{id:'JH-1039',title:'Business Operations Associate',company:'Mosaic Commerce',location:'Mumbai, Maharashtra',type:'Full-time',salary:'₹3–4.5 LPA',category:'Operations',description:'Support daily operations, reporting and process improvements across teams.',skills:['Excel','Communication','Reporting']},
{id:'JH-1038',title:'UI/UX Design Intern',company:'Form & Function',location:'Remote · India',type:'Internship',salary:'₹10k–15k / month',category:'Design',description:'Help research, prototype and refine interfaces for a growing SaaS product.',skills:['Figma','Prototyping','Design Systems']},
{id:'JH-1037',title:'Customer Success Executive',company:'CloudHarbor',location:'Pune, Maharashtra',type:'Full-time',salary:'₹3–4 LPA',category:'Customer Success',description:'Help customers get value from the platform through clear guidance and support.',skills:['Communication','CRM','Problem Solving']}
];
export function readSession():User|null{try{return JSON.parse(localStorage.getItem('hirehub_user')||'null')}catch{return null}}
export function writeSession(user:User|null){if(user)localStorage.setItem('hirehub_user',JSON.stringify(user));else localStorage.removeItem('hirehub_user')}
