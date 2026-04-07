import { API_BASE_URL } from './api';

export async function register(email:string,password:string,displayName?:string){
  const res = await fetch(`${API_BASE_URL}/auth/register`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,displayName})
  });
  return res.json();
}

export async function login(email:string,password:string){
  const res = await fetch(`${API_BASE_URL}/auth/login`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})
  });
  return res.json();
}
