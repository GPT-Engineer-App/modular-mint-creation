import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backengine-nqhbcnzf.fly.dev/api',
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
