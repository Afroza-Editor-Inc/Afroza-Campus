import { GRAPHQL_ENDPOINT } from './api';

const AUTH_BASE = 'http://localhost:4000';

export async function register(email:string,password:string,displayName?:string){
  const res = await fetch(`${AUTH_BASE}/auth/register`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,displayName})
  });
  return res.json();
}

export async function login(email:string,password:string){
  const res = await fetch(`${AUTH_BASE}/auth/login`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})
  });
  return res.json();
}
