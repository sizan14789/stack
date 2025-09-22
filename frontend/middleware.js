import { NextResponse } from "next/server";

export default function middleware(req){
  const token =  req.cookies.get("auth_token")?.value
  
  if(!token) return NextResponse.redirect(new URL('/login', req.url))

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|signup|api).*)",]
};

