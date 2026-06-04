// Layout.js
import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{display:'flex', minHeight:'calc(100vh - 68px)'}}>
      <Sidebar />
      <main style={{flex:1, overflowX:'hidden'}}>{children}</main>
    </div>
  );
}