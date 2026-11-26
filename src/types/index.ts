import type { Request } from "express";

export interface Userdata {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}
export interface RequestUserData extends Request {
    body: Userdata;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RequestLoginData extends Request {
    body: LoginData;
}
